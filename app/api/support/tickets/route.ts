import { NextResponse } from "next/server";
import {
  TICKET_COLUMNS,
  cleanBody,
  cleanKind,
  cleanSubject,
  fail,
  hasTooManyOpen,
  isRateLimited,
  isTrustedWrite,
  notifyDev,
  readJson,
  supportContext,
  toSummary,
  type TicketRow,
} from "@/lib/support-server";

/** Tickets de la personne connectée, ou tous les tickets pour le dev. */
export async function GET() {
  const ctx = await supportContext();
  if (ctx instanceof NextResponse) return ctx;
  const { db, viewer } = ctx;

  let query = db
    .from("support_tickets")
    .select(TICKET_COLUMNS)
    .order("updated_at", { ascending: false })
    .limit(100);
  if (!viewer.isAdmin) query = query.eq("user_id", viewer.id);

  const { data, error } = await query;
  if (error) {
    console.error("[support] list:", error.message);
    return fail("unavailable", 503);
  }
  return NextResponse.json({
    isAdmin: viewer.isAdmin,
    tickets: ((data ?? []) as TicketRow[]).map((row) => toSummary(row, viewer)),
  });
}

/** Nouveau ticket et son premier message. */
export async function POST(req: Request) {
  if (!isTrustedWrite(req)) return fail("invalid", 400);
  const ctx = await supportContext();
  if (ctx instanceof NextResponse) return ctx;
  const { db, viewer } = ctx;

  const input = await readJson(req);
  const kind = cleanKind(input?.kind);
  const subject = cleanSubject(input?.subject);
  const body = cleanBody(input?.body);
  if (!kind || !subject || !body) return fail("invalid", 400);

  if (!viewer.isAdmin) {
    if (await hasTooManyOpen(db, viewer.id)) return fail("too_many_open", 429);
    if (await isRateLimited(db, viewer.id)) return fail("rate_limited", 429);
  }

  const { data: ticket, error } = await db
    .from("support_tickets")
    .insert({ user_id: viewer.id, user_name: viewer.name, user_email: viewer.email, kind, subject })
    .select("id")
    .single();
  if (error || !ticket) {
    console.error("[support] create:", error?.message);
    return fail("unavailable", 503);
  }

  const { error: messageError } = await db
    .from("support_messages")
    .insert({ ticket_id: ticket.id, author: "user", author_id: viewer.id, body });
  if (messageError) {
    console.error("[support] first message:", messageError.message);
    return fail("unavailable", 503);
  }

  notifyDev(req, { id: ticket.id, kind, subject }, viewer, body, true);
  return NextResponse.json({ id: ticket.id }, { status: 201 });
}
