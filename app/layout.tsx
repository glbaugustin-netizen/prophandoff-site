import type { Metadata } from "next";
import { Fira_Sans, Mea_Culpa, Space_Mono } from "next/font/google";
import type { ReactNode } from "react";
import Providers from "./providers";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import LiquidFilters from "@/components/ui/LiquidFilters";
import LiquidBackground from "@/components/ui/LiquidBackground";
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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "PropHandoff — Transfert d'objets en une seconde dans Blender",
    template: "%s · PropHandoff",
  },
  description:
    "PropHandoff est un addon Blender qui keyframe automatiquement le transfert d'un objet entre deux parents, au frame exact. Gratuit.",
  openGraph: {
    title: "PropHandoff",
    description:
      "Passez un objet d'une main à l'autre en une seconde. Addon Blender gratuit.",
    url: SITE_URL,
    siteName: "PropHandoff",
    images: [{ url: "/frames/frame_0060-stop.webp", width: 1920, height: 1080 }],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PropHandoff",
    description: "Addon Blender gratuit pour le transfert d'objets.",
    images: ["/frames/frame_0060-stop.webp"],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="fr"
      className={`${firaSans.variable} ${meaCulpa.variable} ${spaceMono.variable}`}
    >
      <body style={{ background: "#0e1016" }}>
        <LiquidFilters />
        <LiquidBackground />
        <Providers>
          <Navbar />
          <main style={{ position: "relative", zIndex: 1 }}>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
