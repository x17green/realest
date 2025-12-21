import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import OwnerInquiriesPage from "@/components/dashboard/OwnerInquiriesPage";

export default async function InquiriesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user is a property owner
  const { data: profile } = await supabase
    .from("profiles")
    .select("user_type")
    .eq("id", user.id)
    .single();

  if (profile?.user_type !== "owner") {
    redirect("/");
  }

  // Fetch all inquiries for owner's properties
  const { data: inquiries } = await supabase
    .from("inquiries")
    .select("*, properties(id, title), profiles(full_name, email, phone)")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <OwnerInquiriesPage inquiries={inquiries || []} />
      <Footer />
    </div>
  );
}
