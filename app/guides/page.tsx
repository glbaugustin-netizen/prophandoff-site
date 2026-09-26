import type { Metadata } from "next";
import Card from "@/components/ui/Card";
import Reveal from "@/components/ui/Reveal";
import { MixedTitle } from "@/components/ui/MixedTitle";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/locale-server";

const GITHUB_URL = "https://github.com/glbaugustin-netizen/prop-handoff";

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(await getLocale());
  return {
    title: { absolute: t.guides.pageTitle },
    description: t.guides.pageDescription,
    alternates: { canonical: "/guides" },
  };
}

export default async function GuidesPage() {
  const t = getDictionary(await getLocale());

  return (
    <div className="container page" style={{ maxWidth: 860 }}>
      <Reveal>
        <span className="eyebrow">{t.guides.eyebrow}</span>
        <MixedTitle as="h1" className="section-title" text={t.guides.title} />
        <p className="section-lead">{t.guides.lead}</p>
      </Reveal>

      <ol style={{ listStyle: "none", padding: 0, margin: "2.5rem 0 0", display: "grid", gap: 22 }}>
        {t.guides.items.map((guide, i) => (
          <li key={guide.title}>
            <Reveal delay={i * 90}>
              <Card variant="panel">
                <span className="chip chip-amber">{String(i + 1).padStart(2, "0")}</span>
                <h2 style={{ fontSize: "clamp(1.5rem, 2.6vw, 2rem)", margin: "16px 0 8px" }}>
                  {guide.title}
                </h2>
                <p className="muted">{guide.intro}</p>
                <ol className="feature-list" style={{ counterReset: "step" }}>
                  {guide.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </Card>
            </Reveal>
          </li>
        ))}
      </ol>

      <Reveal delay={320}>
        <Card mist style={{ marginTop: 22 }}>
          <h2 style={{ fontSize: "1.4rem", marginBottom: 10 }}>{t.guides.manualTitle}</h2>
          <p className="muted" style={{ lineHeight: 1.6 }}>
            {t.guides.manualText}
          </p>
          <a
            href={`${GITHUB_URL}#documentation`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary"
            style={{ marginTop: 22 }}
          >
            {t.guides.manualCta}
          </a>
        </Card>
      </Reveal>
    </div>
  );
}
