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
    blender: "4.2 LTS → 4.5",
    size: "≈ 48 Ko",
    releasedAt: "2026-09-14",
    text: {
      fr: {
        tagline: "Passez un objet d'une main à l'autre en une seconde.",
        description:
          "PropHandoff automatise le transfert d'un objet entre deux parents dans Blender : contraintes Child Of, keyframes d'influence et compensation de transform sont générés au frame exact, sans rien gérer à la main.",
        features: [
          "Transfert d'objet entre deux parents en un clic",
          "Keyframes d'influence Child Of générés automatiquement au frame courant",
          "Compensation de transform : l'objet ne bouge pas d'un pixel au moment du handoff",
          "Visualisation de chaque transfert directement sur la timeline",
          "Retour arrière et édition non destructive de chaque handoff",
          "Compatible avec les rigs Rigify et custom",
        ],
        changelog: [
          {
            version: "1.0.0",
            date: "2026-09-14",
            title: "Première release publique",
            changes: [
              "Opérateur Handoff : transfert d'un objet vers un nouveau parent au frame courant",
              "Keyframes d'influence Child Of automatiques (0 → 1) avec compensation de transform",
              "Marqueurs de handoff sur la timeline",
              "Panneau latéral N avec l'historique des transferts de l'objet actif",
            ],
          },
        ],
      },
      en: {
        tagline: "Pass an object from one hand to the other in one second.",
        description:
          "PropHandoff automates the transfer of an object between two parents in Blender: Child Of constraints, influence keyframes and transform compensation are generated on the exact frame, with nothing to manage by hand.",
        features: [
          "One-click object transfer between two parents",
          "Child Of influence keyframes generated automatically on the current frame",
          "Transform compensation: the object doesn't move a pixel at the handoff",
          "Every transfer visualised directly on the timeline",
          "Undo and non-destructive editing of each handoff",
          "Works with Rigify and custom rigs",
        ],
        changelog: [
          {
            version: "1.0.0",
            date: "2026-09-14",
            title: "First public release",
            changes: [
              "Handoff operator: transfer an object to a new parent on the current frame",
              "Automatic Child Of influence keyframes (0 → 1) with transform compensation",
              "Handoff markers on the timeline",
              "N-panel with the transfer history of the active object",
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
