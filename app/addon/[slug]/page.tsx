import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GlassCard from "@/components/ui/GlassCard";
import DownloadButton from "@/components/ui/DownloadButton";
import Reveal from "@/components/ui/Reveal";
import { MixedTitle } from "@/components/ui/MixedTitle";
import { ADDON_SLUGS, formatDate, getAddon } from "@/lib/addons";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/locale-server";
import JsonLd from "@/components/JsonLd";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://prophandoff-site.vercel.app";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams(): Array<{ slug: string }> {
  return ADDON_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const addon = getAddon(slug, locale);
  if (!addon) return {};
  const t = getDictionary(locale);
  return {
    title: { absolute: t.addon.pageTitle },
    description: t.addon.pageDescription,
    alternates: { canonical: `/addon/${addon.slug}` },
  };
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
            <span className="chip">v{addon.version}</span>
          </div>
          <MixedTitle
            as="h1"
            text={t.addon.h1}
            style={{ fontSize: "clamp(2.4rem, 5.5vw, 4.2rem)", marginBottom: ".35em" }}
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
            {t.addon.shortDescription}
          </p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <DownloadButton slug={addon.slug} label={t.addon.download} />
            <a
              href="https://github.com/studioslay696-ux/prop-handoff"
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
              <MixedTitle as="h2" text={t.addon.doesTitle} style={{ fontSize: "1.7rem", margin: "14px 0 12px" }} />
              <p className="muted" style={{ lineHeight: 1.55 }}>
                {addon.description}
              </p>
              <ul className="feature-list">
                {addon.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </GlassCard>
          </Reveal>

          {/* Installation */}
          <Reveal delay={120}>
            <GlassCard tinted>
              <MixedTitle as="h2" text={t.addon.installTitle} style={{ fontSize: "1.7rem", marginBottom: 12 }} />
              <p className="muted" style={{ lineHeight: 1.6, maxWidth: "68ch" }}>
                {t.addon.installText}
              </p>
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
                <dd style={{ margin: ".3rem 0 0", fontWeight: 600 }}>MIT</dd>
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

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: addon.name,
          applicationCategory: "DesignApplication",
          applicationSubCategory: "Blender Addon",
          operatingSystem: "Windows, macOS, Linux",
          softwareVersion: addon.version,
          softwareRequirements: "Blender 3.6 or later",
          description: t.addon.pageDescription,
          url: `${SITE_URL}/addon/${addon.slug}`,
          license: "https://opensource.org/licenses/MIT",
          isAccessibleForFree: true,
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }}
      />

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
