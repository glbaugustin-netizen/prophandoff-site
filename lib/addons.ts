import { formatDate as formatDateI18n, type Locale } from "./i18n";

export interface ChangelogEntry {
  version: string;
  date: string; // ISO
  title: string;
  changes: string[];
}

/** Textes traduits d'un addon. */
interface AddonText {
  tagline: string;
  description: string;
  features: string[];
  changelog: ChangelogEntry[];
}

interface AddonSource {
  slug: string;
  name: string;
  version: string;
  blender: string;
  size: string;
  releasedAt: string; // ISO
  text: Record<Locale, AddonText>;
}

/** Addon résolu dans une langue : ce que consomment les pages. */
export interface Addon extends AddonText {
  slug: string;
  name: string;
  version: string;
  blender: string;
  size: string;
  releasedAt: string;
}

const SOURCES: AddonSource[] = [
  {
    slug: "prop-handoff",
    name: "PropHandoff",
    version: "1.0.0",
    blender: "3.6+",
    size: "≈ 48 Ko",
    releasedAt: "2026-09-14",
    text: {
      fr: {
        tagline:
          "Le moyen le plus rapide d'animer des props entre les mains dans Blender. Keyframez transferts, prises à deux mains et lâchers depuis un seul panneau de la sidebar.",
        description:
          "PropHandoff est un addon Blender gratuit de transfert de props : passez un objet d'une main à l'autre, gérez les prises à deux mains (armes, props longs) et les lâchers. Les contraintes Child Of et leurs keyframes sont générés automatiquement au frame exact.",
        features: [
          "Transfert de prop en un clic entre n'importe quel os ou slot de main",
          "Système de prise à deux mains avec blending IK de proximité",
          "Keyframing automatique — aucune contrainte Child Of à configurer à la main",
          "Timeline visuelle avec tous les événements de transfert de prop",
          "Compatible Blender 3.6, 4.0, 4.1, 4.2+",
          "100 % gratuit et open source",
        ],
        changelog: [
          {
            version: "1.0.0",
            date: "2026-09-14",
            title: "Première version",
            changes: [
              "Système de transfert de props (une et deux mains)",
              "Prise à deux mains avec blending IK de proximité",
              "Compatible Blender 3.6+",
            ],
          },
        ],
      },
      en: {
        tagline:
          "The fastest way to animate props between hands in Blender. Keyframe transfers, two-handed grips and releases from a single sidebar panel.",
        description:
          "PropHandoff is a free Blender prop handoff addon: pass an object between hands, manage two-handed grips (weapons, long props) and releases. Child Of constraints and their keyframes are generated automatically on the exact frame.",
        features: [
          "One-click prop transfer between any bone or hand slot",
          "Two-handed grip system with IK proximity blending",
          "Automatic keyframing — no manual Child Of constraint setup",
          "Visual timeline with all prop transfer events",
          "Compatible with Blender 3.6, 4.0, 4.1, 4.2+",
          "100% free and open source",
        ],
        changelog: [
          {
            version: "1.0.0",
            date: "2026-09-14",
            title: "Initial release",
            changes: [
              "Prop transfer system (one and two-handed)",
              "Two-Hand Grip with IK proximity blending",
              "Compatible Blender 3.6+",
            ],
          },
        ],
      },
    },
  },
];

function resolve(src: AddonSource, locale: Locale): Addon {
  const { text, ...base } = src;
  return { ...base, ...text[locale] };
}

/** Tous les addons, dans la langue demandée. */
export function getAddons(locale: Locale): Addon[] {
  return SOURCES.map((s) => resolve(s, locale));
}

export function getAddon(slug: string, locale: Locale): Addon | undefined {
  const src = SOURCES.find((a) => a.slug === slug);
  return src ? resolve(src, locale) : undefined;
}

/** Slugs connus (pour generateStaticParams). */
export const ADDON_SLUGS: string[] = SOURCES.map((s) => s.slug);

export const formatDate = formatDateI18n;
