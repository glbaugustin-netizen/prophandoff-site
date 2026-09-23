import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { redirect } from "next/navigation";

const DOWNLOAD_URLS: Record<string, string> = {
  "prop-handoff":
    "https://github.com/glbaugustin-netizen/prop-handoff/releases/download/v0.3.3/prop_handoff_v0.3.3.zip",
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ addon: string }> },
) {
  const { addon } = await params;
  const url = DOWNLOAD_URLS[addon];
  if (!url) return new Response("Not found", { status: 404 });

  const session = await auth();
  const db = supabaseAdmin();

  if (session?.user?.id && db) {
    const { error } = await db.from("downloads").insert({
      user_id: session.user.id,
      addon_slug: addon,
      version: "0.3.3",
    });
    if (error) console.error("[download] insert failed:", error.message);
  }

  return redirect(url);
}
