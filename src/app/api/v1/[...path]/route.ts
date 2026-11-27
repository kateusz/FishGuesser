import { NextResponse } from "next/server";
import {
  advance,
  advanceCode,
  answer,
  answerCode,
  createRoom,
  createSolo,
  joinRoom,
  kick,
  leave,
  preview,
  startGame,
  stateFor,
  stateForCode,
  updateSettings,
} from "@/server/game";
import { fail } from "@/server/http";
import { consumeRate } from "@/server/sb";
import { requireUserId } from "@/server/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = Record<string, unknown>;

async function readBody(request: Request): Promise<Body> {
  try {
    return (await request.json()) as Body;
  } catch {
    return {};
  }
}

async function dispatch(method: string, path: string[], request: Request) {
  const uid = await requireUserId();
  const [root, id, action, extra, leaf] = path;
  if (method === "POST" && root === "rooms" && path.length === 1) {
    if (!(await consumeRate(`create:${uid}`, 30, 60 * 60 * 1000))) {
      return NextResponse.json({ error: { code: "RATE_LIMITED", message: "Za dużo nowych pokoi." } }, { status: 429 });
    }
    const body = await readBody(request);
    return NextResponse.json(
      await createRoom(uid, String(body.nickname ?? ""), String(body.avatarId ?? ""), (body.settings ?? {}) as never),
    );
  }
  if (root === "rooms" && id) {
    if (method === "GET" && path.length === 2) return NextResponse.json(await preview(id));
    if (method === "POST" && action === "join") {
      if (!(await consumeRate(`join:${uid}`, 20, 60 * 1000))) {
        return NextResponse.json({ error: { code: "RATE_LIMITED", message: "Za dużo prób dołączenia." } }, { status: 429 });
      }
      const body = await readBody(request);
      return NextResponse.json(await joinRoom(uid, id, String(body.nickname ?? ""), String(body.avatarId ?? "")));
    }
    if (method === "GET" && action === "state") return NextResponse.json(await stateForCode(uid, id));
    if (method === "PATCH" && action === "settings") {
      return NextResponse.json(await updateSettings(uid, id, (await readBody(request)) as never));
    }
    if (method === "POST" && action === "start") return NextResponse.json(await startGame(uid, id));
    if (method === "POST" && action === "advance") return NextResponse.json(await advanceCode(uid, id));
    if (method === "POST" && action === "leave") {
      await leave(uid, id);
      return NextResponse.json({ ok: true });
    }
    if (method === "DELETE" && action === "players" && extra) return NextResponse.json(await kick(uid, id, extra));
    if (method === "POST" && action === "rounds" && extra && leaf === "answer") {
      const body = await readBody(request);
      return NextResponse.json(
        await answerCode(uid, id, Number(extra), String(body.requestId ?? ""), (body.answer ?? {}) as Body),
      );
    }
  }
  if (root === "solo" && id === "games") {
    if (method === "POST" && path.length === 2) {
      const body = await readBody(request);
      return NextResponse.json(
        await createSolo(
          uid,
          String(body.nickname ?? ""),
          String(body.avatarId ?? ""),
          (body.settings ?? {}) as never,
          Boolean(body.untimed),
        ),
      );
    }
    if (action && method === "GET" && extra === "state") return NextResponse.json(await stateFor(uid, action));
    if (action && method === "POST" && extra === "advance") return NextResponse.json(await advance(uid, action));
    if (action && method === "POST" && extra === "rounds" && leaf && path[5] === "answer") {
      const body = await readBody(request);
      return NextResponse.json(
        await answer(uid, action, Number(leaf), String(body.requestId ?? ""), (body.answer ?? {}) as Body),
      );
    }
  }
  return NextResponse.json({ error: { code: "ROOM_NOT_FOUND", message: "Nie ma takiej ścieżki." } }, { status: 404 });
}

function noStore(response: NextResponse) {
  response.headers.set("cache-control", "no-store");
  return response;
}

async function handle(request: Request, context: { params: Promise<{ path: string[] }> }) {
  try {
    const { path } = await context.params;
    return noStore(await dispatch(request.method, path, request));
  } catch (error) {
    return noStore(fail(error));
  }
}

export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const DELETE = handle;
