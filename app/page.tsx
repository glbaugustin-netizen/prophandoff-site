import Link from "next/link";
import ScrollAnimation from "@/components/ScrollAnimation";
import HeroSkip from "@/components/HeroSkip";
import GlassCard from "@/components/ui/GlassCard";
import DownloadButton from "@/components/ui/DownloadButton";
import Reveal from "@/components/ui/Reveal";
import { MixedTitle } from "@/components/ui/MixedTitle";
import { getAddon } from "@/lib/addons";

const BENEFITS = [
  {
    icon: "⌘",
    title: "Zéro contrainte à la main",
    body: "Child Of, influence, compensation de transform : PropHandoff génère tout au frame exact. Vous cliquez, c'est keyframé.",
  },
  {
    icon: "◔",
    title: "Lisible sur la timeline",
    body: "Chaque transfert est marqué. Vous voyez d'un coup d'œil qui tient quoi, et quand, sans ouvrir le Graph Editor.",
  },
  {
    icon: "↺",
    title: "Non destructif",
    body: "Un handoff se déplace, se supprime ou se rejoue. Le rig reste propre, aucune constraint fantôme oubliée.",
  },
];

export default function HomePage() {
  const addon = getAddon("prop-handoff");

  return (
    <>
      <ScrollAnimation
        intro={{ title: "PropHandoff" }}
        stop1={{
          frame: 60,
          title: "Rigger un objet à un personnage *facilement* en *une seconde*",
        }}
        stop2={{ frame: 110, title: "Votre rig *sous contrôle*" }}
      />
      <HeroSkip />

      {/* Ce que PropHandoff change */}
      <section className="section after-hero" id="benefits">
        <div className="container">
          <Reveal>
            <span className="eyebrow">Pourquoi</span>
            <MixedTitle as="h2" className="section-title" text="Ce que PropHandoff *change*" />
            <p className="section-lead">
              Le transfert d&apos;un objet entre deux mains, deux personnages ou deux
              props est l&apos;une des opérations les plus pénibles de l&apos;animation
              Blender. Plus maintenant.
            </p>
          </Reveal>
          <div className="grid-3">
            {BENEFITS.map((b, i) => (
              <Reveal key={b.title} delay={i * 110}>
                <GlassCard tinted style={{ height: "100%", display: "grid", gap: 18 }}>
                  <span className="tile" aria-hidden="true">
                    {b.icon}
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
                  <span className="chip">Blender {addon.blender}</span>
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
                  <DownloadButton slug={addon.slug} variant="primary" label="Télécharger l'outil" />
                  <Link href={`/addon/${addon.slug}`} className="btn btn-glass">
                    Voir les détails
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
