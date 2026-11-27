import { NextResponse } from "next/server";
import { GameError } from "@/server/errors";

export function fail(error: unknown) {
  if (error instanceof GameError) {
    return NextResponse.json({ error: { code: error.code, message: error.message } }, { status: error.status });
  }
  console.error(error);
  return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Coś poszło nie tak." } }, { status: 500 });
}
