import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GlassCard from "@/components/ui/GlassCard";
import DownloadButton from "@/components/ui/DownloadButton";
import Reveal from "@/components/ui/Reveal";
import { MixedTitle } from "@/components/ui/MixedTitle";
import { ADDON_SLUGS, formatDate, getAddon } from "@/lib/addons";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/locale-server";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams(): Array<{ slug: string }> {
  return ADDON_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const addon = getAddon(slug, await getLocale());
  if (!addon) return {};
  return { title: addon.name, description: addon.tagline };
}

const dtStyle = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,.65)",
} as const;

export default async function AddonPage({ params }: PageProps) {
  const { slug } = await params;
  const locale = await getLocale();
  const t = getDictionary(locale);
  const addon = getAddon(slug, locale);
  if (!addon) notFound();

  return (
    <div className="container page">
      {/* Hero */}
      <Reveal>
        <GlassCard variant="panel" tinted style={{ marginBottom: 26 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22 }}>
            <span className="chip chip-amber">v{addon.version}</span>
            <span className="chip chip-live">{t.addon.free}</span>
            <span className="chip">Blender {addon.blender}</span>
          </div>
          <MixedTitle
            as="h1"
            text={`${addon.name} *v${addon.version}*`}
            style={{ fontSize: "clamp(2.6rem, 6vw, 4.6rem)", marginBottom: ".35em" }}
          />
          <p
            style={{
              fontSize: "clamp(1.05rem, 1.5vw, 1.25rem)",
              maxWidth: "46ch",
              color: "rgba(255,255,255,.9)",
              lineHeight: 1.5,
              marginBottom: "2rem",
              textShadow: "0 1px 10px rgba(0,0,0,.3)",
            }}
          >
            {addon.tagline}
          </p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <DownloadButton slug={addon.slug} label={t.addon.download} />
            <a
              href="https://github.com/placeholder/prop-handoff"
              target="_blank"
              rel="noreferrer"
              className="btn btn-glass"
            >
              {t.addon.viewGithub}
            </a>
          </div>
        </GlassCard>
      </Reveal>

      <div
        className="addon-grid"
        style={{
          display: "grid",
          gap: 26,
          gridTemplateColumns: "minmax(0, 2fr) minmax(260px, 1fr)",
          alignItems: "start",
        }}
      >
        <div style={{ display: "grid", gap: 26 }}>
          {/* Features */}
          <Reveal delay={80}>
            <GlassCard tinted>
              <span className="eyebrow">{t.addon.features}</span>
              <p className="muted" style={{ marginTop: 18, lineHeight: 1.55 }}>
                {addon.description}
              </p>
              <ul className="feature-list">
                {addon.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </GlassCard>
          </Reveal>

          {/* Changelog accordéon */}
          <Reveal delay={140}>
            <GlassCard tinted>
              <span className="eyebrow" style={{ marginBottom: 18 }}>
                {t.addon.changelog}
              </span>
              {addon.changelog.map((entry, i) => (
                <details key={entry.version} className="accordion" open={i === 0}>
                  <summary>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <span className="chip chip-amber">v{entry.version}</span>
                      <span>{entry.title}</span>
                      <span className="mono muted" style={{ fontSize: 12 }}>
                        {formatDate(entry.date, locale)}
                      </span>
                    </span>
                  </summary>
                  <ul className="feature-list" style={{ marginTop: "1rem" }}>
                    {entry.changes.map((c) => (
                      <li key={c} className="muted">
                        {c}
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </GlassCard>
          </Reveal>
        </div>

        {/* Sidebar */}
        <Reveal delay={200} style={{ position: "sticky", top: "calc(var(--nav-h) + 8px)" }}>
          <GlassCard tinted>
            <div
              className="mono"
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: ".12em",
                marginBottom: 22,
              }}
            >
              <span>{t.addon.sheet}</span>
              <span style={{ color: "var(--dot)" }}>●</span>
            </div>
            <MixedTitle
              as="h2"
              text={t.addon.downloadFree}
              style={{ fontSize: "1.7rem", marginBottom: 22 }}
            />
            <dl style={{ margin: 0, display: "grid", gap: 18 }}>
              <div>
                <dt className="mono" style={dtStyle}>
                  {t.addon.compatibility}
                </dt>
                <dd style={{ margin: ".3rem 0 0", fontWeight: 600 }}>Blender {addon.blender}</dd>
                <div className="bar" style={{ marginTop: 8 }}>
                  <i style={{ width: "92%" }} />
                </div>
              </div>
              <div>
                <dt className="mono" style={dtStyle}>
                  {t.addon.size}
                </dt>
                <dd style={{ margin: ".3rem 0 0", fontWeight: 600 }}>{addon.size}</dd>
              </div>
              <div>
                <dt className="mono" style={dtStyle}>
                  {t.addon.lastUpdate}
                </dt>
                <dd style={{ margin: ".3rem 0 0", fontWeight: 600 }}>{formatDate(addon.releasedAt, locale)}</dd>
              </div>
              <div>
                <dt className="mono" style={dtStyle}>
                  {t.addon.license}
                </dt>
                <dd style={{ margin: ".3rem 0 0", fontWeight: 600 }}>GPL-3.0</dd>
              </div>
            </dl>
            <DownloadButton
              slug={addon.slug}
              label={t.addon.download}
              variant="primary"
              className="btn-block"
            />
          </GlassCard>
        </Reveal>
      </div>

      <style>{`
        .addon-grid .btn-block { margin-top: 26px; }
        @media (max-width: 860px) {
          .addon-grid { grid-template-columns: 1fr !important; }
          .addon-grid .reveal[style*="sticky"] { position: static !important; }
        }
      `}</style>
    </div>
  );
}
