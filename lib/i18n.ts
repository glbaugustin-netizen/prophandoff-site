export type Locale = "fr" | "en";

export const LOCALES: readonly Locale[] = ["fr", "en"] as const;
export const DEFAULT_LOCALE: Locale = "fr";
/** Cookie qui mémorise la langue choisie (lu côté serveur et client). */
export const LOCALE_COOKIE = "lang";

export function isLocale(value: unknown): value is Locale {
  return value === "fr" || value === "en";
}

/* ------------------------------------------------------------------ */
/*  Dictionnaire (les titres utilisent la syntaxe *mot* de MixedTitle) */
/* ------------------------------------------------------------------ */

export interface Dictionary {
  meta: {
    title: string;
    description: string;
    keywords: string;
    ogTitle: string;
    ogDescription: string;
    twitterDescription: string;
  };
  nav: {
    home: string;
    addon: string;
    changelog: string;
    dashboard: string;
    signIn: string;
    signInAria: string;
    langAria: string;
  };
  hero: {
    intro: string;
    stop1: string;
    stop1Description: string;
    stop2: string;
    stop2Description: string;
    scroll: string;
    loading: string;
  };
  home: {
    eyebrow: string;
    h1: string;
    subtitle: string;
    features: { title: string; body: string }[];
    ctaPrimary: string;
    ctaSecondary: string;
    blenderChip: string;
    about: string;
  };
  addon: {
    pageTitle: string;
    pageDescription: string;
    h1: string;
    free: string;
    download: string;
    viewGithub: string;
    features: string;
    changelog: string;
    sheet: string;
    downloadFree: string;
    compatibility: string;
    size: string;
    lastUpdate: string;
    license: string;
  };
  dashboard: {
    account: string;
    title: string;
    signOut: string;
    downloads: string;
    empty: string;
    discover: string;
    user: string;
  };
  signIn: {
    eyebrow: string;
    title: string;
    lead: string;
    google: string;
    note: string;
    pageTitle: string;
  };
  changelog: {
    pageTitle: string;
    pageDescription: string;
    eyebrow: string;
    title: string;
    lead: string;
  };
  footer: { changelog: string; github: string };
}

const fr: Dictionary = {
  meta: {
    title: "PropHandoff — Addon Blender pour l'animation des mains",
    description:
      "Addon Blender gratuit pour passer des objets entre les mains, gérer les prises à deux mains et les transferts de props. Gagnez des heures de contraintes manuelles.",
    keywords:
      "addon blender, prop handoff, animation des mains, addon blender gratuit, rig arme deux mains, mains IK blender, transfert de prop blender",
    ogTitle: "PropHandoff — Addon Blender d'animation de props",
    ogDescription: "Passez des objets entre les mains en un clic. Addon Blender gratuit.",
    twitterDescription: "Addon Blender gratuit pour gérer les transferts de props entre les mains.",
  },
  nav: {
    home: "Accueil",
    addon: "Addon",
    changelog: "Changelog",
    dashboard: "Dashboard",
    signIn: "Se connecter",
    signInAria: "Se connecter",
    langAria: "Langue du site",
  },
  hero: {
    intro: "PropHandoff",
    stop1: "Passer un prop *en un clic*",
    stop1Description:
      "Plus de contraintes Child Of à la main. PropHandoff keyframe le transfert automatiquement, au frame exact.",
    stop2: "Votre rig, *sous contrôle*",
    stop2Description:
      "Chaque transfert de prop est visible sur votre timeline. Naviguez, ajustez, itérez — sans perdre votre travail.",
    scroll: "SCROLL",
    loading: "Chargement",
  },
  home: {
    eyebrow: "Addon Blender gratuit",
    h1: "L'addon Blender pour *l'animation des mains*",
    subtitle:
      "Arrêtez de perdre des heures sur les contraintes Child Of. PropHandoff gère les transferts de props, les prises à deux mains et les lâchers — en un clic.",
    features: [
      {
        title: "Passez des objets *instantanément*",
        body: "Assignez n'importe quel prop à une main au frame courant. PropHandoff keyframe les contraintes automatiquement — sans configuration Child Of manuelle.",
      },
      {
        title: "Système de *prise à deux mains*",
        body: "Définissez des points de prise sur les armes et les props longs. Les deux mains se placent avec un blending IK fluide.",
      },
      {
        title: "*Contrôle total* de la timeline",
        body: "Visualisez chaque transfert de prop sur votre timeline. Naviguez entre les événements, revenez en arrière, ajustez — depuis la sidebar.",
      },
    ],
    ctaPrimary: "Télécharger gratuitement pour Blender 3.6+",
    ctaSecondary: "Voir sur GitHub",
    blenderChip: "Blender",
    about:
      "PropHandoff est un addon Blender gratuit et open source pour les animateurs. Conçu pour les animateurs de personnages, les développeurs de jeux et les artistes 3D.",
  },
  addon: {
    pageTitle: "PropHandoff v1.0.0 — Addon Blender gratuit d'animation des mains",
    pageDescription:
      "Téléchargez PropHandoff gratuitement. Gérez les transferts de props entre les mains, les prises à deux mains et les lâchers directement dans la sidebar de Blender. Compatible Blender 3.6+.",
    h1: "PropHandoff — Addon Blender *gratuit*",
    free: "gratuit",
    download: "Télécharger",
    viewGithub: "Voir sur GitHub",
    features: "Fonctionnalités",
    changelog: "Changelog",
    sheet: "FICHE · ADDON",
    downloadFree: "Téléchargez *gratuitement*",
    compatibility: "Compatibilité",
    size: "Taille",
    lastUpdate: "Dernière mise à jour",
    license: "Licence",
  },
  dashboard: {
    account: "Compte",
    title: "Votre *espace*",
    signOut: "Se déconnecter",
    downloads: "Mes téléchargements",
    empty: "Aucun téléchargement pour le moment.",
    discover: "Découvrir",
    user: "Utilisateur",
  },
  signIn: {
    eyebrow: "Compte · Gratuit",
    title: "Bienvenue sur *PropHandoff*",
    lead: "Connectez-vous pour retrouver vos téléchargements et être prévenu des mises à jour.",
    google: "Continuer avec Google",
    note: "Aucun mot de passe · aucune newsletter",
    pageTitle: "Connexion",
  },
  changelog: {
    pageTitle: "Changelog — Addon Blender PropHandoff",
    pageDescription: "Historique des versions et mises à jour de l'addon Blender PropHandoff.",
    eyebrow: "Historique",
    title: "*Changelog*",
    lead: "Toutes les versions publiées, addon par addon.",
  },
  footer: { changelog: "changelog", github: "GitHub ↗" },
};

