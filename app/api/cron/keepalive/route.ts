import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * Appelée chaque jour par Vercel Cron (vercel.json). Une requête légère suffit à
 * garder actif le projet Supabase gratuit, mis en pause après 7 jours sans
 * activité, ce qui couperait l'enregistrement des téléchargements et le support.
 * Si CRON_SECRET est défini sur Vercel, seul l'appel du cron est accepté.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const db = supabaseAdmin();
  if (!db) return NextResponse.json({ ok: false }, { status: 503 });

  const { error } = await db.from("downloads").select("id", { count: "exact", head: true });
  if (error) {
    console.error("[keepalive]", error.message);
    return NextResponse.json({ ok: false }, { status: 503 });
  }
  return NextResponse.json({ ok: true });
}
