import type { Metadata } from "next";
import { Stack_Sans_Text } from "next/font/google";

import "./globals.css";

const stackSans = Stack_Sans_Text({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "Grandway Education | Study Abroad from Nepal",
    template: "%s | Grandway Education",
  },
  description:
    "Grandway Education gives students in Nepal personal guidance through counselling, applications, scholarships and visas — from first conversation to departure.",
  icons: { icon: "/img/grandway_icon.png" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={stackSans.variable}>
      <body>{children}</body>
    </html>
  );
}
