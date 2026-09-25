import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/locale-server";

export default async function Footer() {
  const t = getDictionary(await getLocale());
  return (
    <footer className="container" style={{ padding: "2rem 0 2.5rem", position: "relative", zIndex: 1 }}>
      <div className="footer-bar">
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontWeight: 700, color: "var(--ink)" }}>handoff</span>
          <span suppressHydrationWarning>© {new Date().getFullYear()}</span>
          <span className="mono">GPL-3.0</span>
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Link href="/changelog" className="chip">
            {t.footer.changelog}
          </Link>
          <a
            href="https://github.com/glbaugustin-netizen/prop-handoff"
            target="_blank"
            rel="noreferrer"
            className="chip"
          >
            {t.footer.github}
          </a>
        </span>
      </div>
    </footer>
  );
}
