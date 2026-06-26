import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Great_Vibes, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { siteConfig } from "@/lib/site";

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

/**
 * Comprehensive SEO metadata.
 * Next.js will automatically render <title>, <meta description>,
 * OpenGraph, Twitter cards, canonical, robots and alternates tags.
 */
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} - ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  generator: "Next.js",
  keywords: [
    "God's Grace Boutique",
    "African fashion",
    "boutique Abidjan",
    "fashion Côte d'Ivoire",
    "jewelry Abidjan",
    "clothing Koumassi",
    "shoes",
    "scarves",
    "Ankara",
    "Pagne",
    "Lace",
    "Wristwatch",
    "Wave payment",
    "MTN Money",
    "online boutique Abidjan",
    "mode africaine",
    "boutique en ligne Côte d'Ivoire",
  ],
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  category: "shopping",
  // Canonical + hreflang alternates (tells Google about EN/FR versions)
  alternates: {
    canonical: "/",
    languages: {
      en: "/",
      fr: "/",
      "x-default": "/",
    },
  },
  // Robots: index everything, follow links, show snippets
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  // OpenGraph — for WhatsApp / Facebook / LinkedIn share previews
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["fr_FR"],
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} - ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [
      {
        url: "/images/logo.png",
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} - ${siteConfig.tagline}`,
      },
    ],
  },
  // Twitter cards
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} - ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: ["/images/logo.png"],
    creator: "@godsgraceboutique",
    site: "@godsgraceboutique",
  },
  // Icons & PWA
  icons: {
    icon: [
      { url: "/images/logo.png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/images/logo.png" }],
    shortcut: ["/favicon.ico"],
  },
  manifest: "/manifest.webmanifest",
  // Google Search Console verification (set token in src/lib/site.ts)
  verification: siteConfig.googleSiteVerification
    ? { google: siteConfig.googleSiteVerification }
    : undefined,
  // Geo tagging — helps local search in Abidjan
  other: {
    "geo.region": "CI-AB",
    "geo.placename": "Abidjan",
    "geo.position": "5.3204;-4.0166",
    ICBM: "5.3204, -4.0166",
    "theme-color": "#be185d",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

/**
 * JSON-LD structured data for Google Rich Results.
 * Tells Google this is an online store with a physical location in Abidjan.
 */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": ["ClothingStore", "OnlineStore"],
  "@id": `${siteConfig.url}#organization`,
  name: siteConfig.name,
  alternateName: "God's Grace Boutique Abidjan",
  description: siteConfig.description,
  url: siteConfig.url,
  logo: `${siteConfig.url}/images/logo.png`,
  image: `${siteConfig.url}/images/logo.png`,
  telephone: siteConfig.phone,
  priceRange: "$$",
  currenciesAccepted: "XOF",
  paymentAccepted: "Wave, MTN Money, Cash",
  address: {
    "@type": "PostalAddress",
    streetAddress: siteConfig.address.streetAddress,
    addressLocality: siteConfig.address.addressLocality,
    addressRegion: siteConfig.address.addressRegion,
    addressCountry: siteConfig.address.addressCountry,
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 5.3204,
    longitude: -4.0166,
  },
  areaServed: {
    "@type": "Country",
    name: "Côte d'Ivoire",
  },
  sameAs: [
    siteConfig.social.facebook,
    siteConfig.social.instagram,
    siteConfig.social.twitter,
  ].filter(Boolean),
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      opens: "08:00",
      closes: "19:00",
    },
  ],
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteConfig.url}/?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Structured data for Google Rich Results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${greatVibes.variable} ${playfairDisplay.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
