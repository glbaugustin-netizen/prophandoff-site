import type { CSSProperties } from "react";

interface Blob {
  size: number;
  color: string;
  style: CSSProperties;
  blur: number;
  animation: string;
}

/* Fond vivant que le verre réfracte : 4 blobs qui dérivent + grille fine. */
const BLOBS: Blob[] = [
  {
    size: 660,
    color: "#ff7a2e",
    style: { top: "-6%", left: "-4%" },
    blur: 20,
    animation: "lg-drift 18s ease-in-out infinite",
  },
  {
    size: 680,
    color: "#2e7bff",
    style: { bottom: "-12%", right: "-6%" },
    blur: 20,
    animation: "lg-drift2 22s ease-in-out infinite",
  },
  {
    size: 480,
    color: "#c64bff",
    style: { top: "40%", left: "42%" },
    blur: 24,
    animation: "lg-drift 26s ease-in-out infinite reverse",
  },
  {
    size: 420,
    color: "#2effc0",
    style: { top: "60%", left: "6%" },
    blur: 26,
    animation: "lg-drift2 30s ease-in-out infinite",
  },
];

export default function LiquidBackground() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: "-6%",
        zIndex: 0,
        overflow: "hidden",
        pointerEvents: "none",
        background: "var(--bg)",
      }}
    >
      {BLOBS.map((b) => (
        <div
          key={b.color}
          style={{
            position: "absolute",
            width: b.size,
            height: b.size,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${b.color}, transparent 60%)`,
            filter: `blur(${b.blur}px)`,
            animation: b.animation,
            willChange: "transform",
            ...b.style,
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)",
          backgroundSize: "52px 52px",
        }}
      />
    </div>
  );
}
