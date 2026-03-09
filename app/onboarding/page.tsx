import { redirect } from "next/navigation";

export default function OnboardingPage() {
  // This page should not be accessed directly
  // The layout.tsx handles the routing logic
  redirect("/");
}
