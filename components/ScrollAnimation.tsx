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
  clamp01,
  getFrameIndex,
  getLocal,
  getSegment,
  useScrollProgress,
} from "../hooks/useScrollProgress";
import { MixedTitle } from "./ui/MixedTitle";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface StopContent {
  frame: number;
  /** Titre (syntaxe *mot* pour le manuscrit). Seul texte affiché au stop. */
  title: string;
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
  /**
   * Inertie du scroll en secondes (défaut : 0.18). Les frames continuent de
   * glisser en ralentissant après l'arrêt du scroll. 0 = aucun lissage.
   */
  smoothing?: number;
}

/* ------------------------------------------------------------------ */
/*  Constantes                                                         */
/* ------------------------------------------------------------------ */

const WAVE_COLOR = "#0e1016"; // fond du site (style board)
const FADE_IN_VH = 30; // fade in du texte sur les 30 premiers vh du stop
const FADE_OUT_VH = 15; // fade out sur les derniers vh du stop 1
const INTRO_FADE_VH = 12; // fade out du titre d'intro

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

const headingStyle: CSSProperties = {
  margin: 0,
  fontSize: "clamp(2.4rem, 5.2vw, 4.8rem)",
  lineHeight: 1.05,
  letterSpacing: "-.035em",
  fontWeight: 700,
  color: "#fff",
  textShadow: "0 2px 24px rgba(0,0,0,.55), 0 0 60px rgba(0,0,0,.35)",
  textWrap: "balance",
};

/** Overlay d'un stop : titre seul, centré verticalement, moitié droite. */
const overlayWrapStyle = (opacity: number): CSSProperties => ({
  position: "absolute",
  top: 0,
  right: 0,
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

/** Le titre glisse légèrement vers le haut en apparaissant. */
const overlayTitleStyle = (opacity: number): CSSProperties => ({
  ...headingStyle,
  maxWidth: "14ch",
  transform: `translateY(${((1 - opacity) * 28).toFixed(1)}px)`,
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
  smoothing = 0.18,
}: ScrollAnimationProps) {
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
    else if (segment === "transition") stop2Opacity = 1 - clamp01(transition / 0.5);

    const scrollIndicatorOpacity = Math.max(stop1Opacity, stop2Opacity);

    // Sortie : l'image s'assombrit progressivement (ease-in-out) jusqu'au fond
    // du site, pendant qu'une barre droite monte depuis le bas pour finir
    // exactement dans la couleur de la section suivante.
    const fadeOpacity =
      transition < 0.5 ? 2 * transition * transition : 1 - Math.pow(-2 * transition + 2, 2) / 2;
    const barActive = segment === "transition" && transition > 0;
    const barTranslate = `translateY(-${(transition * 100).toFixed(3)}vh)`;

    return {
      introOpacity,
      stop1Opacity,
      stop2Opacity,
      scrollIndicatorOpacity,
      fadeOpacity,
      barOpacity: barActive ? 1 : 0,
      barTranslate,
    };
  }, [progress]);

  /* ---------------- Rendu ---------------- */

  return (
    <section
      ref={sectionRef}
      style={{ height: `${TOTAL_VH}vh`, position: "relative", background: WAVE_COLOR }}
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
            filter: ready ? "none" : "blur(12px)",
            transition: "filter .6s ease",
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
              background: WAVE_COLOR,
              zIndex: 5,
            }}
          >
            <div
              className="lg lg-fine"
              style={{
                borderRadius: 22,
                padding: "16px 20px",
                width: "min(300px, 70vw)",
                display: "grid",
                gap: 12,
              }}
            >
              <span className="eyebrow" style={{ fontSize: 11 }}>
                Chargement
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
              as="h1"
              text={intro.title}
              style={{ ...headingStyle, fontSize: "clamp(3rem, 8vw, 7rem)" }}
            />
          </div>
        )}

        {/* Overlay stop 1 : titre seul */}
        <div style={overlayWrapStyle(derived.stop1Opacity)} aria-hidden={derived.stop1Opacity === 0}>
          <MixedTitle as="h2" text={stop1.title} style={overlayTitleStyle(derived.stop1Opacity)} />
        </div>

        {/* Overlay stop 2 : titre seul */}
        <div style={overlayWrapStyle(derived.stop2Opacity)} aria-hidden={derived.stop2Opacity === 0}>
          <MixedTitle as="h2" text={stop2.title} style={overlayTitleStyle(derived.stop2Opacity)} />
        </div>

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
              color: "rgba(255,255,255,.7)",
              textShadow: "0 1px 6px rgba(0,0,0,.3)",
            }}
          >
            SCROLL
          </span>
          <span
            className="btn btn-glass btn-icon"
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
            background: WAVE_COLOR,
            opacity: derived.fadeOpacity,
            pointerEvents: "none",
            zIndex: 4,
          }}
        />

        {/* Barre droite qui monte depuis le bas et couvre l'écran en fin de section */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "100%",
            height: "100vh",
            background: WAVE_COLOR,
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
