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

export interface Faq {
  q: string;
  a: string;
}

export interface Dictionary {
  meta: {
    title: string;
    description: string;
    keywords: string[];
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
    featuresTitle: string;
    features: { title: string; body: string }[];
    useCaseTitle: string;
    useCaseText: string;
    ctaPrimary: string;
    ctaSecondary: string;
    trustLine: string;
    blenderChip: string;
    about: string;
    faqTitle: string;
    faq: Faq[];
  };
  addon: {
    pageTitle: string;
    pageDescription: string;
    h1: string;
    shortDescription: string;
    doesTitle: string;
    installTitle: string;
    installText: string;
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
    title: "PropHandoff — Addon Blender gratuit de transfert de props",
    description:
      "Addon Blender gratuit pour passer des objets entre les mains, rigger des armes à deux mains et keyframer les transferts de props automatiquement. Blender 3.6+.",
    keywords: [
      "addon Blender prop handoff",
      "passer un objet entre les mains Blender",
      "addon animation Blender gratuit",
      "rig arme deux mains Blender",
      "transfert de prop main Blender",
      "animation IK mains Blender",
      "contrainte Child Of Blender",
      "addon animation de personnage Blender",
    ],
    ogTitle: "PropHandoff — Addon Blender gratuit de prop handoff",
    ogDescription:
      "Passez des objets entre les mains en un clic. Prises à deux mains, keyframing automatique, contrôle total de la timeline. Gratuit et open source pour Blender 3.6+.",
    twitterDescription:
      "Passez des objets entre les mains en un clic. Addon Blender gratuit et open source pour les animateurs de personnages.",
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
      "Plus de contraintes Child Of à la main. PropHandoff keyframe le transfert du prop au frame exact que vous avez choisi.",
    stop2: "Votre rig, *sous contrôle*",
    stop2Description:
      "Chaque transfert de prop reste visible et éditable sur votre timeline. Naviguez, ajustez, itérez — sans perdre votre travail d'animation.",
    scroll: "SCROLL",
    loading: "Chargement",
  },
  home: {
    eyebrow: "Addon Blender gratuit",
    h1: "L'addon Blender pour *l'animation de props en main*",
    subtitle:
      "Arrêtez de brûler des heures sur les contraintes Child Of. PropHandoff gère les transferts de props, les prises à deux mains et les lâchers en un clic — et keyframe tout pour vous.",
    featuresTitle: "Tout ce qu'il faut pour *animer des props dans Blender*",
    features: [
      {
        title: "Passez des objets *d'une main à l'autre* instantanément",
        body: "Assignez n'importe quel prop à une main ou à un os au frame courant. PropHandoff keyframe les contraintes automatiquement — sans configuration Child Of manuelle, sans transforms cassés.",
      },
      {
        title: "Système de *rig d'arme à deux mains*",
        body: "Définissez des points de prise sur les épées, fusils, bâtons et props longs. Les deux mains se placent avec un blending IK de proximité fluide, pour une pose lisible à chaque frame.",
      },
      {
        title: "*Contrôle total* de la timeline",
        body: "Chaque transfert de prop apparaît sur votre timeline. Naviguez entre les événements de handoff, revenez en arrière, ajustez un frame — tout depuis la sidebar de Blender.",
      },
    ],
    useCaseTitle: "Conçu pour *les animateurs de personnages et les développeurs de jeux*",
    useCaseText:
      "PropHandoff est fait pour les moments qui dévorent votre temps : un personnage qui dégaine une épée dans son dos, un fusil qui passe d'un port à deux mains à un rechargement à une main, une tasse qu'on se passe à table. Chacun de ces gestes signifie normalement une pile de contraintes Child Of, des keyframes manuels et des transforms cassés quand on scrubbe en arrière. PropHandoff les transforme en un seul clic et garde chaque transfert éditable.",
    ctaPrimary: "Télécharger gratuitement pour Blender 3.6+",
    ctaSecondary: "Voir sur GitHub",
    trustLine: "Gratuit et open source · Licence MIT · Conçu par un animateur de personnages",
    blenderChip: "Blender",
    about:
      "PropHandoff est un addon Blender gratuit et open source pour les animateurs de personnages, les développeurs de jeux et les artistes 3D. Conçu pour rendre les transferts de props, les prises à deux mains et l'animation IK des mains assez rapides pour ne plus y penser.",
    faqTitle: "Questions fréquentes sur *PropHandoff*",
    faq: [
      {
        q: "Qu'est-ce que PropHandoff ?",
        a: "PropHandoff est un addon Blender gratuit et open source qui gère les transferts de props entre les mains d'un personnage. Au lieu de construire des contraintes Child Of à la main pour chaque prise, passage et lâcher, vous assignez un prop à une main au frame courant et l'addon keyframe la configuration des contraintes pour vous.",
      },
      {
        q: "Comment passer un objet d'une main à l'autre dans Blender ?",
        a: "La méthode manuelle consiste à parenter le prop à une main avec une contrainte Child Of, keyframer son influence à zéro au frame du transfert, puis ajouter une seconde contrainte pour l'autre main et keyframer son influence à un — tout en corrigeant l'offset pour que le prop ne saute pas. PropHandoff fait tout cela en un clic : choisissez la main cible, confirmez le frame, et le transfert est keyframé avec les transforms préservés.",
      },
      {
        q: "PropHandoff est-il vraiment gratuit ?",
        a: "Oui. PropHandoff est gratuit et open source. Pas de version payante, pas de filigrane, pas de compte ni de clé de licence. Le code source complet est sur GitHub : vous pouvez le lire, le forker ou l'adapter à votre pipeline.",
      },
      {
        q: "Peut-on rigger une arme à deux mains dans Blender avec PropHandoff ?",
        a: "Oui. Le système de prise à deux mains permet de définir des points de prise sur les props longs comme les épées, fusils et bâtons. Les deux mains se calent sur leurs positions de prise, et le blending IK de proximité empêche la main secondaire de sauter quand le prop bouge.",
      },
      {
        q: "PropHandoff remplace-t-il les contraintes Child Of ?",
        a: "Il ne les remplace pas — il les automatise. PropHandoff construit des contraintes Blender standard, donc votre scène reste lisible pour quiconque l'ouvre sans l'addon, et l'animation continue de fonctionner après export ou passage à un autre artiste.",
      },
      {
        q: "Quelles versions de Blender sont supportées ?",
        a: "PropHandoff est compatible avec Blender 3.6 et plus, dont 4.0, 4.1 et 4.2+.",
      },
      {
        q: "Peut-on modifier ou supprimer un transfert de prop après l'avoir keyframé ?",
        a: "Oui. Chaque transfert de prop apparaît comme un événement dans le panneau timeline. Vous pouvez naviguer entre les événements, revenir à un transfert antérieur et l'ajuster sans reconstruire le reste de votre animation.",
      },
    ],
  },
  addon: {
    pageTitle: "PropHandoff v1.0.0 — Addon Blender gratuit d'animation des mains",
    pageDescription:
      "Téléchargez PropHandoff gratuitement. Keyframez les transferts de props entre les mains, riggez des armes à deux mains et gérez les lâchers depuis la sidebar de Blender. Blender 3.6, 4.0, 4.1, 4.2+.",
    h1: "PropHandoff — Addon Blender *gratuit* de prop handoff",
    shortDescription:
      "Le moyen le plus rapide d'animer des props entre les mains dans Blender. Keyframez transferts, prises à deux mains et lâchers depuis un seul panneau de la sidebar — gratuit et open source.",
    doesTitle: "Ce que PropHandoff *fait*",
    installTitle: "Comment *installer PropHandoff*",
    installText:
      "Téléchargez le .zip depuis GitHub, ouvrez Blender, allez dans Edit → Preferences → Add-ons → Install, sélectionnez le fichier et cochez la case. Le panneau PropHandoff apparaît dans la sidebar de la vue 3D (touche N). Aucune dépendance, aucun compte, aucune clé de licence.",
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
    pageDescription:
      "Historique des versions, nouveautés et corrections de PropHandoff, l'addon Blender gratuit pour les transferts de props en main et les rigs d'armes à deux mains.",
    eyebrow: "Historique",
    title: "*Changelog* PropHandoff",
    lead: "Toutes les versions de PropHandoff, de la plus récente à la plus ancienne. Chaque entrée indique ce qui a changé et les versions de Blender testées.",
  },
  footer: { changelog: "changelog", github: "GitHub ↗" },
};

