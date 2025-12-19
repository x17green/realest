import { NextResponse } from "next/server"
import { randomBytes } from "crypto"
import { Resend } from "resend"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import { logAdminAction } from "@/lib/audit"
import { generateSubAdminInvitationEmail } from "@/lib/email-templates/subadmin-invitation"

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(request: Request) {
  try {
    const { email, full_name } = (await request.json()) as {
      email?: string
      full_name?: string
    }

    if (!email || !full_name) {
      return NextResponse.json({ error: "Missing email or full_name" }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, user_type, full_name")
      .eq("id", user.id)
      .single()

    if (!profile || profile.user_type !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const service = createServiceClient()

    const securePassword = randomBytes(32).toString("hex")

    // Create the user via admin API (service role)
    const { data: created, error: adminError } = await service.auth.admin.createUser({
      email,
      password: securePassword,
      email_confirm: true,
      user_metadata: {
        full_name,
        user_type: "admin",
      },
    })

    if (adminError) {
      return NextResponse.json({ error: adminError.message }, { status: 500 })
    }

    const newUserId = created.user?.id
    if (!newUserId) {
      return NextResponse.json({ error: "User creation failed" }, { status: 500 })
    }

    // Insert profile row with admin role
    const { error: profileError } = await service
      .from("profiles")
      .insert({
        id: newUserId,
        user_type: "admin",
        full_name,
        email,
      })

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    // Generate password reset link (secure, expires in 24 hours)
    const { data: resetData, error: resetError } = await service.auth.admin.generateLink({
      type: "recovery",
      email,
    })

    if (resetError || !resetData.properties?.action_link) {
      return NextResponse.json({ error: "Failed to generate reset link" }, { status: 500 })
    }

    const resetLink = resetData.properties.action_link

    // Send invitation email via Resend
    const htmlContent = generateSubAdminInvitationEmail({
      email,
      full_name,
      inviter_name: profile.full_name ?? "RealEST Admin",
      reset_link: resetLink,
    })

    await resend.emails.send({
      from: "RealEST Admin <admin@realest.ng>",
      to: email,
      subject: "Welcome to the RealEST Admin Team",
      html: htmlContent,
    })

    // Log the admin action
    await logAdminAction({
      actor_id: user.id,
      action: "create_subadmin",
      target_id: newUserId,
      metadata: { email, full_name },
    })

    return NextResponse.json({ success: true, user_id: newUserId })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
