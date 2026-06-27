/**
 * Central site configuration.
 *
 * Update SITE_URL to your production domain.
 * If you later buy a custom domain (e.g. https://godsgraceboutique.com),
 * change it here once and it propagates to metadata, sitemap, robots,
 * structured data and OpenGraph tags everywhere.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://godsgraceboutique.vercel.app";

export const siteConfig = {
  name: "God's Grace Boutique",
  tagline: "Where Elegance Meets Faith",
  taglineFr: "L'Élégance Rencontre la Foi",
  url: SITE_URL,
  description:
    "Discover our exquisite collection of African-inspired fashion, jewelry, shoes, and accessories at God's Grace Boutique in Koumassi Saint Étienne, Abidjan, Côte d'Ivoire. Quality and affordable fashion for every woman.",
  descriptionFr:
    "Découvrez notre collection exquise de mode inspirée de l'Afrique, bijoux, chaussures et accessoires chez God's Grace Boutique à Koumassi Saint Étienne, Abidjan, Côte d'Ivoire. Une mode de qualité et abordable pour chaque femme.",
  // Contact / business info (also used in JSON-LD structured data)
  phone: "+2250575354633",
  phoneDisplay: "+225 05 75 35 46 33",
  whatsapp: "2250575354633",
  address: {
    streetAddress: "Koumassi Saint Étienne",
    addressLocality: "Abidjan",
    addressCountry: "CI",
    addressRegion: "Abidjan",
    postalCode: "",
  },
  // Social profiles (fill in real handles when available)
  social: {
    facebook: "",
    instagram: "",
    twitter: "",
  },
  // Payment methods
  payment: {
    wave: "+225 0575354633",
    mtn: "+225 0575354633",
  },
  // Categories (used by sitemap and structured data)
  categories: [
    "Female Shoes",
    "Female Clothes",
    "Jewelries",
    "Wristwatch",
    "Scarf",
    "Lace (Clothe)",
    "Pagne (Wrapper)",
  ],
  // Locales
  locales: ["en", "fr"],
  defaultLocale: "en",
  // Optional: paste your Google Search Console verification token here
  // (Google gives you something like: <meta name="google-site-verification" content="ABC123..." />)
  googleSiteVerification: "Y-HPLuSf95-dZAD8",
} as const;

export type SiteConfig = typeof siteConfig;
