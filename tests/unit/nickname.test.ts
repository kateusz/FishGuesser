import { describe, expect, test } from "vitest";
import { cleanNick, isAvatarId } from "@/lib/game/nickname";

describe("nick", () => {
  test("obcina spacje i przyjmuje 3–16 znaków", () => {
    expect(cleanNick("  Okoń  ")).toEqual({ ok: true, value: "Okoń" });
  });

  test("odrzuca za krótki nick, html i link", () => {
    expect(cleanNick("ab").ok).toBe(false);
    expect(cleanNick("<img>").ok).toBe(false);
    expect(cleanNick("http://ryba.pl").ok).toBe(false);
  });

  test("awatar jest z listy 12", () => {
    expect(isAvatarId("avatar-01")).toBe(true);
    expect(isAvatarId("avatar-12")).toBe(true);
    expect(isAvatarId("avatar-13")).toBe(false);
    expect(isAvatarId("pike")).toBe(false);
  });
});
