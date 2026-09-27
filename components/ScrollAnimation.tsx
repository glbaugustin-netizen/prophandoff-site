"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  STOP1_VH,
  STOP2_VH,
  TOTAL_VH,
  ZONE1_VH,
  ZONE2_VH,
  clamp01,
  getFrameIndex,
  getLocal,
  getSegment,
  useScrollProgress,
} from "../hooks/useScrollProgress";
import { MixedTitle } from "./ui/MixedTitle";
import { useLang } from "./LanguageProvider";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface StopContent {
  frame: number;
  /** Titre (syntaxe *mot* pour le manuscrit). */
  title: string;
  /** Phrase courte sous le titre (texte brut, sans panneau). */
  description?: string;
  /**
   * Ton du texte selon la frame : "light" sur une image sombre (défaut),
   * "dark" sur une image claire.
   */
  tone?: "light" | "dark";
}

export interface IntroContent {
  /** Titre h1 affiché au tout début, centré, seul (syntaxe *mot* possible). */
  title: string;
}

export interface ScrollAnimationProps {
  /** Titre d'ouverture, s'efface sur les premiers vh de scroll. */
  intro?: IntroContent;
  stop1: StopContent;
  stop2: StopContent;
  /** Nombre total de frames (défaut : 110). */
  frameCount?: number;
  /** Dossier public des frames (défaut : "/frames"). */
  framesPath?: string;
  /** Extension des fichiers (défaut : "webp"). */
  extension?: string;
  /** Id de la section vers laquelle le bouton SKIP fait descendre. */
  skipTargetId?: string;
  /**
   * Inertie du scroll en secondes (défaut : 0.18). Les frames continuent de
   * glisser en ralentissant après l'arrêt du scroll. 0 = aucun lissage.
   */
  smoothing?: number;
}

/* ------------------------------------------------------------------ */
/*  Constantes                                                         */
/* ------------------------------------------------------------------ */

const HERO_BG = "#1a120c"; // le rendu est sombre : seule cette section l'est
const EXIT_BG = "#eee6d8"; // sable : couleur de la page qui suit
const FADE_IN_VH = 30; // fade in du texte sur les 30 premiers vh du stop
const FADE_OUT_VH = 15; // fade out sur les derniers vh du stop 1
const INTRO_FADE_VH = 12; // fade out du titre d'intro

/** Transition de sortie : bandeau typographique qui défile en sens inverse. */
const MARQUEE_WORD = "PROP HANDOFF";
const MARQUEE_LINES = 24; // réparties sur 260vh : la colonne couvre toujours l'écran
const MARQUEE_SHIFT_VH = 40; // course de chaque colonne sur la transition
const SKIP_FADE_VH = 30; // le bouton SKIP s'efface sur la fin de la zone 2

/** Id de la section (utilisé par HeroSkip pour se positionner dessous). */
export const HERO_SECTION_ID = "hero";
/** Clé sessionStorage posée quand l'animation a été scrollée jusqu'au bout. */
export const HERO_DONE_KEY = "prophandoff:hero-done";

const pad4 = (n: number): string => String(n).padStart(4, "0");

/** Charge une image ; résout `null` si elle n'existe pas (404). */
function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

const PAPER = "#fffdf8";
const INK = "#2a1d14";

const headingStyle: CSSProperties = {
  margin: 0,
  fontSize: "clamp(2.4rem, 5.2vw, 4.8rem)",
  lineHeight: 1.05,
  letterSpacing: "-.035em",
  fontWeight: 700,
  color: PAPER,
  textShadow: `3px 3px 0 ${INK}`,
  textWrap: "balance",
};

/** Overlay d'un stop : centré verticalement sur une moitié de l'écran. */
const overlayWrapStyle = (opacity: number, side: "left" | "right"): CSSProperties => ({
  position: "absolute",
  top: 0,
  [side]: 0,
  width: "50%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  padding: "0 clamp(20px, 5vw, 64px)",
  boxSizing: "border-box",
  opacity,
  pointerEvents: "none",
  zIndex: 2,
});

