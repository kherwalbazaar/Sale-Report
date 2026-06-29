import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kherwal Bazaar Sale Managements",
  description: "Sale management system for Kherwal Bazaar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} antialiased`}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: `@font-face { font-family: "Digital7"; src: url("/fonts/digital-7.ttf") format("truetype"); font-weight: normal; font-style: normal; }` }} />
      </head>
      <body className="bg-gray-50 font-sans pb-12">{children}</body>
    </html>
  );
}
