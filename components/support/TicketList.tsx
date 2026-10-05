"use client";

import { useCallback, useEffect, useState } from "react";
import { useLang } from "@/components/LanguageProvider";
import { formatDateTime } from "@/lib/i18n";
import type { SupportError, TicketStatus, TicketSummary } from "@/lib/support";
import { supportApi, usePolling } from "./api";

interface ListData {
  isAdmin: boolean;
  tickets: TicketSummary[];
}

/** Liste des tickets : les siens, ou tous (onglets Ouverts / Fermés) pour le dev. */
export default function TicketList({ onOpen, onNew }: { onOpen: (id: string) => void; onNew: () => void }) {
  const { t, locale } = useLang();
  const [data, setData] = useState<ListData | null>(null);
  const [error, setError] = useState<SupportError | null>(null);
  const [tab, setTab] = useState<TicketStatus>("open");

  const load = useCallback(async () => {
    const res = await supportApi<ListData>("/tickets");
    if (res.ok) {
      setData(res.data);
      setError(null);
    } else {
      setError(res.error);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);
  usePolling(load, 20_000, true);

  const tickets = data ? (data.isAdmin ? data.tickets.filter((x) => x.status === tab) : data.tickets) : [];

  return (
    <>
      <div className="support-body">
        {data?.isAdmin ? (
          <div className="support-tabs" role="group">
            {(["open", "closed"] as const).map((s) => (
              <button
                key={s}
                type="button"
                className="support-tab"
                aria-pressed={tab === s}
                onClick={() => setTab(s)}
              >
                {s === "open" ? t.support.tabOpen : t.support.tabClosed}
              </button>
            ))}
          </div>
        ) : (
          <p className="support-lead">{t.support.lead}</p>
        )}

        {!data ? (
          error ? (
            <p className="support-error" role="alert">
              {t.support.errors[error]}
            </p>
          ) : (
            <p className="support-state">{t.support.loading}</p>
          )
        ) : tickets.length === 0 ? (
          <p className="support-empty">{t.support.empty}</p>
        ) : (
          <ul className="support-tickets">
            {tickets.map((ticket) => (
              <li key={ticket.id}>
                <button
                  type="button"
                  className={`support-ticket${ticket.unread ? " is-unread" : ""}`}
                  onClick={() => onOpen(ticket.id)}
                >
                  <span className="support-ticket-top">
                    <span className="chip">{t.support.kinds[ticket.kind]}</span>
                    <span className="support-date">{formatDateTime(ticket.updatedAt, locale)}</span>
                  </span>
                  <span className="support-ticket-subject">{ticket.subject}</span>
                  <span className="support-ticket-meta">
                    {ticket.user && <span>{ticket.user.name ?? ticket.user.email ?? t.support.visitor}</span>}
                    {!data.isAdmin && (
                      <span>{ticket.status === "open" ? t.support.statusOpen : t.support.statusClosed}</span>
                    )}
                    {ticket.unread && <span className="support-new">{t.support.newReply}</span>}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Le dev répond aux tickets, il n'en ouvre pas (refusé aussi côté serveur). */}
      {data && !data.isAdmin && (
        <footer className="support-foot">
          <button type="button" className="btn btn-primary btn-block" onClick={onNew}>
            {t.support.newTicket}
          </button>
        </footer>
      )}
    </>
  );
}
