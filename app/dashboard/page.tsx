import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import GlassCard from "@/components/ui/GlassCard";
import Reveal from "@/components/ui/Reveal";
import { MixedTitle } from "@/components/ui/MixedTitle";
import { getAddon, formatDate } from "@/lib/addons";
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
  const downloads = await fetchDownloads(userId);

  return (
    <div className="container page" style={{ maxWidth: 820 }}>
      <Reveal>
        <GlassCard
          variant="panel"
          interactive
          style={{ display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap", marginBottom: 26 }}
        >
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt=""
              width={64}
              height={64}
              style={{
                borderRadius: "50%",
                border: "1px solid rgba(255,255,255,.5)",
                boxShadow: "inset 0 1px 1px rgba(255,255,255,.6), 0 10px 22px -10px rgba(0,0,0,.5)",
              }}
            />
          ) : (
            <span
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "rgba(255,255,255,.92)",
                color: "var(--ink)",
                display: "grid",
                placeItems: "center",
                fontWeight: 700,
                fontSize: "1.5rem",
              }}
            >
              {(user.name ?? "?").charAt(0).toUpperCase()}
            </span>
          )}
          <div style={{ flex: 1, minWidth: 200 }}>
            <span className="eyebrow" style={{ fontSize: 11, marginBottom: 10 }}>
              Compte
            </span>
            <MixedTitle as="h1" text="Votre *espace*" style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)" }} />
            <p style={{ marginTop: 10, fontWeight: 500 }}>{user.name ?? "Utilisateur"}</p>
            <p className="muted" style={{ fontSize: ".92rem", marginTop: 2 }}>
              {user.email}
            </p>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button type="submit" className="btn btn-glass btn-sm">
              Sign out
            </button>
          </form>
        </GlassCard>
      </Reveal>

      <Reveal delay={100}>
        <GlassCard>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span className="eyebrow">Mes téléchargements</span>
            <span className="chip">{downloads.length}</span>
          </div>

          {downloads.length === 0 ? (
            <div
              className="field"
              style={{ marginTop: 22, justifyContent: "space-between", color: "rgba(255,255,255,.7)" }}
            >
              <span>Aucun téléchargement pour le moment.</span>
              <a href="/addon/prop-handoff" className="btn btn-primary btn-sm">
                Découvrir
              </a>
            </div>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: "22px 0 0", display: "grid", gap: 10 }}>
              {downloads.map((d) => {
                const addon = getAddon(d.addon_slug);
                return (
                  <li
                    key={d.id}
                    className="field"
                    style={{ justifyContent: "space-between", borderRadius: 20 }}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
                      <span className="tile tile-amber" style={{ width: 40, height: 40, fontSize: 16 }}>
                        ↓
                      </span>
                      <span style={{ fontWeight: 600 }}>{addon?.name ?? d.addon_slug}</span>
                      <span className="chip">v{d.version}</span>
                    </span>
                    <span className="mono muted" style={{ fontSize: 12 }}>
                      {formatDate(d.created_at.slice(0, 10))}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </GlassCard>
      </Reveal>
    </div>
  );
}
