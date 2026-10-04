import { NextResponse } from "next/server";
import type { MessageAuthor, TicketMessage } from "@/lib/support";
import {
  fail,
  isTrustedWrite,
  loadTicket,
  readJson,
  roleOf,
  supportContext,
  toSummary,
} from "@/lib/support-server";

type Params = { params: Promise<{ id: string }> };

interface MessageRow {
  id: string;
  author: MessageAuthor;
  body: string;
  created_at: string;
}

/** Fil d'un ticket, marqué comme lu pour la personne qui le consulte. */
export async function GET(_req: Request, { params }: Params) {
  const ctx = await supportContext();
  if (ctx instanceof NextResponse) return ctx;
  const { db, viewer } = ctx;

  const ticket = await loadTicket(db, (await params).id, viewer);
  if (ticket instanceof NextResponse) return ticket;

  const { data, error } = await db
    .from("support_messages")
    .select("id, author, body, created_at")
    .eq("ticket_id", ticket.id)
    .order("created_at", { ascending: true })
    .limit(500);
  if (error) {
    console.error("[support] messages:", error.message);
    return fail("unavailable", 503);
  }

  const role = roleOf(viewer);
  const summary = toSummary(ticket, viewer);
  if (summary.unread) {
    // Lu jusqu'au dernier message renvoyé : on reprend sa date (horloge de la
    // base) plutôt que celle du serveur, pour qu'un décalage ne le laisse pas « non lu ».
    const column = role === "dev" ? "dev_read_at" : "user_read_at";
    const { error: readError } = await db
      .from("support_tickets")
      .update({ [column]: ticket.updated_at })
      .eq("id", ticket.id);
    if (readError) console.error("[support] mark read:", readError.message);
    else summary.unread = false;
  }

  const messages: TicketMessage[] = ((data ?? []) as MessageRow[]).map((m) => ({
    id: m.id,
    author: m.author,
    body: m.body,
    createdAt: m.created_at,
    mine: m.author === role,
  }));
  return NextResponse.json({ ticket: { ...summary, createdAt: ticket.created_at }, messages });
}

/** Ouvre ou ferme un ticket (son auteur ou le dev). */
export async function PATCH(req: Request, { params }: Params) {
  if (!isTrustedWrite(req)) return fail("invalid", 400);
  const ctx = await supportContext();
  if (ctx instanceof NextResponse) return ctx;
  const { db, viewer } = ctx;

  const ticket = await loadTicket(db, (await params).id, viewer);
  if (ticket instanceof NextResponse) return ticket;

  const status = (await readJson(req))?.status;
  if (status !== "open" && status !== "closed") return fail("invalid", 400);

  const { error } = await db.from("support_tickets").update({ status }).eq("id", ticket.id);
  if (error) {
    console.error("[support] status:", error.message);
    return fail("unavailable", 503);
  }
  return NextResponse.json({ status });
}
