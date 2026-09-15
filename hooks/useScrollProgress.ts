"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/* ------------------------------------------------------------------ */
/*  Timeline (source de vérité : hauteurs en vh)                       */
/* ------------------------------------------------------------------ */

export const ZONE1_VH = 200; // frames 1 → 60
export const STOP1_VH = 100; // frame 60 figée
export const ZONE2_VH = 200; // frames 61 → 110
export const STOP2_VH = 100; // frame 110 figée
export const TRANSITION_VH = 60; // vague de sortie

export const TOTAL_VH =
  ZONE1_VH + STOP1_VH + ZONE2_VH + STOP2_VH + TRANSITION_VH; // 660

/** Bornes cumulées, en fraction [0, 1] du progress total. */
export const BOUNDS = {
  zone1End: ZONE1_VH / TOTAL_VH, // 0.303
  stop1End: (ZONE1_VH + STOP1_VH) / TOTAL_VH, // 0.455
  zone2End: (ZONE1_VH + STOP1_VH + ZONE2_VH) / TOTAL_VH, // 0.758
  stop2End: (ZONE1_VH + STOP1_VH + ZONE2_VH + STOP2_VH) / TOTAL_VH, // 0.909
  transitionEnd: 1,
} as const;

export type Segment = "zone1" | "stop1" | "zone2" | "stop2" | "transition";

export const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);

const lerpInv = (a: number, b: number, v: number): number =>
  clamp01((v - a) / (b - a));

/** Segment courant pour un progress donné. */
export function getSegment(progress: number): Segment {
  if (progress < BOUNDS.zone1End) return "zone1";
  if (progress < BOUNDS.stop1End) return "stop1";
  if (progress < BOUNDS.zone2End) return "zone2";
  if (progress < BOUNDS.stop2End) return "stop2";
  return "transition";
}

/** Progress local [0, 1] à l'intérieur d'un segment (clampé). */
export function getLocal(progress: number, segment: Segment): number {
  switch (segment) {
    case "zone1":
      return lerpInv(0, BOUNDS.zone1End, progress);
    case "stop1":
      return lerpInv(BOUNDS.zone1End, BOUNDS.stop1End, progress);
    case "zone2":
      return lerpInv(BOUNDS.stop1End, BOUNDS.zone2End, progress);
    case "stop2":
      return lerpInv(BOUNDS.zone2End, BOUNDS.stop2End, progress);
    case "transition":
      return lerpInv(BOUNDS.stop2End, BOUNDS.transitionEnd, progress);
  }
}

/**
 * Index de frame (1-based) pour un progress donné.
 * Entièrement bidirectionnel : c'est une fonction pure du scroll.
 * Les paliers STOP sont ici : la frame cible reste figée sur toute la zone.
 */
export function getFrameIndex(
  progress: number,
  stop1Frame: number,
  lastFrame: number,
): number {
  const p = clamp01(progress);
  if (p < BOUNDS.zone1End) {
    const t = getLocal(p, "zone1");
    return 1 + Math.round(t * (stop1Frame - 1));
  }
  if (p < BOUNDS.stop1End) return stop1Frame;
  if (p < BOUNDS.zone2End) {
    const t = getLocal(p, "zone2");
    return stop1Frame + 1 + Math.round(t * (lastFrame - stop1Frame - 1));
  }
  return lastFrame;
}

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

export interface ScrollProgress {
  /** Progress brut du scroll, lu dans la boucle rAF (pas de re-render). */
  progressRef: RefObject<number>;
  /** Progress brut du scroll, en state React (overlays, vague, stops). */
  progress: number;
  /** Frame réellement affichée (entier, lerpée), lue sans re-render. */
  frameRef: RefObject<number>;
}

export interface ScrollProgressOptions {
  /**
   * Douceur du lerp sur l'index de frame, par tick à 60 fps.
   * 0.05 = très doux (longue traîne), 0.2 = quasi instantané. Défaut : 0.1.
   */
  lerpFactor?: number;
  /** Frame du premier stop (défaut : 60). */
  stop1Frame?: number;
  /** Dernière frame = second stop (défaut : 110). */
  lastFrame?: number;
}

const DEFAULT_LERP_FACTOR = 0.1;
const DEFAULT_STOP1_FRAME = 60;
const DEFAULT_LAST_FRAME = 110;
/** En dessous de cet écart (en frames), on snappe sur la cible. */
const SETTLE_THRESHOLD = 0.5;
/** Durée d'un tick de référence : le lerpFactor est exprimé "par tick à 60 fps". */
const REF_TICK_MS = 1000 / 60;

