import "server-only";
import { NextResponse, after } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  BODY_MAX,
  MAX_OPEN_TICKETS,
  SUBJECT_MAX,
  isTicketKind,
  isUuid,
  type MessageAuthor,
  type SupportError,
  type TicketKind,
  type TicketStatus,
  type TicketSummary,
} from "@/lib/support";

/** Messages par compte sur la fenêtre glissante (le dev n'est pas limité). */
const MAX_MESSAGES_PER_WINDOW = 10;
const RATE_WINDOW_MS = 10 * 60 * 1000;

export interface Viewer {
  id: string;
  name: string | null;
  email: string | null;
  /** Adresse inscrite dans la table support_admins : répond en tant que « dev ». */
  isAdmin: boolean;
}

export interface TicketRow {
  id: string;
  user_id: string;
  user_name: string | null;
  user_email: string | null;
  kind: TicketKind;
  subject: string;
  status: TicketStatus;
  last_author: MessageAuthor;
  created_at: string;
  updated_at: string;
  user_read_at: string | null;
  dev_read_at: string | null;
}

export const TICKET_COLUMNS =
  "id, user_id, user_name, user_email, kind, subject, status, last_author, created_at, updated_at, user_read_at, dev_read_at";

export function fail(error: SupportError, status: number): NextResponse {
  return NextResponse.json({ error }, { status });
}

/**
 * Contexte commun des routes : personne connectée et base joignable, sinon la
 * réponse d'erreur à renvoyer telle quelle.
 */
export async function supportContext(): Promise<{ db: SupabaseClient; viewer: Viewer } | NextResponse> {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) return fail("unauthorized", 401);

  const db = supabaseAdmin();
  if (!db) return fail("unavailable", 503);

  // Le dev est reconnu à l'adresse de son compte Google (vérifiée par Google).
  const email = session.user?.email ?? null;
  let isAdmin = false;
  if (email) {
    const { data, error } = await db
      .from("support_admins")
      .select("email")
      .eq("email", email.trim().toLowerCase())
      .maybeSingle();
    if (error) {
      console.error("[support] admins:", error.message);
      return fail("unavailable", 503);
    }
    isAdmin = data !== null;
  }
  return { db, viewer: { id, name: session.user?.name ?? null, email, isAdmin } };
}

/** Le dev écrit en « dev », tout le monde d'autre en « user ». */
export function roleOf(viewer: Viewer): MessageAuthor {
  return viewer.isAdmin ? "dev" : "user";
}

/** Réponse de l'autre côté postérieure à la dernière lecture de `role`. */
export function isUnread(
  row: Pick<TicketRow, "last_author" | "updated_at" | "user_read_at" | "dev_read_at">,
  role: MessageAuthor,
): boolean {
  if (row.last_author === role) return false;
  const readAt = role === "dev" ? row.dev_read_at : row.user_read_at;
  return !readAt || Date.parse(row.updated_at) > Date.parse(readAt);
}

export function toSummary(row: TicketRow, viewer: Viewer): TicketSummary {
  return {
    id: row.id,
    kind: row.kind,
    subject: row.subject,
    status: row.status,
    updatedAt: row.updated_at,
    unread: isUnread(row, roleOf(viewer)),
    ...(viewer.isAdmin ? { user: { name: row.user_name, email: row.user_email } } : {}),
  };
}

/** Ticket lisible par la personne : le sien, ou n'importe lequel pour le dev. */
export async function loadTicket(db: SupabaseClient, id: string, viewer: Viewer): Promise<TicketRow | NextResponse> {
  if (!isUuid(id)) return fail("not_found", 404);
  const { data, error } = await db.from("support_tickets").select(TICKET_COLUMNS).eq("id", id).maybeSingle();
  if (error) {
    console.error("[support] ticket:", error.message);
    return fail("unavailable", 503);
  }
  const row = data as TicketRow | null;
  // Le ticket d'un autre est « introuvable » plutôt qu'« interdit » : rien ne fuit.
  if (!row || (!viewer.isAdmin && row.user_id !== viewer.id)) return fail("not_found", 404);
  return row;
}

/**
 * Les écritures n'acceptent que du JSON envoyé depuis le site lui-même
 * (en plus du cookie de session SameSite=Lax).
 */
export function isTrustedWrite(req: Request): boolean {
  if (!req.headers.get("content-type")?.includes("application/json")) return false;
  const origin = req.headers.get("origin");
  if (!origin) return true;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function readJson(req: Request): Promise<Record<string, unknown> | null> {
  const value: unknown = await req.json().catch(() => null);
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

/** Texte de message nettoyé, ou null s'il est vide ou trop long. */
export function cleanBody(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text && text.length <= BODY_MAX ? text : null;
}

export function cleanSubject(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim().replace(/\s+/g, " ");
  return text && text.length <= SUBJECT_MAX ? text : null;
}

export function cleanKind(value: unknown): TicketKind | null {
  return isTicketKind(value) ? value : null;
}

export async function hasTooManyOpen(db: SupabaseClient, userId: string): Promise<boolean> {
  const { count, error } = await db
    .from("support_tickets")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "open");
  return !error && (count ?? 0) >= MAX_OPEN_TICKETS;
}

export async function isRateLimited(db: SupabaseClient, userId: string): Promise<boolean> {
  const since = new Date(Date.now() - RATE_WINDOW_MS).toISOString();
  const { count, error } = await db
    .from("support_messages")
    .select("id", { count: "exact", head: true })
    .eq("author_id", userId)
    .gte("created_at", since);
  return !error && (count ?? 0) >= MAX_MESSAGES_PER_WINDOW;
}

const KIND_LABEL: Record<TicketKind, string> = { bug: "Bug", feature: "Idée", question: "Question" };

/**
 * Prévient le dev sur Discord quand un visiteur écrit, si le webhook
 * facultatif SUPPORT_DISCORD_WEBHOOK_URL est défini. Envoyé après la réponse
 * HTTP : n'ajoute aucune attente côté visiteur.
 */
export function notifyDev(
  req: Request,
  ticket: { id: string; kind: TicketKind; subject: string },
  from: Viewer,
  body: string,
  isNew: boolean,
): void {
  const webhook = process.env.SUPPORT_DISCORD_WEBHOOK_URL;
  if (!webhook) return;

  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const link = `https://${host}/?support=${ticket.id}#addon`;
  const who = from.name ?? from.email ?? "Quelqu'un";
  const head = isNew ? `Nouveau ticket · ${KIND_LABEL[ticket.kind]}` : "Nouvelle réponse";
  const excerpt = body.length > 600 ? `${body.slice(0, 600)}…` : body;
  const quoted = excerpt
    .split("\n")
    .map((line) => `> ${line}`)
    .join("\n");
  const content = `**${head}** · « ${ticket.subject} » · ${who}\n${quoted}\n${link}`;

  after(async () => {
    try {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // allowed_mentions vide : un @everyone tapé par un visiteur ne notifie personne.
        body: JSON.stringify({ content: content.slice(0, 2000), allowed_mentions: { parse: [] } }),
      });
      if (!res.ok) console.error("[support] discord:", res.status);
    } catch (e) {
      console.error("[support] discord:", e instanceof Error ? e.message : e);
    }
  });
}
