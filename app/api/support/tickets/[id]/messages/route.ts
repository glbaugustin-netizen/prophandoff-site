import { NextResponse } from "next/server";
import type { MessageAuthor, TicketMessage } from "@/lib/support";
import {
  cleanBody,
  fail,
  isRateLimited,
  isTrustedWrite,
  loadTicket,
  notifyDev,
  readJson,
  roleOf,
  supportContext,
} from "@/lib/support-server";

type Params = { params: Promise<{ id: string }> };

/**
 * Réponse dans un fil. Un message du visiteur rouvre un ticket fermé (trigger
 * SQL) et prévient le dev ; un message du dev ne change pas le statut.
 */
export async function POST(req: Request, { params }: Params) {
  if (!isTrustedWrite(req)) return fail("invalid", 400);
  const ctx = await supportContext();
  if (ctx instanceof NextResponse) return ctx;
  const { db, viewer } = ctx;

  const ticket = await loadTicket(db, (await params).id, viewer);
  if (ticket instanceof NextResponse) return ticket;

  const body = cleanBody((await readJson(req))?.body);
  if (!body) return fail("invalid", 400);
  if (!viewer.isAdmin && (await isRateLimited(db, viewer.id))) return fail("rate_limited", 429);

  const author = roleOf(viewer);
  const { data, error } = await db
    .from("support_messages")
    .insert({ ticket_id: ticket.id, author, author_id: viewer.id, body })
    .select("id, author, body, created_at")
    .single();
  if (error || !data) {
    console.error("[support] reply:", error?.message);
    return fail("unavailable", 503);
  }

  if (author === "user") notifyDev(req, ticket, viewer, body, false);

  const message: TicketMessage = {
    id: data.id as string,
    author: data.author as MessageAuthor,
    body: data.body as string,
    createdAt: data.created_at as string,
    mine: true,
  };
  return NextResponse.json({ message }, { status: 201 });
}
