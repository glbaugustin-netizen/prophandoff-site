import Link from "next/link";
import ScrollAnimation from "@/components/ScrollAnimation";
import GlassCard from "@/components/ui/GlassCard";
import DownloadButton from "@/components/ui/DownloadButton";
import Reveal from "@/components/ui/Reveal";
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

const METRICS = [
  { label: "Une main", value: 92 },
  { label: "Deux mains", value: 78 },
  { label: "Simplicité", value: 100 },
];

export default function HomePage() {
  const addon = getAddon("prop-handoff");

  return (
    <>
      <ScrollAnimation
        stop1={{
          frame: 60,
          title: "Passez un objet en une seconde",
          description:
            "Plus besoin de gérer les contraintes à la main. PropHandoff keyframe automatiquement le transfert au frame exact.",
        }}
        stop2={{
          frame: 110,
          title: "Votre rig, sous contrôle",
          description:
            "Visualisez chaque transfert sur la timeline. Revenez en arrière, ajustez, itérez.",
        }}
      />

      {/* Ce que PropHandoff change */}
      <section className="section after-hero" id="benefits">
        <div className="container">
          <Reveal>
            <span className="eyebrow">Pourquoi</span>
            <h2 className="section-title">Ce que PropHandoff change</h2>
            <p className="section-lead">
              Le transfert d&apos;un objet entre deux mains, deux personnages ou deux
              props est l&apos;une des opérations les plus pénibles de l&apos;animation
              Blender. Plus maintenant.
            </p>
          </Reveal>
          <div className="grid-3">
            {BENEFITS.map((b, i) => (
              <Reveal key={b.title} delay={i * 110}>
                <GlassCard interactive style={{ height: "100%", display: "grid", gap: 18 }}>
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
                interactive
                style={{
                  display: "grid",
                  gap: "clamp(2rem, 4vw, 3.5rem)",
                  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22 }}>
                    <span className="chip chip-amber">v{addon.version}</span>
                    <span className="chip">Blender {addon.blender}</span>
                    <span className="chip chip-live">gratuit</span>
                  </div>
                  <h2 style={{ fontSize: "clamp(2.4rem, 5vw, 4rem)", marginBottom: ".4em" }}>
                    {addon.name}
                  </h2>
                  <p
                    style={{
                      maxWidth: "46ch",
                      marginBottom: "2rem",
                      color: "rgba(255,255,255,.9)",
                      fontSize: "1.05rem",
                      lineHeight: 1.5,
                      textShadow: "0 1px 10px rgba(0,0,0,.3)",
                    }}
                  >
                    {addon.tagline} {addon.description}
                  </p>
                  <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                    <DownloadButton slug={addon.slug} variant="primary" label="Télécharger l'outil" />
                    <Link href={`/addon/${addon.slug}`} className="btn btn-glass">
                      Voir les détails
                    </Link>
                  </div>
                </div>

                {/* carte "métriques" façon board */}
                <GlassCard
                  fine
                  style={{
                    borderRadius: 34,
                    padding: "28px 26px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 26,
                  }}
                >
                  <div
                    className="mono"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: ".12em",
                      textShadow: "0 1px 6px rgba(0,0,0,.4)",
                    }}
                  >
                    <span>HANDOFF · RIG</span>
                    <span style={{ color: "var(--dot)" }}>●</span>
                  </div>
                  <div style={{ display: "grid", gap: 14 }}>
                    {METRICS.map((m) => (
                      <div key={m.label} style={{ display: "grid", gap: 6 }}>
                        <span
                          className="mono"
                          style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.8)" }}
                        >
                          {m.label}
                        </span>
                        <div className="bar">
                          <i style={{ width: `${m.value}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <span
                    className="mono"
                    style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,.6)" }}
                  >
                    Prêt à keyframer en 1 clic
                  </span>
                </GlassCard>
              </GlassCard>
            </Reveal>
          </div>
        </section>
      )}

      {/* Teaser */}
      <section className="section" id="soon">
        <div className="container" style={{ textAlign: "center" }}>
          <Reveal>
            <span className="eyebrow">Bientôt</span>
            <h2 className="section-title">D&apos;autres outils arrivent</h2>
            <p className="section-lead" style={{ marginInline: "auto" }}>
              PropHandoff est le premier d&apos;une série d&apos;addons pensés pour les
              animateurs qui veulent passer moins de temps dans les contraintes et plus de
              temps à animer.
            </p>
          </Reveal>
          <Reveal delay={150}>
            <div
              style={{
                display: "flex",
                gap: 10,
                justifyContent: "center",
                flexWrap: "wrap",
                marginTop: "2.5rem",
              }}
            >
              <span className="chip">pose library sync</span>
              <span className="chip">camera handoff</span>
              <span className="chip">rig snapshots</span>
              <span className="chip chip-amber">bientôt</span>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
