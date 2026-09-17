import ScrollAnimation from "@/components/ScrollAnimation";
import HeroSkip from "@/components/HeroSkip";
import GlassCard from "@/components/ui/GlassCard";
import DownloadButton from "@/components/ui/DownloadButton";
import Reveal from "@/components/ui/Reveal";
import { MixedTitle } from "@/components/ui/MixedTitle";
import { getAddon } from "@/lib/addons";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/locale-server";

const GITHUB_URL = "https://github.com/studioslay696-ux/prop-handoff";
const FEATURE_ICONS = ["⌘", "✋", "◔"];

export default async function HomePage() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const addon = getAddon("prop-handoff", locale);

  return (
    <>
      <ScrollAnimation
        intro={{ title: t.hero.intro }}
        stop1={{ frame: 60, title: t.hero.stop1, description: t.hero.stop1Description }}
        stop2={{ frame: 110, title: t.hero.stop2, description: t.hero.stop2Description }}
      />
      <HeroSkip />

      {/* Bloc SEO : h1 + sous-titre + 3 fonctionnalités, en texte brut (pas de verre) */}
      <section className="section after-hero" id="features">
        <div className="container">
          <Reveal>
            <span className="eyebrow">{t.home.eyebrow}</span>
            <MixedTitle as="h1" className="section-title" text={t.home.h1} />
            <p className="section-lead">{t.home.subtitle}</p>
          </Reveal>
          <div className="grid-3 features">
            {t.home.features.map((f, i) => (
              <Reveal key={f.title} delay={i * 110}>
                <article className="feature">
                  <span className="tile" aria-hidden="true">
                    {FEATURE_ICONS[i] ?? "•"}
                  </span>
                  <MixedTitle as="h2" text={f.title} className="feature-title" />
                  <p className="muted" style={{ lineHeight: 1.55 }}>
                    {f.body}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Bulle de téléchargement */}
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
                  <span className="chip">
                    {t.home.blenderChip} {addon.blender}
                  </span>
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
                  }}
                >
                  {addon.tagline}
                </p>
                <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
                  <DownloadButton slug={addon.slug} variant="primary" label={t.home.ctaPrimary} />
                  <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="btn btn-glass">
                    {t.home.ctaSecondary}
                  </a>
                </div>
              </GlassCard>
            </Reveal>

            {/* Texte de présentation, sous la bulle, en texte brut */}
            <Reveal delay={120}>
              <p className="about">{t.home.about}</p>
            </Reveal>
          </div>
        </section>
      )}
    </>
  );
}
