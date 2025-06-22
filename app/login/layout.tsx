import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | Next App",
  description: "Login to your account in the Next.js app.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
