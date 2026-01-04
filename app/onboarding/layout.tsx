import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { useUser } from "@/lib/hooks/useUser";
import { AgentOnboarding, OwnerOnboarding } from "@/components/onboarding";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side user type detection
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Get user profile to determine type
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("user_type")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    // If no profile exists, redirect to profile setup
    redirect("/profile-setup");
  }

  const userType = profile.user_type;

  // Check if user has already completed onboarding
  if (userType === "agent") {
    const { data: agent } = await supabase
      .from("agents")
      .select("id")
      .eq("profile_id", user.id)
      .single();

    if (agent) {
      redirect("/agent");
    }
  } else if (userType === "owner") {
    const { data: owner } = await supabase
      .from("owners")
      .select("id")
      .eq("profile_id", user.id)
      .single();

    if (owner) {
      redirect("/owner");
    }
  } else if (userType === "admin") {
    redirect("/admin");
  } else {
    // For 'user' type or others, redirect to profile
    redirect("/profile");
  }

  return (
    <div className="min-h-screen bg-background">
      {userType === "agent" && <AgentOnboarding />}
      {userType === "owner" && <OwnerOnboarding />}
    </div>
  );
}
