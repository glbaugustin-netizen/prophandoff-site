export interface ChangelogEntry {
  version: string;
  date: string; // ISO
  title: string;
  changes: string[];
}

export interface Addon {
  slug: string;
  name: string;
  version: string;
  tagline: string;
  description: string;
  features: string[];
  blender: string;
  size: string;
  releasedAt: string; // ISO
  changelog: ChangelogEntry[];
}

export const ADDONS: Addon[] = [
  {
    slug: "prop-handoff",
    name: "PropHandoff",
    version: "1.0.0",
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
    blender: "4.2 LTS → 4.5",
    size: "≈ 48 Ko",
    releasedAt: "2026-09-14",
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
];

export function getAddon(slug: string): Addon | undefined {
  return ADDONS.find((a) => a.slug === slug);
}

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