const en: Dictionary = {
  meta: {
    title: "PropHandoff — Free Blender Addon for Hand Prop Transfer",
    description:
      "Free Blender addon to pass objects between hands, build two-handed weapon rigs and keyframe prop transfers automatically. No Child Of setup. Blender 3.6+.",
    keywords: [
      "Blender prop handoff addon",
      "pass object between hands Blender",
      "Blender animation addon free",
      "two handed weapon rig Blender",
      "Blender hand prop transfer",
      "Blender IK hand animation",
      "Child Of constraint Blender",
      "Blender character animation addon",
    ],
    ogTitle: "PropHandoff — Free Blender Prop Handoff Addon",
    ogDescription:
      "Pass objects between hands in one click. Two-handed grips, automatic keyframing, full timeline control. Free and open source for Blender 3.6+.",
    twitterDescription:
      "Pass objects between hands in one click. Free, open-source Blender addon for character animators.",
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
      "No more manual Child Of constraints. PropHandoff keyframes the hand prop transfer at the exact frame you chose.",
    stop2: "Your rig, *under control*",
    stop2Description:
      "Every prop transfer stays visible and editable on your timeline. Navigate, adjust, iterate — without losing your animation work.",
    scroll: "SCROLL",
    loading: "Loading",
  },
  home: {
    eyebrow: "Free Blender animation addon",
    h1: "The Blender Addon for *Hand Prop Animation*",
    subtitle:
      "Stop burning hours on Child Of constraints. PropHandoff handles prop transfers, two-handed grips and releases in one click — and keyframes everything for you.",
    featuresTitle: "Everything you need to *animate props in Blender*",
    features: [
      {
        title: "Pass objects *between hands instantly*",
        body: "Assign any prop to a hand or bone at the current frame. PropHandoff keyframes the constraints automatically — no manual Child Of setup, no broken transforms.",
      },
      {
        title: "Two-handed *weapon rig system*",
        body: "Define grip points on swords, rifles, staffs and long props. Both hands snap into position with smooth IK proximity blending, so the pose stays readable on every frame.",
      },
      {
        title: "Full *timeline control*",
        body: "Every prop transfer shows up on your timeline. Navigate between handoff events, step back, adjust a frame — all from the Blender sidebar.",
      },
    ],
    useCaseTitle: "Built for *character animators and game developers*",
    useCaseText:
      "PropHandoff was made for the moments that eat your time: a character drawing a sword from its back, a rifle moving from a two-handed carry to a one-handed reload, a mug passed across a table. Each of those normally means a stack of Child Of constraints, manual keyframes and broken transforms when you scrub back. PropHandoff turns them into a single click and keeps every transfer editable.",
    ctaPrimary: "Download Free for Blender 3.6+",
    ctaSecondary: "View on GitHub",
    trustLine: "Free and open source · MIT licensed · Built by a character animator",
    blenderChip: "Blender",
    about:
      "PropHandoff is a free, open-source Blender addon for character animators, game developers and 3D artists. Built to make prop transfers, two-handed grips and hand IK animation fast enough to stop thinking about them.",
    faqTitle: "Frequently asked questions about *PropHandoff*",
    faq: [
      {
        q: "What is PropHandoff?",
        a: "PropHandoff is a free, open-source Blender addon that manages prop transfers between a character's hands. Instead of building Child Of constraints by hand for every pickup, handoff and release, you assign a prop to a hand at the current frame and the addon keyframes the constraint setup for you.",
      },
      {
        q: "How do you pass an object between hands in Blender?",
        a: "The manual method is to parent the prop to one hand with a Child Of constraint, keyframe its influence to zero at the transfer frame, then add a second constraint for the other hand and keyframe its influence to one — while correcting the offset so the prop does not jump. PropHandoff does all of that in one click: pick the target hand, confirm the frame, and the transfer is keyframed with the transforms preserved.",
      },
      {
        q: "Is PropHandoff really free?",
        a: "Yes. PropHandoff is free and open source. There is no paid tier, no watermark, no account and no license key. The full source is on GitHub, so you can read it, fork it or modify it for your own pipeline.",
      },
      {
        q: "Can I rig a two-handed weapon in Blender with PropHandoff?",
        a: "Yes. The two-handed grip system lets you define grip points on long props such as swords, rifles and staffs. Both hands snap to their grip positions, and IK proximity blending keeps the secondary hand from popping when the prop moves.",
      },
      {
        q: "Does PropHandoff replace Child Of constraints?",
        a: "It does not replace them — it automates them. PropHandoff still builds standard Blender constraints under the hood, which means your scene stays readable to anyone who opens it without the addon installed, and the animation keeps working after export or handoff to another artist.",
      },
      {
        q: "Which Blender versions are supported?",
        a: "PropHandoff is compatible with Blender 3.6 and above, including 4.0, 4.1 and 4.2+.",
      },
      {
        q: "Can I edit or remove a prop transfer after it has been keyframed?",
        a: "Yes. Every prop transfer appears as an event on the timeline panel. You can navigate between events, step back to an earlier transfer and adjust it without rebuilding the rest of your animation.",
      },
    ],
  },
  addon: {
    pageTitle: "PropHandoff v1.0.0 — Free Blender Hand Animation Addon",
    pageDescription:
      "Download PropHandoff free. Keyframe prop transfers between hands, build two-handed weapon rigs and manage releases from Blender's sidebar. Blender 3.6, 4.0, 4.1, 4.2+.",
    h1: "PropHandoff — *Free* Blender Prop Handoff Addon",
    shortDescription:
      "The fastest way to animate props between hands in Blender. Keyframe transfers, two-handed grips and releases from a single sidebar panel — free and open source.",
    doesTitle: "What PropHandoff *does*",
    installTitle: "How to *install PropHandoff*",
    installText:
      "Download the .zip from GitHub, open Blender, go to Edit → Preferences → Add-ons → Install, select the file and enable the checkbox. The PropHandoff panel appears in the 3D viewport sidebar under the N-panel. No dependencies, no account, no license key.",
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
    pageDescription:
      "Version history, new features and fixes for PropHandoff, the free Blender addon for hand prop transfers and two-handed weapon rigs.",
    eyebrow: "History",
    title: "PropHandoff *Changelog*",
    lead: "Every release of PropHandoff, newest first. Each entry lists what changed and which Blender versions it was tested against.",
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
