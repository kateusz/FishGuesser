"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { fill, messagesFor } from "@/lib/messages";

export function JoinScreen({ locale }: { locale: string }) {
  const copy = messagesFor(locale).join;
  const router = useRouter();
  const [letters, setLetters] = useState(["", "", "", "", ""]);
  const code = letters.join("");

  function setAt(index: number, value: string) {
    const next = [...letters];
    next[index] = value.toUpperCase().replace(/[^A-Z]/g, "").slice(-1);
    setLetters(next);
    if (next[index] && index < 4) document.getElementById(`code-${index + 1}`)?.focus();
  }

  function paste(text: string) {
    const chars = text.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 5).split("");
    const next = ["", "", "", "", ""];
    chars.forEach((char, index) => {
      next[index] = char;
    });
    setLetters(next);
  }

  return (
    <div className="narrow-content stack">
      <span className="tag">{copy.tag}</span>
      <h1 className="display title">{copy.title}</h1>
      <p className="bubble">{copy.hint}</p>
      <label className="field-label" htmlFor="code-0">
        {copy.code}
      </label>
      <div className="code-inputs">
        {letters.map((letter, index) => (
          <input
            key={index}
            id={`code-${index}`}
            aria-label={fill(copy.letter, { n: index + 1 })}
            maxLength={1}
            value={letter}
            onChange={(event) => setAt(index, event.target.value)}
            onPaste={(event) => {
              event.preventDefault();
              paste(event.clipboardData.getData("text"));
            }}
            onKeyDown={(event) => {
              if (event.key === "Backspace" && !letter && index > 0) {
                document.getElementById(`code-${index - 1}`)?.focus();
              }
            }}
          />
        ))}
      </div>
      <button
        type="button"
        className="btn primary block"
        disabled={code.length < 5}
        onClick={() => router.push(`/${locale}/profile?intent=join&code=${code}`)}
      >
        {copy.submit}
      </button>
    </div>
  );
}