const en: Dictionary = {
  meta: {
    title: "PropHandoff — Blender Addon for Hand Animation",
    description:
      "Free Blender addon to pass objects between hands, manage two-handed grips and prop transfers. Save hours of manual constraint work.",
    keywords:
      "blender addon, prop handoff, hand animation, blender free addon, two handed weapon rig, IK hands blender, blender hand prop transfer",
    ogTitle: "PropHandoff — Blender Prop Animation Addon",
    ogDescription: "Pass objects between hands in one click. Free Blender addon.",
    twitterDescription: "Free Blender addon to manage prop transfers between hands.",
  },
  nav: {
    home: "Home",
    addon: "Addon",
    changelog: "Changelog",
    dashboard: "Dashboard",
    signIn: "Sign in",
    signInAria: "Sign in",
    langAria: "Site language",
  },
  hero: {
    intro: "PropHandoff",
    stop1: "Pass a prop *in one click*",
    stop1Description:
      "No more manual Child Of constraints. PropHandoff keyframes the transfer automatically at the exact frame.",
    stop2: "Your rig, *under control*",
    stop2Description:
      "Every prop transfer is visible on your timeline. Navigate, adjust, iterate — without losing your work.",
    scroll: "SCROLL",
    loading: "Loading",
  },
  home: {
    eyebrow: "Free Blender animation addon",
    h1: "The Blender Addon for *Hand Animation*",
    subtitle:
      "Stop wasting hours on Child Of constraints. PropHandoff handles prop transfers, two-handed grips and releases — in one click.",
    features: [
      {
        title: "Pass objects *instantly*",
        body: "Assign any prop to a hand at the current frame. PropHandoff keyframes the constraints automatically — no manual Child Of setup.",
      },
      {
        title: "Two-handed *grip system*",
        body: "Define grip points on weapons and long props. Both hands snap to position with smooth IK blending.",
      },
      {
        title: "Full *timeline control*",
        body: "See every prop transfer on your timeline. Navigate between events, go back, adjust — all from the sidebar.",
      },
    ],
    ctaPrimary: "Download Free for Blender 3.6+",
    ctaSecondary: "View on GitHub",
    blenderChip: "Blender",
    about:
      "PropHandoff is a free, open-source Blender addon for animators. Built for character animators, game developers and 3D artists.",
  },
  addon: {
    pageTitle: "PropHandoff v1.0.0 — Free Blender Hand Animation Addon",
    pageDescription:
      "Download PropHandoff free. Manage prop transfers between hands, two-handed grips and releases directly in Blender's sidebar. Compatible Blender 3.6+.",
    h1: "PropHandoff — *Free* Blender Addon",
    free: "free",
    download: "Download",
    viewGithub: "View on GitHub",
    features: "Features",
    changelog: "Changelog",
    sheet: "ADDON · SHEET",
    downloadFree: "Download it *for free*",
    compatibility: "Compatibility",
    size: "Size",
    lastUpdate: "Last update",
    license: "License",
  },
  dashboard: {
    account: "Account",
    title: "Your *space*",
    signOut: "Sign out",
    downloads: "My downloads",
    empty: "No downloads yet.",
    discover: "Discover",
    user: "User",
  },
  signIn: {
    eyebrow: "Account · Free",
    title: "Welcome to *PropHandoff*",
    lead: "Sign in to find your downloads and get notified about updates.",
    google: "Continue with Google",
    note: "No password · no newsletter",
    pageTitle: "Sign in",
  },
  changelog: {
    pageTitle: "Changelog — PropHandoff Blender Addon",
    pageDescription: "Version history and updates for the PropHandoff Blender addon.",
    eyebrow: "History",
    title: "*Changelog*",
    lead: "Every published version, addon by addon.",
  },
  footer: { changelog: "changelog", github: "GitHub ↗" },
};

export const DICTIONARIES: Record<Locale, Dictionary> = { fr, en };

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}

/** Date lisible dans la langue courante (ex. « 14 septembre 2026 »). */
export function formatDate(iso: string, locale: Locale): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
