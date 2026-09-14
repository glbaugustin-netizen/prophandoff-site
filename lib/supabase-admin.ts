import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/** Vrai si les variables Supabase sont renseignées (pas des placeholders). */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  return url.startsWith("http") && key.length > 0 && !key.startsWith("placeholder");
}

/**
 * Client Supabase service-role (server only). Instancié à la demande pour
 * que le site tourne en local même sans clés (retourne `null` dans ce cas).
 */
export function supabaseAdmin(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  client ??= createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
  return client;
}
