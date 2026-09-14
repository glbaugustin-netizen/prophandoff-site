import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/**
 * Client Supabase public (anon key), utilisable côté client.
 * Instancié à la demande ; `null` tant que les variables sont des placeholders.
 */
export function supabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  if (!url.startsWith("http") || anon.startsWith("placeholder") || !anon) return null;
  client ??= createClient(url, anon);
  return client;
}
