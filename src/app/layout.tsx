import { GoogleAnalytics } from '@next/third-parties/google';
import { Metadata } from "next";
import { Inter } from "next/font/google";
import * as React from "react";
import { SOCIAL_PROFILES } from "@/lib/constants";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://alexey-pelykh.com"),
  twitter: {
    card: "summary",
    site: "@alexey_pelykh",
    creator: "@alexey_pelykh",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {SOCIAL_PROFILES.map((url) => (
          <link key={url} rel="me" href={url} />
        ))}
      </head>
      <body className={`bg-white dark:bg-black print:bg-white ${inter.className}`}>{children}</body>
      <GoogleAnalytics gaId="G-QGWW798BRK" />
    </html>
  );
}
