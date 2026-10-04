import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import type { ReactNode } from "react";
import Providers from "./providers";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import SupportWidget from "@/components/support/SupportWidget";
import LanguageProvider from "@/components/LanguageProvider";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/locale-server";
import "./globals.css";

// Titres.
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

// Texte courant, libellés, boutons.
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-dm-sans",
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
      className={`${fraunces.variable} ${dmSans.variable}`}
    >
      <body>
        <LanguageProvider initialLocale={locale}>
          <Providers>
            <Navbar />
            <main style={{ position: "relative", zIndex: 1 }}>{children}</main>
            <Footer />
            <SupportWidget />
          </Providers>
        </LanguageProvider>
      </body>
    </html>
  );
}
