import type { Metadata } from "next";
import { Geist, Geist_Mono, Great_Vibes, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const greatVibes = Great_Vibes({
  variable: "--font-handwriting",
  subsets: ["latin"],
  weight: "400",
});

const playfairDisplay = Playfair_Display({
  variable: "--font-elegant",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "God's Grace Boutique - Where Elegance Meets Faith",
  description: "Discover our exquisite collection of African-inspired fashion, jewelry, shoes, and accessories at God's Grace Boutique in Koumassi Saint Étienne, Abidjan, Côte d'Ivoire. Quality and affordable fashion for every woman.",
  keywords: ["God's Grace Boutique", "African fashion", "jewelry", "clothing", "shoes", "scarves", "Ankara", "boutique", "Abidjan", "Koumassi", "Côte d'Ivoire"],
  icons: {
    icon: "/images/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${greatVibes.variable} ${playfairDisplay.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
