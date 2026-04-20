import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const SITE_URL = "https://www.isthehormuzstraitopen.net";
const DESCRIPTION =
  "Live answer, updated hourly. Reads BBC, Al Jazeera, Maritime Executive, gCaptain and Google News, checks Brent crude, and shows a giant YES, NO, or KINDA with source links and a live ship map of the strait.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Is the Strait of Hormuz open?",
    template: "%s",
  },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  keywords: [
    "strait of hormuz",
    "strait of hormuz open",
    "strait of hormuz closed",
    "iran oil",
    "tanker traffic",
    "persian gulf shipping",
    "hormuz status",
  ],
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Is the Strait of Hormuz open?",
    title: "Is the Strait of Hormuz open?",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Is the Strait of Hormuz open?",
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <head>
        <link rel="preconnect" href="https://www.marinetraffic.com" />
        <link rel="dns-prefetch" href="https://www.marinetraffic.com" />
        <link rel="preconnect" href="https://query1.finance.yahoo.com" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
