import type { CSSProperties, ElementType, ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
  /** "card" (padding standard) ou "panel" (padding large). */
  variant?: "card" | "panel";
  /** Fond alternatif (mist) au lieu du papier. */
  mist?: boolean;
  /** Carte cliquable : réagit comme un bouton au survol et au clic. */
  clickable?: boolean;
  as?: ElementType;
}

/** Surface néo-brutaliste : fond opaque, bordure 2px ink, ombre décalée. */
export default function Card({
  children,
  style,
  className,
  variant = "card",
  mist = false,
  clickable = false,
  as: Tag = "div",
}: CardProps) {
  const classes = [
    "card",
    variant === "panel" ? "card--panel" : "",
    mist ? "card--mist" : "",
    clickable ? "card--link" : "",
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
