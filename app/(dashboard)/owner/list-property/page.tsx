import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import { ListPropertyForm } from "@/components/forms";

export default async function ListPropertyPage() {
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <ListPropertyForm userId={user.id} />
      </main>
      <Footer />
    </div>
  );
}
