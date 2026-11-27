import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { photoFileForToken } from "@/server/game";
import { homePreviewPhoto } from "@/server/home-preview";
import { fail } from "@/server/http";
import { requireUserId as userId } from "@/server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const preview = homePreviewPhoto(id);
    if (preview) {
      try {
        const bytes = await readFile(path.join(process.cwd(), "src/content/photos", preview.file));
        return new NextResponse(new Uint8Array(bytes), {
          headers: { "content-type": "image/jpeg", "cache-control": "public, max-age=86400", "x-content-type-options": "nosniff" },
        });
      } catch {
        return NextResponse.json({ error: { code: "ROOM_NOT_FOUND", message: "Brak zdjęcia." } }, { status: 404 });
      }
    }
    const file = await photoFileForToken(await userId(), id);
    if (!file) return NextResponse.json({ error: { code: "ROOM_NOT_FOUND", message: "Brak zdjęcia." } }, { status: 404 });
    const bytes = await readFile(path.join(process.cwd(), "src/content/photos", file));
    return new NextResponse(new Uint8Array(bytes), {
      headers: { "content-type": "image/jpeg", "cache-control": "private, max-age=300", "x-content-type-options": "nosniff" },
    });
  } catch (error) {
    return fail(error);
  }
}
