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

const iconProps = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

/* Icônes monochromes des 3 fonctionnalités (même trait que la navbar). */
const FEATURE_ICONS = [
  // transfert instantané : un objet qui passe d'une main à l'autre
  <svg key="pass" {...iconProps}>
    <rect x="8.5" y="8.5" width="7" height="7" rx="1.8" />
    <path d="M3 12h4" />
    <path d="M5.5 9.5 3 12l2.5 2.5" />
    <path d="M17 12h4" />
    <path d="M18.5 9.5 21 12l-2.5 2.5" />
  </svg>,
  // prise à deux mains : deux poignées serrées autour d'un manche
  <svg key="grip" {...iconProps}>
    <path d="M12 3v18" />
    <path d="M5 8.5c0-1.4 1.1-2.5 2.5-2.5H10v7.5c0 1.4-1.1 2.5-2.5 2.5S5 14.9 5 13.5v-5Z" />
    <path d="M19 8.5c0-1.4-1.1-2.5-2.5-2.5H14v7.5c0 1.4 1.1 2.5 2.5 2.5S19 14.9 19 13.5v-5Z" />
    <path d="M7 10h3M14 10h3" />
  </svg>,
  // contrôle de la timeline : piste avec keyframes
  <svg key="timeline" {...iconProps}>
    <path d="M3 12h18" />
    <path d="m7 9.5 2.5 2.5L7 14.5 4.5 12 7 9.5Z" />
    <path d="m14.5 9.5 2.5 2.5-2.5 2.5-2.5-2.5 2.5-2.5Z" />
    <path d="M19.5 7.5v9" />
  </svg>,
];

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
                    {FEATURE_ICONS[i]}
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
