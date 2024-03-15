import { GoogleAnalytics } from '@next/third-parties/google';
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import * as React from "react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Alexey Pelykh",
  description: "Software architect | Solving challenges | Engineer of innovation | Actualizer of crazy ideas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
      <GoogleAnalytics gaId="G-QGWW798BRK" />
    </html>
  );
}
