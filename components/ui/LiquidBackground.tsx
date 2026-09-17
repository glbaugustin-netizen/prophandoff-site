/**
 * Fond du site : uni (#0e1016) + grille fine de 52 px. C'est la grille,
 * nette, que les surfaces liquid glass déforment. La lumière vient des
 * surfaces elles-mêmes (halo des .glass), pas du fond.
 */
export default function LiquidBackground() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        background: "var(--bg)",
        backgroundImage:
          "linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)",
        backgroundSize: "52px 52px",
      }}
    />
  );
}
