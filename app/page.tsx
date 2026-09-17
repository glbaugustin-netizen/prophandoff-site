import Link from "next/link";
import ScrollAnimation from "@/components/ScrollAnimation";
import HeroSkip from "@/components/HeroSkip";
import GlassCard from "@/components/ui/GlassCard";
import DownloadButton from "@/components/ui/DownloadButton";
import Reveal from "@/components/ui/Reveal";
import { MixedTitle } from "@/components/ui/MixedTitle";
import { getAddon } from "@/lib/addons";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/locale-server";

const BENEFIT_ICONS = ["⌘", "◔", "↺"];

export default async function HomePage() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const addon = getAddon("prop-handoff", locale);

  return (
    <>
      <ScrollAnimation
        intro={{ title: t.hero.intro }}
        stop1={{ frame: 60, title: t.hero.stop1 }}
        stop2={{ frame: 110, title: t.hero.stop2 }}
      />
      <HeroSkip />

      {/* Ce que PropHandoff change */}
      <section className="section after-hero" id="benefits">
        <div className="container">
          <Reveal>
            <span className="eyebrow">{t.home.whyEyebrow}</span>
            <MixedTitle as="h2" className="section-title" text={t.home.whyTitle} />
            <p className="section-lead">{t.home.whyLead}</p>
          </Reveal>
          <div className="grid-3">
            {t.home.benefits.map((b, i) => (
              <Reveal key={b.title} delay={i * 110}>
                <GlassCard tinted style={{ height: "100%", display: "grid", gap: 18 }}>
                  <span className="tile" aria-hidden="true">
                    {BENEFIT_ICONS[i] ?? "•"}
                  </span>
                  <h3 style={{ fontSize: "1.3rem", letterSpacing: "-.02em" }}>{b.title}</h3>
                  <p className="muted" style={{ lineHeight: 1.55 }}>
                    {b.body}
                  </p>
                </GlassCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Addon featured */}
      {addon && (
        <section className="section" id="addon" style={{ paddingTop: 0 }}>
          <div className="container">
            <Reveal>
              <GlassCard
                variant="panel"
                tinted
                style={{ maxWidth: 760, marginInline: "auto", textAlign: "center" }}
              >
                <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap", marginBottom: 22 }}>
                  <span className="chip">{t.home.blenderChip} {addon.blender}</span>
                </div>
                <h2 style={{ fontSize: "clamp(2.4rem, 5vw, 4rem)", marginBottom: ".4em" }}>
                  {addon.name}
                </h2>
                <p
                  style={{
                    maxWidth: "52ch",
                    marginInline: "auto",
                    marginBottom: "2rem",
                    color: "rgba(255,255,255,.9)",
                    fontSize: "1.05rem",
                    lineHeight: 1.5,
                    textShadow: "0 1px 10px rgba(0,0,0,.3)",
                  }}
                >
                  {addon.tagline} {addon.description}
                </p>
                <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
                  <DownloadButton slug={addon.slug} variant="primary" label={t.home.downloadTool} />
                  <Link href={`/addon/${addon.slug}`} className="btn btn-glass">
                    {t.home.seeDetails}
                  </Link>
                </div>
              </GlassCard>
            </Reveal>
          </div>
        </section>
      )}
    </>
  );
}
