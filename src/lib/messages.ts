import en from "../../messages/en.json";
import pl from "../../messages/pl.json";

type Widen<T> = T extends string
  ? string
  : T extends readonly (infer Item)[]
    ? Widen<Item>[]
    : T extends object
      ? { [Key in keyof T]: Widen<T[Key]> }
      : T;

export type Locale = "pl" | "en";
export type Messages = Widen<typeof pl>;

const catalogs: Record<Locale, Messages> = { pl, en };

export function isLocale(value: string): value is Locale {
  return value === "pl" || value === "en";
}

export function getMessages(locale: Locale): Messages {
  return catalogs[locale];
}

export function messagesFor(locale: string): Messages {
  return getMessages(isLocale(locale) ? locale : "pl");
}

export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = values[key];
    return value == null ? match : String(value);
  });
}

export function otherLocale(locale: Locale): Locale {
  return locale === "pl" ? "en" : "pl";
}

export function errorText(locale: string, code: string, fallback?: string): string {
  const errors = messagesFor(locale).errors;
  if (Object.hasOwn(errors, code)) return errors[code as keyof Messages["errors"]];
  return fallback || errors.INTERNAL_ERROR;
}
