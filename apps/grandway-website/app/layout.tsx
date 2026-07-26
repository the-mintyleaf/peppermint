import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Grand Way Education | Study Abroad from Nepal",
  description: "Personal guidance for your study abroad journey.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
