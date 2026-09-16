import type { CSSProperties, ElementType, ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
  /** Rayon : "card" (34px) ou "panel" (36px, padding large). */
  variant?: "card" | "panel";
  /** Verre teinté foncé : à utiliser dès que le bloc contient du texte clair. */
  tinted?: boolean;
  as?: ElementType;
}

/**
 * Surface « Liquid Glass » : le fond n'est pas flouté, il est déformé par le
 * filtre SVG #liquid (voir LiquidFilters). Surface statique — aucun effet
 * lié au pointeur.
 */
export default function GlassCard({
  children,
  style,
  className,
  variant = "card",
  tinted = false,
  as: Tag = "div",
}: GlassCardProps) {
  const classes = [
    "glass",
    tinted ? "glass--tinted" : "",
    variant === "panel" ? "glass--panel" : "glass--card",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag className={classes} style={style}>
      {children}
    </Tag>
  );
}
