import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FollowCheck — Instagram Analytics",
  description:
    "Analizează arhiva Instagram și descoperă cine nu te urmărește înapoi.",
  applicationName: "FollowCheck",
  keywords: [
    "Instagram",
    "followers",
    "following",
    "analytics",
    "FollowCheck",
  ],
  authors: [
    {
      name: "FollowCheck",
    },
  ],
  openGraph: {
    title: "FollowCheck — Instagram Analytics",
    description:
      "Descoperă cine te urmărește, pe cine urmărești și cine nu te urmărește înapoi.",
    type: "website",
    siteName: "FollowCheck",
  },
  twitter: {
    card: "summary",
    title: "FollowCheck — Instagram Analytics",
    description:
      "Analizează-ți comunitatea Instagram cu FollowCheck.",
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}