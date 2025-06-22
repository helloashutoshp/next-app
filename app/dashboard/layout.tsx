import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Next App",
  description: "User dashboard for managing products and account in the Next.js app.",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
