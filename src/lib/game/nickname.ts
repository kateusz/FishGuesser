export function cleanNick(raw: string): { ok: true; value: string } | { ok: false; message: string } {
  const value = raw.trim();
  if (value.length < 3 || value.length > 16) {
    return { ok: false, message: "Nick musi mieć od 3 do 16 znaków." };
  }
  if (/[<>]/.test(value) || /https?:\/\/|www\./i.test(value)) {
    return { ok: false, message: "Nick nie może zawierać kodu ani linków." };
  }
  return { ok: true, value };
}

export function isAvatarId(value: string): boolean {
  return /^avatar-(0[1-9]|1[0-2])$/.test(value);
}
