import { NextResponse } from "next/server";
import { isUnread, roleOf, supportContext, type TicketRow } from "@/lib/support-server";

/**
 * Nombre de tickets avec une réponse non lue, pour la pastille du bouton.
 * Hors connexion ou base indisponible : 0, sans erreur (la pastille disparaît).
 */
export async function GET() {
  const ctx = await supportContext();
  if (ctx instanceof NextResponse) return NextResponse.json({ count: 0 });
  const { db, viewer } = ctx;

  const role = roleOf(viewer);
  // Les comparaisons entre colonnes ne passent pas par l'API REST : on filtre ici.
  let query = db
    .from("support_tickets")
    .select("last_author, updated_at, user_read_at, dev_read_at")
    .neq("last_author", role)
    .limit(200);
  if (!viewer.isAdmin) query = query.eq("user_id", viewer.id);

  const { data, error } = await query;
  if (error) return NextResponse.json({ count: 0 });
  const rows = (data ?? []) as Pick<TicketRow, "last_author" | "updated_at" | "user_read_at" | "dev_read_at">[];
  return NextResponse.json({ count: rows.filter((row) => isUnread(row, role)).length });
}
