"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useLang } from "@/components/LanguageProvider";
import { isUuid } from "@/lib/support";
import { supportApi, usePolling } from "./api";
import NewTicketForm from "./NewTicketForm";
import TicketList from "./TicketList";
import TicketThread from "./TicketThread";

type View = { name: "list" } | { name: "new" } | { name: "thread"; id: string };

const strokeIcon = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinejoin: "miter",
  "aria-hidden": true,
} as const;

const ChatIcon = (
  <svg {...strokeIcon}>
    <path d="M4 5h16v11H10l-6 4V5Z" />
    <path d="M8 9.5h8M8 12.5h5" />
  </svg>
);
const CloseIcon = (
  <svg {...strokeIcon}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);
const BackIcon = (
  <svg {...strokeIcon} width={20} height={20}>
    <path d="M15 5 8 12l7 7" />
  </svg>
);

/**
 * Bouton flottant « Contacter le dev » et son panneau de tickets, monté une
 * fois dans le layout. Caché pendant l'animation du hero, comme la navbar
 * (body[data-hero-nav="hidden"]) : le coin appartient alors au bouton SKIP.
 */
export default function SupportWidget() {
  const { status } = useSession();
  const { t } = useLang();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>({ name: "list" });
  const [unread, setUnread] = useState(0);
  const signedIn = status === "authenticated";

  // Rendu après le montage seulement : l'animation du hero (montée avant dans
  // l'arbre) a déjà posé data-hero-nav, donc le bouton naît caché sur l'accueil.
  useEffect(() => setMounted(true), []);

  const refreshUnread = useCallback(async () => {
    const res = await supportApi<{ count: number }>("/unread");
    if (res.ok) setUnread(res.data.count);
  }, []);

  // Pastille : à la connexion, à chaque fermeture du panneau, puis chaque minute.
  useEffect(() => {
    if (!signedIn) setUnread(0);
    else if (!open) void refreshUnread();
  }, [signedIn, open, refreshUnread]);
  usePolling(refreshUnread, 60_000, signedIn && !open);

  // Lien profond ?support=open|<id> : retour de connexion Google, lien Discord.
  useEffect(() => {
    const url = new URL(window.location.href);
    const target = url.searchParams.get("support");
    if (!target) return;
    setOpen(true);
    if (isUuid(target)) setView({ name: "thread", id: target });
    url.searchParams.delete("support");
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const signInHere = (): void => {
    // Sur l'accueil, #addon fait atterrir sous l'animation, là où le panneau est visible.
    const back = pathname === "/" ? "/?support=open#addon" : `${pathname}?support=open`;
    void signIn("google", { redirectTo: back });
  };

  const fabLabel =
    unread > 0 ? `${t.support.fabAria} (${unread} ${t.support.unreadAria})` : t.support.fabAria;

  if (!mounted) return null;

  return (
    <>
      {open && (
        <section id="support-panel" className="support-panel" role="dialog" aria-labelledby="support-title">
          <header className="support-head">
            {signedIn && view.name !== "list" && (
              <button
                type="button"
                className="support-icon-btn"
                onClick={() => setView({ name: "list" })}
                aria-label={t.support.back}
              >
                {BackIcon}
              </button>
            )}
            <h2 id="support-title" className="support-title">
              {t.support.title}
            </h2>
            <button
              type="button"
              className="support-icon-btn"
              onClick={() => setOpen(false)}
              aria-label={t.support.close}
            >
              {CloseIcon}
            </button>
          </header>

          {status === "loading" ? (
            <p className="support-state">{t.support.loading}</p>
          ) : !signedIn ? (
            <div className="support-body">
              <p className="support-lead">{t.support.lead}</p>
              <p className="muted">{t.support.signInLead}</p>
              <button type="button" className="btn btn-primary btn-block" onClick={signInHere}>
                {t.support.signIn}
              </button>
            </div>
          ) : view.name === "new" ? (
            <NewTicketForm
              onCreated={(id) => setView({ name: "thread", id })}
              onCancel={() => setView({ name: "list" })}
            />
          ) : view.name === "thread" ? (
            <TicketThread key={view.id} id={view.id} />
          ) : (
            <TicketList onOpen={(id) => setView({ name: "thread", id })} onNew={() => setView({ name: "new" })} />
          )}
        </section>
      )}

      <button
        type="button"
        className="support-fab"
        aria-expanded={open}
        aria-controls="support-panel"
        aria-label={open ? t.support.close : fabLabel}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? CloseIcon : ChatIcon}
        {!open && (
          <span className="support-fab-tip" aria-hidden="true">
            {t.support.fabAria}
          </span>
        )}
        {!open && unread > 0 && (
          <span className="support-badge" aria-hidden="true">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
    </>
  );
}
