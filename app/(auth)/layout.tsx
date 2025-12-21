import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication | RealEST",
  description: "Sign in or create your RealEST account to access verified property listings and manage your real estate portfolio.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
