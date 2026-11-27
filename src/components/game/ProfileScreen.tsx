"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Captain, FishArt } from "@/components/mascot/Captain";
import { api } from "@/lib/api";
import { messagesFor } from "@/lib/messages";

const AVATARS = Array.from({ length: 12 }, (_, index) => `avatar-${String(index + 1).padStart(2, "0")}`);

export function ProfileScreen({ locale }: { locale: string }) {
  const copy = messagesFor(locale).profile;
  const router = useRouter();
  const params = useSearchParams();
  const intent = params.get("intent") ?? "host";
  const code = (params.get("code") ?? "").toUpperCase();
  const [nickname, setNickname] = useState("");
  const [avatarId, setAvatarId] = useState("avatar-01");
  const [error, setError] = useState("");

  async function submit() {
    setError("");
    const trimmed = nickname.trim();
    if (trimmed.length < 3 || trimmed.length > 16) {
      setError(copy.nickLength);
      return;
    }
    sessionStorage.setItem("fg-nick", trimmed);
    sessionStorage.setItem("fg-avatar", avatarId);
    try {
      if (intent === "solo") {
        router.push(`/${locale}/solo`);
        return;
      }
      if (intent === "join") {
        const state = await api<{ game: { code: string } }>(`/api/v1/rooms/${code}/join`, {
          method: "POST",
          body: { nickname: trimmed, avatarId },
        });
        router.push(`/${locale}/room/${state.game.code}`);
        return;
      }
      const state = await api<{ game: { code: string } }>("/api/v1/rooms", {
        method: "POST",
        body: { nickname: trimmed, avatarId },
      });
      router.push(`/${locale}/room/${state.game.code}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : copy.saveFailed);
    }
  }

  return (
    <div className="narrow-content stack profile-screen">
      <span className="tag profile-tag">{copy.tag}</span>
      <h1 className="display title">{copy.title}</h1>
      <label className="field-label" htmlFor="nick">
        {copy.nick}
      </label>
      <input
        id="nick"
        className="field"
        maxLength={16}
        value={nickname}
        aria-invalid={error ? true : undefined}
        onChange={(event) => setNickname(event.target.value)}
      />
      <p className="char-count">
        {nickname.trim().length}/16
      </p>
      {error ? (
        <p className="bubble" role="alert">
          {error}
        </p>
      ) : null}
      <h2 className="display profile-avatar-title">{copy.avatarTitle}</h2>
      <div className="avatar-grid">
        {AVATARS.map((id, index) => (
          <button
            key={id}
            type="button"
            className={`avatar-pick${avatarId === id ? " selected" : ""}`}
            aria-pressed={avatarId === id}
            onClick={() => setAvatarId(id)}
          >
            <span className="avatar">
              <FishArt i={index} pose="wink" />
            </span>
          </button>
        ))}
      </div>
      <div className="mascot-line profile-captain">
        <Captain />
        <p className="bubble">{copy.captainMessage}</p>
      </div>
      <button type="button" className="btn primary block" onClick={() => void submit()}>
        {copy.next}
      </button>
    </div>
  );
}
