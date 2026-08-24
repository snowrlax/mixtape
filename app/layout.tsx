import type { Metadata } from "next";
import { Geist, Geist_Mono, Miltonian_Tattoo, Gloria_Hallelujah } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const miltonianTattoo = Miltonian_Tattoo({
  variable: "--font-miltonian-tattoo",
  subsets: ["latin"],
  weight: "400",
});

const gloriaHallelujah = Gloria_Hallelujah({
  variable: "--font-gloria-hallelujah",
  subsets: ["latin"],
  weight: "400",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MixTape",
  description: "A short playlist for your Loved Ones!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${miltonianTattoo.variable} ${gloriaHallelujah.variable} antialiased`}
      >
        {children}
      </body>
      <Analytics />
    </html>
  );
}
