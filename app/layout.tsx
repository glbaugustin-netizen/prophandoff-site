import type { Metadata } from "next";
import { Fira_Sans, Mea_Culpa, Space_Mono } from "next/font/google";
import type { ReactNode } from "react";
import Providers from "./providers";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import LiquidFilters from "@/components/ui/LiquidFilters";
import LiquidBackground from "@/components/ui/LiquidBackground";
import LanguageProvider from "@/components/LanguageProvider";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/locale-server";
import "./globals.css";

// Police principale : textes courants et base des titres.
const firaSans = Fira_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-fira",
  display: "swap",
});

// Police manuscrite : uniquement les mots-clés des titres (classe .script).
const meaCulpa = Mea_Culpa({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-mea",
  display: "swap",
});

// Mono d'accent (eyebrows, chips, labels) hérité du style board.
const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://prophandoff-site.vercel.app";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = getDictionary(locale);
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t.meta.title, template: "%s | PropHandoff" },
    description: t.meta.description,
    keywords: t.meta.keywords,
    alternates: { canonical: "/" },
    robots: { index: true, follow: true },
    openGraph: {
      title: t.meta.ogTitle,
      description: t.meta.ogDescription,
      url: SITE_URL,
      siteName: "PropHandoff",
      images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "PropHandoff" }],
      locale: locale === "fr" ? "fr_FR" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t.meta.ogTitle,
      description: t.meta.twitterDescription,
      images: ["/og.jpg"],
    },
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  return (
    <html
      lang={locale}
      className={`${firaSans.variable} ${meaCulpa.variable} ${spaceMono.variable}`}
    >
      <body style={{ background: "#0e1016" }}>
        <LiquidFilters />
        <LiquidBackground />
        <LanguageProvider initialLocale={locale}>
          <Providers>
            <Navbar />
            <main style={{ position: "relative", zIndex: 1 }}>{children}</main>
            <Footer />
          </Providers>
        </LanguageProvider>
      </body>
    </html>
  );
}
