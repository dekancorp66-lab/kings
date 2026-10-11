import { readLimitedBody } from "@/lib/upload-body.server";

const FASTAPI = "http://127.0.0.1:8000";
const MAX_JSON_BODY_BYTES = 64 * 1024;

export async function fastapi(path: string, init: RequestInit = {}, timeoutMs = 2500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const headers = new Headers(init.headers);
    if (init.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    const response = await fetch(`${FASTAPI}${path}`, {
      ...init,
      headers,
      signal: controller.signal,
    });
    return response;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function readJson(request: Request) {
  try {
    const body = await readLimitedBody(request, MAX_JSON_BODY_BYTES);
    const value: unknown = JSON.parse(new TextDecoder().decode(body));
    if (value === null || typeof value !== "object" || Array.isArray(value)) return null;
    return value as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function bearer(request: Request) {
  const header = request.headers.get("authorization") ?? "";
  const cookie = request.headers.get("cookie") ?? "";
  const fromHeader = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
  const match = /(?:^|;\s*)mm_session=([^;]+)/.exec(cookie);
  const fromCookie = match ? decodeURIComponent(match[1]) : "";
  return fromHeader || fromCookie;
}

export function isEmail(value: string) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value);
}

export function clean(value: unknown, max: number) {
  const text = Array.from(String(value ?? ""))
    .filter((character) => {
      const code = character.charCodeAt(0);
      return code >= 0x20 || code === 0x09 || code === 0x0a || code === 0x0d;
    })
    .join("");
  return text.trim().slice(0, max);
}
