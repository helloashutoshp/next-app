import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register | Next App",
  description: "Create a new account for the Next.js app.",
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
