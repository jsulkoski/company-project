import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Talent Pipeline | Nexova",
  description: "Candidate management for Nexova People & Talent.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
