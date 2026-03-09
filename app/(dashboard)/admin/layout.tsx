import { Metadata } from "next";
import { AdminLayout } from "@/components/layout/AdminLayout";

export const metadata: Metadata = {
  title: "Admin Dashboard | RealEST",
  description:
    "RealEST administration panel for property verification, user management, and system analytics.",
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}
