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
  clamp01,
  getFrameIndex,
  getLocal,
  getSegment,
  useScrollProgress,
} from "../hooks/useScrollProgress";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface StopContent {
  frame: number;
  title: string;
  description: string;
}

export interface ScrollAnimationProps {
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
const GLOW_COLOR = "#c64bff"; // violet de la palette
const FADE_IN_VH = 30; // fade in du texte sur les 30 premiers vh du stop
const FADE_OUT_VH = 15; // fade out sur les derniers vh du stop 1

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
  margin: "0 0 .45em",
  fontSize: "clamp(1.9rem, 4vw, 3.6rem)",
  lineHeight: 0.98,
  letterSpacing: "-.035em",
  fontWeight: 700,
  color: "#fff",
  textShadow: "0 2px 20px rgba(0,0,0,.35)",
  textWrap: "balance",
};

const paragraphStyle: CSSProperties = {
  margin: 0,
  maxWidth: "44ch",
  fontSize: "clamp(1rem, 1.3vw, 1.1rem)",
  lineHeight: 1.5,
  color: "rgba(255,255,255,.9)",
  textShadow: "0 1px 10px rgba(0,0,0,.3)",
};

/** Wrapper de l'overlay : centré verticalement, moitié droite de l'écran. */
const overlayWrapStyle = (opacity: number): CSSProperties => ({
  position: "absolute",
  top: 0,
  right: 0,
  width: "50%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "flex-end",
  padding: "0 clamp(20px, 5vw, 64px)",
  boxSizing: "border-box",
  opacity,
  pointerEvents: opacity > 0.05 ? "auto" : "none",
  zIndex: 2,
});

/** Le panneau lui-même glisse et se déploie légèrement avec l'opacité. */
const overlayPanelStyle = (opacity: number): CSSProperties => ({
  width: "min(560px, 100%)",
  transform: `translateY(${((1 - opacity) * 28).toFixed(1)}px) scale(${(0.96 + 0.04 * opacity).toFixed(3)})`,
  transformOrigin: "50% 60%",
});

/* ------------------------------------------------------------------ */
/*  Composant                                                          */
/* ------------------------------------------------------------------ */

export default function ScrollAnimation({
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

    // Vague : translateY de 120px (cachée sous le viewport) jusqu'à
    // -100vh - 120px (l'écran est entièrement couvert, crête comprise).
    const waveActive = segment === "transition" && transition > 0;
    const px = (120 * (1 - transition) - 120 * transition).toFixed(2);
    const vh = (transition * 100).toFixed(3);
    const waveTranslate = `translateY(calc(${px}px - ${vh}vh))`;

    return {
      stop1Opacity,
      stop2Opacity,
      scrollIndicatorOpacity,
      waveOpacity: waveActive ? 1 : 0,
      waveTranslate,
      glowOpacity: transition,
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

        {/* Overlay texte stop 1 */}
        <div style={overlayWrapStyle(derived.stop1Opacity)} aria-hidden={derived.stop1Opacity === 0}>
          <div className="lg lg-panel" style={overlayPanelStyle(derived.stop1Opacity)}>
            <span className="eyebrow" style={{ marginBottom: 22 }}>
              Addon Blender · Gratuit
            </span>
            <h2 style={headingStyle}>{stop1.title}</h2>
            <p style={paragraphStyle}>{stop1.description}</p>
          </div>
        </div>

        {/* Overlay texte stop 2 */}
        <div style={overlayWrapStyle(derived.stop2Opacity)} aria-hidden={derived.stop2Opacity === 0}>
          <div className="lg lg-panel" style={overlayPanelStyle(derived.stop2Opacity)}>
            <span className="eyebrow" style={{ marginBottom: 22 }}>
              Timeline · Non destructif
            </span>
            <h2 style={headingStyle}>{stop2.title}</h2>
            <p style={paragraphStyle}>{stop2.description}</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 26 }}>
              <span className="chip">Blender 4.2 → 4.5</span>
              <span className="chip chip-live">v1.0.0</span>
            </div>
          </div>
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

        {/* Glow radial derrière la vague (fade in pendant la transition) */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse 80% 60% at 50% 110%, ${GLOW_COLOR} 0%, rgba(42,0,80,0) 70%)`,
            opacity: derived.glowOpacity,
            pointerEvents: "none",
            zIndex: 4,
          }}
        />

        {/* Overlay vague de sortie */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "100%",
            height: "calc(100vh + 120px)",
            opacity: derived.waveOpacity,
            transform: derived.waveTranslate,
            willChange: "transform",
            pointerEvents: "none",
            zIndex: 6,
          }}
        >
          <svg
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            style={{ display: "block", width: "100%", height: 120 }}
          >
            <path d="M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z" fill={WAVE_COLOR} />
          </svg>
          <div style={{ height: "100vh", background: WAVE_COLOR }} />
        </div>
      </div>
    </section>
  );
}
