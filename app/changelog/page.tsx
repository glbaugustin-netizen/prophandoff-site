import type { Metadata } from "next";
import Link from "next/link";
import GlassCard from "@/components/ui/GlassCard";
import Reveal from "@/components/ui/Reveal";
import { MixedTitle } from "@/components/ui/MixedTitle";
import { ADDONS, formatDate } from "@/lib/addons";

export const metadata: Metadata = { title: "Changelog" };

export default function ChangelogPage() {
  const entries = ADDONS.flatMap((addon) =>
    addon.changelog.map((entry) => ({ addon, entry })),
  ).sort((a, b) => b.entry.date.localeCompare(a.entry.date));

  return (
    <div className="container page" style={{ maxWidth: 820 }}>
      <Reveal>
        <span className="eyebrow">Historique</span>
        <MixedTitle as="h1" className="section-title" text="*Changelog*" />
        <p className="section-lead">Toutes les versions publiées, addon par addon.</p>
      </Reveal>

      <Reveal delay={120}>
        <GlassCard variant="panel" tinted style={{ marginTop: "2.5rem" }}>
          <ol className="timeline" style={{ margin: 0 }}>
            {entries.map(({ addon, entry }) => (
              <li key={`${addon.slug}-${entry.version}`} className="timeline-item">
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <Link href={`/addon/${addon.slug}`} style={{ fontWeight: 700 }}>
                    {addon.name}
                  </Link>
                  <span className="chip chip-amber">v{entry.version}</span>
                  <span className="mono muted" style={{ fontSize: 12 }}>
                    {formatDate(entry.date)}
                  </span>
                </div>
                <h2 style={{ fontSize: "1.4rem", margin: ".85rem 0 .5rem", letterSpacing: "-.02em" }}>
                  {entry.title}
                </h2>
                <ul className="feature-list" style={{ marginTop: ".75rem" }}>
                  {entry.changes.map((c) => (
                    <li key={c} className="muted">
                      {c}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </GlassCard>
      </Reveal>
    </div>
  );
}
