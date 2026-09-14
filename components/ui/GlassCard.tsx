"use client";

import {
  useCallback,
  useRef,
  type CSSProperties,
  type ElementType,
  type PointerEvent,
  type ReactNode,
} from "react";

interface GlassCardProps {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
  /** Variante : "card" (30px) ou "panel" (38px, padding large). */
  variant?: "card" | "panel";
  /** Réfraction plus fine (pilules, petits éléments). */
  fine?: boolean;
  /** Reflet spéculaire qui suit le pointeur + léger lift au survol. */
  interactive?: boolean;
  as?: ElementType;
}

/**
 * Carte "liquid glass" : réfraction SVG du fond (::before), teinte + liserés +
 * reflet spéculaire (::after). Le contenu est rendu au-dessus (z-index 1).
 */
export default function GlassCard({
  children,
  style,
  className,
  variant = "card",
  fine = false,
  interactive = false,
  as: Tag = "div",
}: GlassCardProps) {
  const ref = useRef<HTMLElement | null>(null);

  const onMove = useCallback((e: PointerEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
  }, []);

  const onEnter = useCallback(() => {
    ref.current?.style.setProperty("--spec", "1");
  }, []);

  const onLeave = useCallback(() => {
    ref.current?.style.setProperty("--spec", "0");
  }, []);

  const classes = [
    "lg",
    variant === "panel" ? "lg-panel" : "lg-card",
    fine ? "lg-fine" : "",
    interactive ? "lg-hover" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag
      ref={ref}
      className={classes}
      style={style}
      onPointerMove={interactive ? onMove : undefined}
      onPointerEnter={interactive ? onEnter : undefined}
      onPointerLeave={interactive ? onLeave : undefined}
    >
      {children}
    </Tag>
  );
}