/** Le bloc titre + description glisse légèrement vers le haut en apparaissant. */
const overlayBlockStyle = (opacity: number): CSSProperties => ({
  maxWidth: "min(560px, 100%)",
  transform: `translateY(${((1 - opacity) * 28).toFixed(1)}px)`,
});

const overlayTitleStyle = (tone: "light" | "dark"): CSSProperties => ({
  ...headingStyle,
  maxWidth: "14ch",
  color: tone === "dark" ? INK : PAPER,
  textShadow: tone === "dark" ? `3px 3px 0 ${PAPER}` : `3px 3px 0 ${INK}`,
});

const marqueeLineStyle: CSSProperties = {
  display: "block",
  textAlign: "center",
  whiteSpace: "nowrap",
  fontSize: "min(8vh, 7vw)",
  fontWeight: 700,
  lineHeight: 1.04,
  letterSpacing: "-0.03em",
};

const marqueeSolidStyle: CSSProperties = {
  ...marqueeLineStyle,
  color: INK,
};

/** Une ligne sur deux en contour : donne de la matière sans surcharger. */
const marqueeOutlineStyle: CSSProperties = {
  ...marqueeLineStyle,
  color: "transparent",
  WebkitTextStroke: `2px ${INK}`,
};

const overlayTextStyle = (tone: "light" | "dark"): CSSProperties => ({
  margin: "18px 0 0",
  maxWidth: "44ch",
  fontSize: "clamp(1rem, 1.3vw, 1.15rem)",
  fontWeight: 600,
  lineHeight: 1.5,
  color: tone === "dark" ? INK : PAPER,
  textShadow: tone === "dark" ? "none" : `2px 2px 0 ${INK}`,
});

/* ------------------------------------------------------------------ */
/*  Composant                                                          */
/* ------------------------------------------------------------------ */

