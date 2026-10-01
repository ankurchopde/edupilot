import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EduPilot AI — Your learning path, adapted",
  description: "A personalized, evidence-based AI learning platform.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
