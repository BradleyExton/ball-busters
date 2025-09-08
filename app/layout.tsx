import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ball Busters - Softball Team Manager",
  description:
    "Manage your softball team lineup, player attendance, and position rotations with fair play algorithms and mobile-friendly design.",
  keywords: "softball, team management, lineup, positions, sports, rotation",
  authors: [{ name: "Bradley Exton" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#D22237",
  openGraph: {
    title: "Ball Busters - Softball Team Manager",
    description:
      "Manage your softball team lineup, player attendance, and position rotations with fair play algorithms.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ball Busters - Softball Team Manager",
    description:
      "Manage your softball team lineup, player attendance, and position rotations with fair play algorithms.",
  },
  robots: {
    index: false,
    follow: false,
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