export default function ScrollAnimation({
  intro,
  stop1,
  stop2,
  frameCount = 110,
  framesPath = "/frames",
  extension = "webp",
  skipTargetId = "addon",
  smoothing = 0.18,
}: ScrollAnimationProps) {
  const { t } = useLang();
  const tone1 = stop1.tone ?? "light";
  const tone2 = stop2.tone ?? "light";
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Cache des images : index 1-based → image (undefined si pas encore chargée).
  const framesRef = useRef<Array<HTMLImageElement | undefined>>([]);
  const lastDrawnRef = useRef<number>(-1);

  const [ready, setReady] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);

  const lastFrame = stop2.frame > 0 ? stop2.frame : frameCount;

  /* ---------------- URLs ---------------- */

  const frameUrl = useCallback(
    (i: number, stop = false): string =>
      `${framesPath}/frame_${pad4(i)}${stop ? "-stop" : ""}.${extension}`,
    [framesPath, extension],
  );

  /* ---------------- Rendu canvas ---------------- */

  const draw = useCallback((index: number): void => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Si la frame demandée n'est pas encore décodée, on prend la plus
    // proche déjà disponible en dessous (puis au-dessus).
    const frames = framesRef.current;
    let img = frames[index];
    if (!img) {
      for (let i = index - 1; i >= 1 && !img; i--) img = frames[i];
      for (let i = index + 1; i < frames.length && !img; i++) img = frames[i];
    }
    if (!img) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const pw = Math.round(w * dpr);
    const ph = Math.round(h * dpr);
    if (canvas.width !== pw || canvas.height !== ph) {
      canvas.width = pw;
      canvas.height = ph;
    }

    // object-fit: cover
    const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    const dx = (w - dw) / 2;
    const dy = (h - dh) / 2;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, dx, dy, dw, dh);
  }, []);

  /* ---------------- Boucle rAF (fournie par le hook) ---------------- */

  const onFrame = useCallback(
    (p: number): void => {
      const index = getFrameIndex(p, stop1.frame, lastFrame);
      // drawImage uniquement si l'index a changé (ou si un resize /
      // une nouvelle frame décodée a invalidé le rendu : lastDrawnRef = -1).
      if (index === lastDrawnRef.current) return;
      lastDrawnRef.current = index;
      draw(index);
    },
    [draw, stop1.frame, lastFrame],
  );

  const { progress } = useScrollProgress(sectionRef, onFrame, { smoothing });

  // Une fois l'animation vue jusqu'au bout, on s'en souvient pour la session :
  // les retours sur l'accueil se positionnent directement sous le hero.
  useEffect(() => {
    if (progress < 0.999) return;
    try {
      window.sessionStorage.setItem(HERO_DONE_KEY, "1");
    } catch {
      /* stockage indisponible : on ignore */
    }
  }, [progress]);

  // Un resize invalide le rendu courant → redraw au prochain tick.
  useEffect(() => {
    const onResize = (): void => {
      lastDrawnRef.current = -1;
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* ---------------- Preload en deux passes ---------------- */

  useEffect(() => {
    let cancelled = false;
    framesRef.current = new Array<HTMLImageElement | undefined>(lastFrame + 1);
    lastDrawnRef.current = -1;
    setReady(false);
    setLoadProgress(0);

    const keyFrames = Array.from(
      new Set(
        [1, 30, stop1.frame, 90, lastFrame].filter((n) => n >= 1 && n <= lastFrame),
      ),
    ).sort((a, b) => a - b);

    /**
     * Charge une frame. Pour les frames de stop, on tente d'abord
     * `frame_XXXX-stop.<ext>` (détection par le nom) puis on retombe
     * sur la frame normale si le fichier "-stop" n'existe pas.
     */
    const loadFrame = async (i: number): Promise<void> => {
      if (framesRef.current[i]) return;
      const isStop = i === stop1.frame || i === stop2.frame;
      let img: HTMLImageElement | null = null;
      if (isStop) img = await loadImage(frameUrl(i, true));
      if (!img) img = await loadImage(frameUrl(i));
      if (cancelled || !img) return;
      framesRef.current[i] = img;
      // Si une frame de substitution est affichée, forcer un redraw.
      lastDrawnRef.current = -1;
    };

    const run = async (): Promise<void> => {
      // Passe 1 : frames clés (immédiat), avec progress bar.
      let done = 0;
      await Promise.all(
        keyFrames.map(async (i) => {
          await loadFrame(i);
          done += 1;
          if (!cancelled) setLoadProgress(done / keyFrames.length);
        }),
      );
      if (cancelled) return;
      setReady(true);

      // Passe 2 : toutes les autres, dans l'ordre 1 → N, par petits lots
      // pour respecter l'ordre sans saturer le réseau.
      const CONCURRENCY = 4;
      for (let i = 1; i <= lastFrame && !cancelled; i += CONCURRENCY) {
        const batch: Promise<void>[] = [];
        for (let j = i; j < i + CONCURRENCY && j <= lastFrame; j++) {
          batch.push(loadFrame(j));
        }
        await Promise.all(batch);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [frameUrl, lastFrame, stop1.frame, stop2.frame]);

  /* ---------------- Valeurs dérivées du progress ---------------- */

  const derived = useMemo(() => {
    const segment = getSegment(progress);

    // Intro : visible au repos, s'efface sur les 12 premiers vh de la zone 1.
    const introOpacity = 1 - clamp01((getLocal(progress, "zone1") * ZONE1_VH) / INTRO_FADE_VH);

    // Stop 1 : fade in sur les 30 premiers vh, fade out sur les 15 derniers.
    // Fonction pure du scroll → le retour arrière fait le fade out naturellement.
    const s1 = getLocal(progress, "stop1") * STOP1_VH; // en vh
    const stop1Opacity =
      segment === "stop1"
        ? clamp01(s1 / FADE_IN_VH) * clamp01((STOP1_VH - s1) / FADE_OUT_VH)
        : 0;

    // Stop 2 : fade in sur les 30 premiers vh, reste à 1, puis fade out
    // pendant la première moitié de la transition (la vague recouvre).
    const s2 = getLocal(progress, "stop2") * STOP2_VH;
    const transition = getLocal(progress, "transition");
    let stop2Opacity = 0;
    if (segment === "stop2") stop2Opacity = clamp01(s2 / FADE_IN_VH);
    else if (segment === "transition") stop2Opacity = 1 - clamp01(transition / 0.35);

    const scrollIndicatorOpacity = Math.max(stop1Opacity, stop2Opacity);

    // Sortie : l'image s'assombrit progressivement (ease-in-out) jusqu'au fond
    // du site, pendant qu'une barre droite monte depuis le bas pour finir
    // exactement dans la couleur de la section suivante.
    // L'assombrissement est plus rapide que la transition pour que le bandeau
    // typographique se lise sur un fond déjà sombre.
    const dark = clamp01(transition / 0.6);
    const fadeOpacity = dark < 0.5 ? 2 * dark * dark : 1 - Math.pow(-2 * dark + 2, 2) / 2;

    // Bandeau : apparaît vite, défile, puis s'efface avant que la barre couvre.
    const marqueeOpacity =
      segment === "transition"
        ? clamp01(transition / 0.18) * (1 - clamp01((transition - 0.7) / 0.3))
        : 0;
    const marqueeShift = transition * MARQUEE_SHIFT_VH;

    // La barre part plus tard et son bord haut est dégradé : au lieu d'un
    // rectangle net qui coupe l'écran, le gris monte en fondu.
    const barProgress = clamp01((transition - 0.2) / 0.8);
    // SKIP : visible tant que l'animation avance, disparu à la dernière frame.
    const z2 = getLocal(progress, "zone2") * ZONE2_VH; // en vh
    const skipOpacity =
      segment === "zone1" || segment === "stop1"
        ? 1
        : segment === "zone2"
          ? 1 - clamp01((z2 - (ZONE2_VH - SKIP_FADE_VH)) / SKIP_FADE_VH)
          : 0;

    // La barre de navigation réapparaît quand le bandeau se met à défiler.
    const navVisible = segment === "transition";

    const barActive = segment === "transition" && barProgress > 0;
    const barTranslate = `translateY(-${(barProgress * 100).toFixed(3)}vh)`;

    return {
      introOpacity,
      stop1Opacity,
      stop2Opacity,
      scrollIndicatorOpacity,
      fadeOpacity,
      skipOpacity,
      navVisible,
      marqueeOpacity,
      marqueeShift,
      barOpacity: barActive ? 1 : 0,
      barTranslate,
    };
  }, [progress]);

  // La nav est masquée pendant l'animation et revient avec le bandeau.
  // On passe par un attribut sur <body> : la Navbar n'a rien à recalculer.
  useEffect(() => {
    document.body.dataset.heroNav = derived.navVisible ? "visible" : "hidden";
  }, [derived.navVisible]);

  useEffect(() => {
    return () => {
      delete document.body.dataset.heroNav;
    };
  }, []);

  /* ---------------- Rendu ---------------- */

  return (
    <section
      ref={sectionRef}
      id={HERO_SECTION_ID}
      style={{ height: `${TOTAL_VH}vh`, position: "relative", background: HERO_BG }}
    >
      <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>
        {/* Canvas principal */}
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            display: "block",
            zIndex: 0,
          }}
        />

        {/* Skeleton + progress bar (jusqu'aux 5 frames clés) */}
        {!ready && (
          <div
            aria-busy="true"
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: HERO_BG,
              zIndex: 5,
            }}
          >
            <div
              className="card"
              style={{
                padding: "16px 20px",
                width: "min(300px, 70vw)",
                display: "grid",
                gap: 12,
              }}
            >
              <span className="eyebrow" style={{ fontSize: 11 }}>
                {t.hero.loading}
              </span>
              <div className="bar">
                <i style={{ width: `${Math.round(loadProgress * 100)}%` }} />
              </div>
            </div>
          </div>
        )}

        {/* Titre d'intro (h1) : seul, centré, s'efface dès que le scroll commence */}
        {intro && (
          <div
            aria-hidden={derived.introOpacity === 0}
            style={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
              textAlign: "center",
              padding: "0 clamp(20px, 6vw, 80px)",
              opacity: derived.introOpacity,
              transform: `translateY(${((1 - derived.introOpacity) * -24).toFixed(1)}px)`,
              pointerEvents: "none",
              zIndex: 2,
            }}
          >
            <MixedTitle
              as="p"
              text={intro.title}
              style={{ ...headingStyle, fontSize: "clamp(3rem, 8vw, 7rem)" }}
            />
          </div>
        )}

        {/* Overlay stop 1 : titre + phrase à droite, posés sur la vidéo (pas de verre) */}
        <div style={overlayWrapStyle(derived.stop1Opacity, "right")} aria-hidden={derived.stop1Opacity === 0}>
          <div style={overlayBlockStyle(derived.stop1Opacity)}>
            <MixedTitle as="h2" text={stop1.title} style={overlayTitleStyle(tone1)} />
            {stop1.description && <p style={overlayTextStyle(tone1)}>{stop1.description}</p>}
          </div>
        </div>

        {/* Overlay stop 2 : à gauche */}
        <div style={overlayWrapStyle(derived.stop2Opacity, "left")} aria-hidden={derived.stop2Opacity === 0}>
          <div style={overlayBlockStyle(derived.stop2Opacity)}>
            <MixedTitle as="h2" text={stop2.title} style={overlayTitleStyle(tone2)} />
            {stop2.description && <p style={overlayTextStyle(tone2)}>{stop2.description}</p>}
          </div>
        </div>

        {/* Bouton SKIP : descend directement à la zone de téléchargement */}
        <button
          type="button"
          className="hero-skip"
          aria-label={t.hero.skipAria}
          aria-hidden={derived.skipOpacity === 0}
          onClick={() => {
            document
              .getElementById(skipTargetId)
              ?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          style={{
            opacity: derived.skipOpacity,
            pointerEvents: derived.skipOpacity > 0.3 ? "auto" : "none",
          }}
        >
          {t.hero.skip}
        </button>

        {/* Indicateur scroll */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "50%",
            bottom: "4vh",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            opacity: derived.scrollIndicatorOpacity,
            pointerEvents: "none",
            zIndex: 3,
          }}
        >
          <span
            className="mono"
            style={{
              fontSize: 10.5,
              letterSpacing: ".2em",
              color: INK,
              fontWeight: 700,
            }}
          >
            {t.hero.scroll}
          </span>
          <span
            className="btn btn-icon"
            style={{ animation: "lg-bob 2.4s ease-in-out infinite" }}
          >
            ↓
          </span>
        </div>

        {/* Assombrissement progressif de l'image pendant la sortie */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: EXIT_BG,
            opacity: derived.fadeOpacity,
            pointerEvents: "none",
            zIndex: 4,
          }}
        />

        {/* Bandeau typographique : la colonne de droite monte, celle de gauche descend */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            opacity: derived.marqueeOpacity,
            pointerEvents: "none",
            zIndex: 5,
          }}
        >
          {(["left", "right"] as const).map((side) => (
            <div key={side} style={{ flex: 1, position: "relative", overflow: "hidden" }}>
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: 0,
                  right: 0,
                  minHeight: "260vh",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-around",
                  // la gauche descend, la droite monte
                  transform: `translateY(calc(-50% + ${(
                    (side === "left" ? 1 : -1) * derived.marqueeShift
                  ).toFixed(2)}vh))`,
                  willChange: "transform",
                }}
              >
                {Array.from({ length: MARQUEE_LINES }, (_, i) => (
                  <span key={i} style={i % 2 === 0 ? marqueeSolidStyle : marqueeOutlineStyle}>
                    {MARQUEE_WORD}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Aplat sable qui monte depuis le bas et raccorde avec la page */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "100%",
            height: "100vh",
            background: EXIT_BG,
            opacity: derived.barOpacity,
            transform: derived.barTranslate,
            willChange: "transform",
            pointerEvents: "none",
            zIndex: 6,
          }}
        />
      </div>
    </section>
  );
}
