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
    version: "0.3.3",
    blender: "4.2+",
    size: "≈ 61 Ko",
    releasedAt: "2026-09-23",
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
          "Compatible Blender 4.2 et plus (développé et testé sur 5.2)",
          "Lancers en parabole et limite d'allonge des bras",
          "100 % gratuit et open source (GPL-3.0)",
        ],
        changelog: [
          {
            version: "0.3.3",
            date: "2026-09-23",
            title: "Première version publique",
            changes: [
              "Transferts : Setup Prop, assignation à une main, Release en espace monde et Throw en parabole",
              "Two-Hand Grip : Grip Zone par proximité (drivers), Attach keyframé des deux mains, Master Hand et limite d'allonge",
              "Historique des transferts reconstruit depuis les F-Curves et navigable",
              "Plusieurs props simultanés, chacun avec ses slots, contraintes et historique",
              "Deux paquets : add-on classique et extension Blender",
              "Blender 4.2 minimum, développé et testé sur Blender 5.2",
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
          "Compatible with Blender 4.2 and later (developed and tested on 5.2)",
          "Parabolic throws and arm reach limits",
          "100% free and open source (GPL-3.0)",
        ],
        changelog: [
          {
            version: "0.3.3",
            date: "2026-09-23",
            title: "First public release",
            changes: [
              "Transfers: Setup Prop, assign to a hand, world-space Release and parabolic Throw",
              "Two-Hand Grip: proximity Grip Zone (drivers), keyframed Attach of both hands, Master Hand and arm reach limit",
              "Transfer history rebuilt from the F-Curves and navigable",
              "Several props at once, each with its own slots, constraints and history",
              "Two packages: classic add-on and Blender extension",
              "Blender 4.2 minimum, developed and tested on Blender 5.2",
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
