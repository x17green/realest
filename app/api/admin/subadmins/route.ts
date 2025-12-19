import { NextResponse } from "next/server"
import { randomBytes } from "crypto"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"

export async function POST(request: Request) {
  try {
    const { email, full_name, password } = (await request.json()) as {
      email?: string
      full_name?: string
      password?: string
    }

    if (!email || !full_name) {
      return NextResponse.json({ error: "Missing email or full_name" }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, user_type")
      .eq("id", user.id)
      .single()

    if (!profile || profile.user_type !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const service = createServiceClient()

    const securePassword = password ?? randomBytes(16).toString("hex")

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

    // TODO: optionally send an email with a password-reset link rather than raw password
    // For security, do not return the generated password. Admin should trigger email reset.

    return NextResponse.json({ success: true, user_id: newUserId })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
