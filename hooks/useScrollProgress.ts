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
  /** Valeur live (lissée), lue dans la boucle rAF (pas de re-render). */
  progressRef: RefObject<number>;
  /** Valeur React (lissée), mise à jour à chaque tick rAF où elle change. */
  progress: number;
}

export interface ScrollProgressOptions {
  /**
   * Inertie : temps (en secondes) pour que la valeur affichée comble ~63 %
   * de l'écart avec le scroll réel. 0 = aucun lissage. Défaut : 0.18.
   * Plus la valeur est grande, plus les frames "glissent" après l'arrêt du scroll.
   */
  smoothing?: number;
}

const DEFAULT_SMOOTHING = 0.18;
/**
 * Vitesse minimale de rattrapage (en progress/s). Évite la longue traîne de
 * l'easing exponentiel où les dernières frames défilent une par une en
 * saccadant : 0.12 ≈ 22 frames/s, donc la fin de la glisse reste fluide.
 */
const MIN_VELOCITY = 0.12;
/** En dessous de cet écart, on colle à la cible. */
const SETTLE_EPSILON = 0.0005;

/**
 * Calcule le progress [0, 1] d'une section sticky :
 *   0 → le haut de la section touche le haut du viewport
 *   1 → le bas de la section touche le bas du viewport
 *
 * Le listener scroll (passive) n'écrit qu'une ref ; une boucle rAF
 * lit cette ref, calcule le progress cible, le lisse avec une inertie
 * exponentielle (indépendante du framerate) et appelle `onFrame`.
 *
 * Le lissage porte sur le progress lui-même : les zones STOP restent donc
 * marquées (la valeur lissée traverse le palier comme le scroll réel).
 */
export function useScrollProgress<T extends HTMLElement>(
  sectionRef: RefObject<T | null>,
  onFrame?: (progress: number) => void,
  options: ScrollProgressOptions = {},
): ScrollProgress {
  const smoothing = options.smoothing ?? DEFAULT_SMOOTHING;
  const scrollY = useRef<number>(0);
  const progressRef = useRef<number>(0);
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
    let lastProgress = -1;
    let smoothed = -1; // -1 = pas encore initialisé (on colle au scroll au 1er tick)
    let lastTime = 0;

    const measure = (): void => {
      const rect = el.getBoundingClientRect();
      sectionTop = rect.top + window.scrollY;
      scrollable = Math.max(1, el.offsetHeight - window.innerHeight);
      scrollY.current = window.scrollY;
    };

    const onScroll = (): void => {
      scrollY.current = window.scrollY;
    };

    const loop = (now: number): void => {
      const target = clamp01((scrollY.current - sectionTop) / scrollable);

      // Inertie : easing exponentiel vers la cible, dt en secondes.
      const dt = lastTime === 0 ? 0 : Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      if (smoothed < 0 || smoothing <= 0) {
        smoothed = target;
      } else {
        const diff = target - smoothed;
        const alpha = 1 - Math.exp(-dt / smoothing);
        // Easing exponentiel, mais jamais plus lent que MIN_VELOCITY.
        const step = Math.max(Math.abs(diff) * alpha, MIN_VELOCITY * dt);
        smoothed += Math.sign(diff) * Math.min(step, Math.abs(diff));
        if (Math.abs(target - smoothed) < SETTLE_EPSILON) smoothed = target;
      }

      const p = smoothed;
      progressRef.current = p;
      if (p !== lastProgress) {
        lastProgress = p;
        setProgress(p);
      }
      onFrameRef.current?.(p);
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
  }, [sectionRef, smoothing]);

  return { progressRef, progress };
}
