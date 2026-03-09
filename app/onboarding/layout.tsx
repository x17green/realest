import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AgentOnboarding, OwnerOnboarding } from "@/components/onboarding";

export const metadata: Metadata = {
  title: "Complete Your Profile | RealEST",
  description: "Finish setting up your RealEST account to start listing or browsing verified properties.",
  robots: { index: false, follow: false },
};

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Query public.users — role is the single source of truth (not profiles.user_type)
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userError || !userData) {
    // No users row means account setup is incomplete
    redirect("/login");
  }

  const userType = userData.role;

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
