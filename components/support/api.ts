import { useEffect, useRef } from "react";
import type { SupportError } from "@/lib/support";

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: SupportError };

const KNOWN_ERRORS: readonly SupportError[] = [
  "unauthorized",
  "unavailable",
  "invalid",
  "not_found",
  "forbidden",
  "too_many_open",
  "rate_limited",
];

/** Appel aux routes /api/support ; toute panne réseau devient « unavailable ». */
export async function supportApi<T>(
  path: string,
  init?: { method: "POST" | "PATCH"; body: unknown },
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`/api/support${path}`, {
      method: init?.method ?? "GET",
      headers: init ? { "Content-Type": "application/json" } : undefined,
      body: init ? JSON.stringify(init.body) : undefined,
      cache: "no-store",
    });
    const json: unknown = await res.json().catch(() => null);
    if (res.ok) return { ok: true, data: json as T };
    const code = (json as { error?: unknown } | null)?.error;
    return {
      ok: false,
      error: KNOWN_ERRORS.includes(code as SupportError) ? (code as SupportError) : "unavailable",
    };
  } catch {
    return { ok: false, error: "unavailable" };
  }
}

/**
 * Rappelle `fn` toutes les `ms` tant que `enabled`, seulement onglet visible,
 * et une fois au retour sur l'onglet.
 */
export function usePolling(fn: () => unknown, ms: number, enabled: boolean): void {
  const saved = useRef(fn);
  useEffect(() => {
    saved.current = fn;
  }, [fn]);

  useEffect(() => {
    if (!enabled) return;
    const run = (): void => {
      if (document.visibilityState === "visible") void saved.current();
    };
    const timer = window.setInterval(run, ms);
    document.addEventListener("visibilitychange", run);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", run);
    };
  }, [ms, enabled]);
}
