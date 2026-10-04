"use client";

import { useState, type FormEvent } from "react";
import { useLang } from "@/components/LanguageProvider";
import { BODY_MAX, SUBJECT_MAX, TICKET_KINDS, type SupportError, type TicketKind } from "@/lib/support";
import { supportApi } from "./api";

/** Ouverture d'un ticket : type, sujet, premier message. */
export default function NewTicketForm({
  onCreated,
  onCancel,
}: {
  onCreated: (id: string) => void;
  onCancel: () => void;
}) {
  const { t } = useLang();
  const [kind, setKind] = useState<TicketKind>("bug");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<SupportError | null>(null);

  const submit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setError(null);
    const res = await supportApi<{ id: string }>("/tickets", { method: "POST", body: { kind, subject, body } });
    setSending(false);
    if (res.ok) onCreated(res.data.id);
    else setError(res.error);
  };

  const ready = subject.trim() !== "" && body.trim() !== "";

  return (
    <form className="support-form" onSubmit={(e) => void submit(e)}>
      <div className="support-body">
        <p className="support-label" id="support-kind-label">
          {t.support.kindLabel}
        </p>
        <div className="support-kinds" role="radiogroup" aria-labelledby="support-kind-label">
          {TICKET_KINDS.map((k) => (
            <label key={k} className={`support-kind${kind === k ? " is-on" : ""}`}>
              <input
                type="radio"
                name="support-kind"
                value={k}
                checked={kind === k}
                onChange={() => setKind(k)}
              />
              {t.support.kinds[k]}
            </label>
          ))}
        </div>

        <label className="support-label" htmlFor="support-subject">
          {t.support.subjectLabel}
        </label>
        <input
          id="support-subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          maxLength={SUBJECT_MAX}
          placeholder={t.support.subjectPlaceholder}
          required
          autoFocus
        />

        <label className="support-label" htmlFor="support-message">
          {t.support.messageLabel}
        </label>
        <textarea
          id="support-message"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={BODY_MAX}
          placeholder={t.support.messagePlaceholder}
          rows={7}
          required
        />

        {error && (
          <p className="support-error" role="alert">
            {t.support.errors[error]}
          </p>
        )}
      </div>
      <footer className="support-foot">
        <button type="button" className="btn btn-secondary btn-sm" onClick={onCancel}>
          {t.support.cancel}
        </button>
        <button type="submit" className="btn btn-primary btn-sm" disabled={sending || !ready}>
          {sending ? t.support.sending : t.support.create}
        </button>
      </footer>
    </form>
  );
}
