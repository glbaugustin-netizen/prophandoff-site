import Link from "next/link";

export default function Footer() {
  return (
    <footer className="container" style={{ padding: "2rem 0 2.5rem", position: "relative", zIndex: 1 }}>
      <div
        className="glass glass--pill"
        style={{
          padding: "14px 22px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          flexWrap: "wrap",
          fontSize: 13,
          color: "rgba(255,255,255,.75)",
          textShadow: "0 1px 6px rgba(0,0,0,.3)",
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontWeight: 700, color: "#fff" }}>handoff</span>
          <span suppressHydrationWarning>© {new Date().getFullYear()}</span>
          <span className="mono" style={{ opacity: 0.7 }}>
            GPL-3.0
          </span>
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Link href="/changelog" className="chip">
            changelog
          </Link>
          <a
            href="https://github.com/placeholder/prop-handoff"
            target="_blank"
            rel="noreferrer"
            className="chip"
          >
            GitHub ↗
          </a>
        </span>
      </div>
    </footer>
  );
}
