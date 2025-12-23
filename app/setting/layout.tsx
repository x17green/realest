import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAppMode } from "@/lib/appMode";

export default async function SettingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check app mode first
  const appMode = getAppMode();
  if (appMode === "coming-soon") {
    redirect("/");
  }

  // Check authentication and role
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user has system_owner role
  const { data: userRole } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!userRole || userRole.role !== "system_owner") {
    redirect("/admin"); // Redirect admins to admin dashboard
  }

  return <div className="min-h-screen bg-gray-950">{children}</div>;
}