/**
 * Calcule le progress [0, 1] d'une section sticky :
 *   0 → le haut de la section touche le haut du viewport
 *   1 → le bas de la section touche le bas du viewport
 *
 * Le listener scroll (passive) n'écrit qu'une ref ; une boucle rAF continue
 * lit cette ref et calcule le progress **brut** (les stops, overlays et la
 * vague en dépendent directement, sans lissage).
 *
 * Inertie (momentum) : la frame *affichée* rattrape la frame *cible* par
 * interpolation linéaire à chaque tick —
 *   `current += (target - current) * lerpFactor`
 * — puis snappe sur la cible dès que l'écart passe sous 0.5 frame. Le lerp ne
 * s'applique qu'à l'index de frame, jamais au progress ni aux zones.
 * `onFrame` n'est appelé que lorsque l'index entier affiché change.
 */
export function useScrollProgress<T extends HTMLElement>(
  sectionRef: RefObject<T | null>,
  onFrame?: (frame: number, progress: number) => void,
  options: ScrollProgressOptions = {},
): ScrollProgress {
  const lerpFactor = clamp01(options.lerpFactor ?? DEFAULT_LERP_FACTOR);
  const stop1Frame = options.stop1Frame ?? DEFAULT_STOP1_FRAME;
  const lastFrame = options.lastFrame ?? DEFAULT_LAST_FRAME;

  const scrollY = useRef<number>(0);
  const progressRef = useRef<number>(0);
  const frameRef = useRef<number>(1);
  const [progress, setProgress] = useState<number>(0);

  // Toujours appeler la dernière version du callback sans relancer l'effet.
  const onFrameRef = useRef<typeof onFrame>(onFrame);
  onFrameRef.current = onFrame;

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    let sectionTop = 0;
    let scrollable = 1;
    let rafId = 0;
    let lastTime = 0;
    let lastProgress = -1;

    // Momentum : cible (depuis le scroll) et valeur affichée (lerpée).
    let targetFrame = 0;
    let currentFrame = -1; // -1 = pas initialisé → on colle à la cible au 1er tick
    let lastDisplayFrame = -1;

    const measure = (): void => {
      const rect = el.getBoundingClientRect();
      sectionTop = rect.top + window.scrollY;
      scrollable = Math.max(1, el.offsetHeight - window.innerHeight);
      scrollY.current = window.scrollY;
    };

    const onScroll = (): void => {
      scrollY.current = window.scrollY;
    };

    const emit = (frame: number): void => {
      if (frame === lastDisplayFrame) return;
      lastDisplayFrame = frame;
      frameRef.current = frame;
      onFrameRef.current?.(frame, progressRef.current);
    };

    const loop = (now: number): void => {
      /* ---- progress brut (stops, overlays, vague) ---- */
      const p = clamp01((scrollY.current - sectionTop) / scrollable);
      progressRef.current = p;
      if (p !== lastProgress) {
        lastProgress = p;
        setProgress(p);
      }

      /* ---- frame cible exacte selon le scroll ---- */
      targetFrame = getFrameIndex(p, stop1Frame, lastFrame);

      /* ---- lerp de la frame affichée vers la cible ---- */
      // Le facteur est normalisé sur un tick à 60 fps pour que la traîne soit
      // identique sur un écran 120 Hz (dt clampé pour ne pas sauter après un
      // onglet en arrière-plan).
      const dt = lastTime === 0 ? REF_TICK_MS : Math.min(now - lastTime, 100);
      lastTime = now;
      const ticks = dt / REF_TICK_MS;
      const alpha = lerpFactor >= 1 ? 1 : 1 - Math.pow(1 - lerpFactor, ticks);

      if (currentFrame < 0) {
        currentFrame = targetFrame;
      } else {
        currentFrame += (targetFrame - currentFrame) * alpha;
      }

      const isSettling = Math.abs(currentFrame - targetFrame) > SETTLE_THRESHOLD;
      if (!isSettling) {
        // Snap final exact : on ne reste jamais sur une demi-frame.
        currentFrame = targetFrame;
      }

      emit(Math.round(currentFrame));

      // La boucle tourne en continu : le lerp continue de rattraper la cible
      // même sans nouvel événement scroll, et le progress reste à jour.
      rafId = window.requestAnimationFrame(loop);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    rafId = window.requestAnimationFrame(loop);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
    };
  }, [sectionRef, lerpFactor, stop1Frame, lastFrame]);

  return { progressRef, progress, frameRef };
}
