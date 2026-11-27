import { NextResponse } from "next/server";
import { cleanup } from "@/server/game";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Brak dostępu." } }, { status: 401 });
  }
  await cleanup();
  return NextResponse.json({ ok: true });
}
