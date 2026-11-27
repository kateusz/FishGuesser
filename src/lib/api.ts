import { errorText, isLocale } from "@/lib/messages";

export class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number,
  ) {
    super(message);
  }
}

function browserLocale(): string {
  if (typeof window === "undefined") return "pl";
  const segment = window.location.pathname.split("/")[1] ?? "";
  return isLocale(segment) ? segment : "pl";
}

export async function api<T>(path: string, options?: { method?: string; body?: unknown }): Promise<T> {
  const response = await fetch(path, {
    method: options?.method ?? (options?.body ? "POST" : "GET"),
    cache: "no-store",
    headers: options?.body ? { "content-type": "application/json" } : undefined,
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });
  const data = (await response.json()) as { error?: { code?: string; message?: string } };
  if (!response.ok) {
    const code = data.error?.code ?? "INTERNAL_ERROR";
    throw new ApiError(errorText(browserLocale(), code, data.error?.message), code, response.status);
  }
  return data as T;
}
