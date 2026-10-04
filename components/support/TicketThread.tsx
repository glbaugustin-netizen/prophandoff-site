"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLang } from "@/components/LanguageProvider";
import { formatDateTime } from "@/lib/i18n";
import {
  BODY_MAX,
  type SupportError,
  type TicketMessage,
  type TicketStatus,
  type TicketThreadData,
} from "@/lib/support";
import { supportApi, usePolling } from "./api";

/** Fil d'un ticket, rafraîchi toutes les 5 s tant qu'il est affiché. */
export default function TicketThread({ id }: { id: string }) {
  const { t, locale } = useLang();
  const [thread, setThread] = useState<TicketThreadData | null>(null);
  const [error, setError] = useState<SupportError | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [actionError, setActionError] = useState<SupportError | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const shownCount = useRef(0);

  const load = useCallback(async () => {
    const res = await supportApi<TicketThreadData>(`/tickets/${id}`);
    if (res.ok) {
      setThread(res.data);
      setError(null);
    } else {
      setError(res.error);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);
  usePolling(load, 5_000, true);

  // Descend en bas du fil quand un message arrive (pas à chaque rafraîchissement).
  useEffect(() => {
    const count = thread?.messages.length ?? 0;
    const box = scrollRef.current;
    if (box && count !== shownCount.current) box.scrollTop = box.scrollHeight;
    shownCount.current = count;
  }, [thread]);

  const send = async (): Promise<void> => {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    setActionError(null);
    const res = await supportApi<{ message: TicketMessage }>(`/tickets/${id}/messages`, {
      method: "POST",
      body: { body: text },
    });
    setSending(false);
    if (!res.ok) {
      setActionError(res.error);
      return;
    }
    setDraft("");
    setThread((current) => current && { ...current, messages: [...current.messages, res.data.message] });
    void load();
  };

  const setStatus = async (status: TicketStatus): Promise<void> => {
    setActionError(null);
    const res = await supportApi<{ status: TicketStatus }>(`/tickets/${id}`, { method: "PATCH", body: { status } });
    if (res.ok) void load();
    else setActionError(res.error);
  };

  if (!thread) {
    return error ? (
      <div className="support-body">
        <p className="support-error" role="alert">
          {t.support.errors[error]}
        </p>
      </div>
    ) : (
      <p className="support-state">{t.support.loading}</p>
    );
  }

  const { ticket, messages } = thread;
  // Le serveur ne renvoie l'auteur du ticket qu'au dev.
  const asDev = ticket.user !== undefined;
  const authorName = (m: TicketMessage): string =>
    m.mine
      ? t.support.you
      : m.author === "dev"
        ? t.support.dev
        : (ticket.user?.name ?? ticket.user?.email ?? t.support.visitor);

  return (
    <>
      <div className="support-thread-head">
        <span className="chip">{t.support.kinds[ticket.kind]}</span>
        <span className={`chip${ticket.status === "open" ? " chip-amber" : ""}`}>
          {ticket.status === "open" ? t.support.statusOpen : t.support.statusClosed}
        </span>
        <p className="support-thread-subject">{ticket.subject}</p>
        {ticket.user && (
          <p className="support-thread-user">{[ticket.user.name, ticket.user.email].filter(Boolean).join(" · ")}</p>
        )}
      </div>

      <div className="support-body support-messages" ref={scrollRef} aria-live="polite">
        {messages.map((m) => (
          <article key={m.id} className={`support-msg${m.mine ? " is-mine" : ""}`}>
            <p className="support-msg-meta">
              {authorName(m)} · {formatDateTime(m.createdAt, locale)}
            </p>
            <p className="support-msg-body">{m.body}</p>
          </article>
        ))}
      </div>

      <footer className="support-foot support-reply">
        {ticket.status === "closed" && !asDev && <p className="support-note">{t.support.closedNote}</p>}
        {actionError && (
          <p className="support-error" role="alert">
            {t.support.errors[actionError]}
          </p>
        )}
        <div className="support-reply-row">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                void send();
              }
            }}
            maxLength={BODY_MAX}
            rows={2}
            placeholder={t.support.replyPlaceholder}
            aria-label={t.support.replyPlaceholder}
          />
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => void send()}
            disabled={sending || !draft.trim()}
          >
            {sending ? t.support.sending : t.support.send}
          </button>
        </div>
        <button
          type="button"
          className="support-link"
          onClick={() => void setStatus(ticket.status === "open" ? "closed" : "open")}
        >
          {ticket.status === "open" ? t.support.closeTicket : t.support.reopenTicket}
        </button>
      </footer>
    </>
  );
}
