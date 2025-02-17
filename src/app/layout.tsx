import { GoogleAnalytics } from '@next/third-parties/google';
import { Inter } from "next/font/google";
import * as React from "react";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`bg-white dark:bg-black print:bg-white ${inter.className}`}>{children}</body>
      <GoogleAnalytics gaId="G-QGWW798BRK" />
    </html>
  );
}
