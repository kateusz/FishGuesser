import { execFileSync } from "node:child_process";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { GameError } from "@/server/errors";

const PROJECT_URL = "https://iawtnxvsiwywlbwkggbf.supabase.co";

let secretCache: string | undefined;

export function supabaseUrl(): string {
  return process.env.SUPABASE_URL || PROJECT_URL;
}

export function supabaseSecret(): string {
  if (secretCache) return secretCache;
  const fromProcess = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_API_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (fromProcess) {
    secretCache = fromProcess;
    return secretCache;
  }
  if (process.platform === "win32") {
    const value = execFileSync(
      "powershell",
      ["-NoProfile", "-Command", "[Environment]::GetEnvironmentVariable('SUPABASE_API_KEY','User')"],
      { encoding: "utf8" },
    ).trim();
    if (value) {
      secretCache = value;
      return secretCache;
    }
  }
  throw new GameError(503, "SERVICE_UNAVAILABLE", "Brak klucza Supabase.");
}

export function serviceClient(): SupabaseClient {
  const cached = globalThis as unknown as { __fgService?: SupabaseClient };
  if (!cached.__fgService) {
    const key = supabaseSecret();
    cached.__fgService = createClient(supabaseUrl(), key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { "User-Agent": "fishguesser-server" } },
    });
  }
  return cached.__fgService;
}

export function dbError(error: { code?: string; message: string } | null): void {
  if (!error) return;
  console.error(error.code, error.message);
  if (error.code === "23505") throw new GameError(409, "NICKNAME_TAKEN", "Ten nick jest zajęty.");
  throw new GameError(500, "INTERNAL_ERROR", "Błąd bazy.");
}

export async function consumeRate(key: string, limit: number, windowMs: number): Promise<boolean> {
  const db = serviceClient();
  const now = Date.now();
  const current = await db.from("rate_limits").select("hits, window_start").eq("bucket", key).maybeSingle();
  dbError(current.error);
  const row = current.data as { hits: number; window_start: number } | null;
  if (!row || now - Number(row.window_start) >= windowMs) {
    const saved = await db.from("rate_limits").upsert({ bucket: key, hits: 1, window_start: now });
    dbError(saved.error);
    return true;
  }
  if (Number(row.hits) >= limit) return false;
  const saved = await db.from("rate_limits").update({ hits: Number(row.hits) + 1 }).eq("bucket", key).eq("hits", row.hits);
  dbError(saved.error);
  return true;
}
