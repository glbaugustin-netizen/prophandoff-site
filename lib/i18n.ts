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
  meta: { title: string; description: string; ogDescription: string };
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
    stop2: string;
    scroll: string;
    loading: string;
  };
  home: {
    whyEyebrow: string;
    whyTitle: string;
    whyLead: string;
    benefits: { title: string; body: string }[];
    downloadTool: string;
    seeDetails: string;
    blenderChip: string;
  };
  addon: {
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
    eyebrow: string;
    title: string;
    lead: string;
  };
  footer: { changelog: string; github: string };
}

const fr: Dictionary = {
  meta: {
    title: "PropHandoff — Transfert d'objets en une seconde dans Blender",
    description:
      "PropHandoff est un addon Blender qui keyframe automatiquement le transfert d'un objet entre deux parents, au frame exact. Gratuit.",
    ogDescription: "Passez un objet d'une main à l'autre en une seconde. Addon Blender gratuit.",
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
    stop1: "Rigger un objet à un personnage *facilement* en *une seconde*",
    stop2: "Votre rig *sous contrôle*",
    scroll: "SCROLL",
    loading: "Chargement",
  },
  home: {
    whyEyebrow: "Pourquoi",
    whyTitle: "Ce que PropHandoff *change*",
    whyLead:
      "Le transfert d'un objet entre deux mains, deux personnages ou deux props est l'une des opérations les plus pénibles de l'animation Blender. Plus maintenant.",
    benefits: [
      {
        title: "Zéro contrainte à la main",
        body: "Child Of, influence, compensation de transform : PropHandoff génère tout au frame exact. Vous cliquez, c'est keyframé.",
      },
      {
        title: "Lisible sur la timeline",
        body: "Chaque transfert est marqué. Vous voyez d'un coup d'œil qui tient quoi, et quand, sans ouvrir le Graph Editor.",
      },
      {
        title: "Non destructif",
        body: "Un handoff se déplace, se supprime ou se rejoue. Le rig reste propre, aucune constraint fantôme oubliée.",
      },
    ],
    downloadTool: "Télécharger l'outil",
    seeDetails: "Voir les détails",
    blenderChip: "Blender",
  },
  addon: {
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
    eyebrow: "Historique",
    title: "*Changelog*",
    lead: "Toutes les versions publiées, addon par addon.",
  },
  footer: { changelog: "changelog", github: "GitHub ↗" },
};

const en: Dictionary = {
  meta: {
    title: "PropHandoff — Hand off objects in one second in Blender",
    description:
      "PropHandoff is a Blender addon that automatically keyframes the transfer of an object between two parents, on the exact frame. Free.",
    ogDescription: "Pass an object from one hand to the other in one second. Free Blender addon.",
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
    stop1: "Rig an object to a character *easily* in *one second*",
    stop2: "Your rig *under control*",
    scroll: "SCROLL",
    loading: "Loading",
  },
  home: {
    whyEyebrow: "Why",
    whyTitle: "What PropHandoff *changes*",
    whyLead:
      "Handing an object from one hand, character or prop to another is one of the most tedious operations in Blender animation. Not anymore.",
    benefits: [
      {
        title: "Zero constraints by hand",
        body: "Child Of, influence, transform compensation: PropHandoff generates everything on the exact frame. You click, it's keyframed.",
      },
      {
        title: "Readable on the timeline",
        body: "Every handoff is marked. You see at a glance who holds what, and when, without opening the Graph Editor.",
      },
      {
        title: "Non-destructive",
        body: "A handoff can be moved, deleted or replayed. The rig stays clean, no forgotten ghost constraint.",
      },
    ],
    downloadTool: "Download the tool",
    seeDetails: "See details",
    blenderChip: "Blender",
  },
  addon: {
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
