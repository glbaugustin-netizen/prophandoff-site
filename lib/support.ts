/* ------------------------------------------------------------------ */
/*  Messagerie de support : types et limites partagés client / routes  */
/* ------------------------------------------------------------------ */

export const TICKET_KINDS = ["bug", "feature", "question"] as const;
export type TicketKind = (typeof TICKET_KINDS)[number];
export type TicketStatus = "open" | "closed";
/** « user » : la personne qui a ouvert le ticket ; « dev » : le développeur. */
export type MessageAuthor = "user" | "dev";

export const SUBJECT_MAX = 120;
export const BODY_MAX = 4000;
/** Tickets ouverts en même temps par compte (repris dans le message d'erreur). */
export const MAX_OPEN_TICKETS = 5;

export interface TicketSummary {
  id: string;
  kind: TicketKind;
  subject: string;
  status: TicketStatus;
  updatedAt: string;
  /** Réponse de l'autre côté pas encore lue par la personne qui regarde. */
  unread: boolean;
  /** Auteur du ticket : renvoyé au dev seulement. */
  user?: { name: string | null; email: string | null };
}

export interface TicketMessage {
  id: string;
  author: MessageAuthor;
  body: string;
  createdAt: string;
  /** Écrit par la personne qui regarde le fil. */
  mine: boolean;
}

export interface TicketThreadData {
  ticket: TicketSummary & { createdAt: string };
  messages: TicketMessage[];
}

/** Codes d'erreur des routes /api/support, traduits côté client. */
export type SupportError =
  | "unauthorized"
  | "unavailable"
  | "invalid"
  | "not_found"
  | "too_many_open"
  | "rate_limited";

export function isTicketKind(value: unknown): value is TicketKind {
  return typeof value === "string" && (TICKET_KINDS as readonly string[]).includes(value);
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID.test(value);
}
