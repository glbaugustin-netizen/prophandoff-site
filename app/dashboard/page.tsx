import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Card from "@/components/ui/Card";
import Reveal from "@/components/ui/Reveal";
import { MixedTitle } from "@/components/ui/MixedTitle";
import SignOutButton from "@/components/ui/SignOutButton";
import { getAddon, formatDate } from "@/lib/addons";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/locale-server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const metadata: Metadata = { title: "Dashboard" };

interface DownloadRow {
  id: string;
  addon_slug: string;
  version: string;
  created_at: string;
}

async function fetchDownloads(userId: string): Promise<DownloadRow[]> {
  const db = supabaseAdmin();
  if (!db) return [];
  const { data, error } = await db
    .from("downloads")
    .select("id, addon_slug, version, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[dashboard] downloads query failed:", error.message);
    return [];
  }
  return (data ?? []) as DownloadRow[];
}

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!session?.user || !userId) redirect("/sign-in");

  const user = session.user;
  const locale = await getLocale();
  const t = getDictionary(locale);
  const downloads = await fetchDownloads(userId);

  return (
    <div className="container page" style={{ maxWidth: 820 }}>
      <Reveal>
        <Card
          variant="panel"
          mist
          style={{ display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap", marginBottom: 26 }}
        >
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt=""
              width={64}
              height={64}
              style={{ border: "2px solid var(--ink)" }}
            />
          ) : (
            <span
              className="tile tile-amber"
              style={{ width: 64, height: 64, fontSize: "1.5rem", fontWeight: 700 }}
            >
              {(user.name ?? "?").charAt(0).toUpperCase()}
            </span>
          )}
          <div style={{ flex: 1, minWidth: 200 }}>
            <span className="eyebrow" style={{ fontSize: 11, marginBottom: 10 }}>
              {t.dashboard.account}
            </span>
            <MixedTitle as="h1" text={t.dashboard.title} style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)" }} />
            <p style={{ marginTop: 10, fontWeight: 500 }}>{user.name ?? t.dashboard.user}</p>
            <p className="muted" style={{ fontSize: ".92rem", marginTop: 2 }}>
              {user.email}
            </p>
          </div>
          <SignOutButton label={t.dashboard.signOut} />
        </Card>
      </Reveal>

      <Reveal delay={100}>
        <Card mist>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span className="eyebrow">{t.dashboard.downloads}</span>
            <span className="chip">{downloads.length}</span>
          </div>

          {downloads.length === 0 ? (
            <div
              className="field"
              style={{ marginTop: 22, justifyContent: "space-between" }}
            >
              <span>{t.dashboard.empty}</span>
              <a href="/addon/prop-handoff" className="btn btn-primary btn-sm">
                {t.dashboard.discover}
              </a>
            </div>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: "22px 0 0", display: "grid", gap: 10 }}>
              {downloads.map((d) => {
                const addon = getAddon(d.addon_slug, locale);
                return (
                  <li
                    key={d.id}
                    className="field"
                    style={{ justifyContent: "space-between" }}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
                      <span className="tile tile-amber" style={{ width: 40, height: 40, fontSize: 16 }}>
                        ↓
                      </span>
                      <span style={{ fontWeight: 600 }}>{addon?.name ?? d.addon_slug}</span>
                      <span className="chip">v{d.version}</span>
                    </span>
                    <span className="mono muted" style={{ fontSize: 12 }}>
                      {formatDate(d.created_at.slice(0, 10), locale)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </Reveal>
    </div>
  );
}
