import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Everything secret lives here, SERVER-SIDE ONLY (the ".server" suffix keeps this file
 * out of the browser bundle). Why this matters: anything imported by a React page is
 * shipped to every visitor, so the old CURATOR_PASSWORD in catalog.ts was public.
 *
 * Secure-by-default rule: if a secret is missing we never fall back to a guessable
 * value. A missing session secret becomes a random one (sessions reset on restart) and
 * a missing admin password simply disables admin login.
 */

// ---------------------------------------------------------------------------
// .env loading
// ---------------------------------------------------------------------------
// Vite only exposes VITE_* variables to the app, so server code would never see a
// plain .env file. This tiny loader fills in missing variables (real environment
// variables set by your host always win). Runs once per process.
const g = globalThis as typeof globalThis & {
  __mmEnvLoaded__?: boolean;
  __mmSecret__?: Uint8Array;
  __mmRate__?: Map<string, number[]>;
};

function loadDotEnv() {
  if (g.__mmEnvLoaded__) return;
  g.__mmEnvLoaded__ = true;
  const file = join(process.cwd(), ".env");
  if (!existsSync(file)) return;
  for (const raw of readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadDotEnv();

function readEnv(key: string): string {
  return (process.env[key] ?? "").trim();
}

// ---------------------------------------------------------------------------
// Session secret
// ---------------------------------------------------------------------------
export function getSessionSecret(): Uint8Array {
  if (g.__mmSecret__) return g.__mmSecret__;
  const configured = readEnv("MERIDIAN_SECRET");
  if (configured.length >= 32) {
    g.__mmSecret__ = new TextEncoder().encode(configured);
  } else {
    // Why random instead of a default string: a hard-coded fallback is a public key
    // for forging admin sessions. Random is safe; the only cost is re-login on restart.
    console.warn(
      "[security] MERIDIAN_SECRET is missing or shorter than 32 characters. Using a random one-off secret; " +
        "admins will be signed out on every restart. Set MERIDIAN_SECRET in your .env / host settings.",
    );
    g.__mmSecret__ = randomBytes(32);
  }
  return g.__mmSecret__;
}

// ---------------------------------------------------------------------------
// Admin credentials
// ---------------------------------------------------------------------------
export function adminEmail(): string {
  return (readEnv("MERIDIAN_ADMIN_EMAIL") || "curator@meridian.motors").toLowerCase();
}

/** Hash first so both buffers have equal length, then compare in constant time. */
function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function verifyAdminLogin(email: string, password: string): boolean {
  const expectedPassword = readEnv("MERIDIAN_ADMIN_PASSWORD");
  // No password configured = admin login is OFF (never a default password).
  if (expectedPassword.length < 8) return false;
  // Evaluate both checks before combining so timing doesn't reveal which one failed.
  const emailOk = safeEqual(email.trim().toLowerCase(), adminEmail());
  const passwordOk = safeEqual(password, expectedPassword);
  return emailOk && passwordOk;
}

export function adminLoginConfigured(): boolean {
  return readEnv("MERIDIAN_ADMIN_PASSWORD").length >= 8;
}

// ---------------------------------------------------------------------------
// Rate limiting (in-memory)
// ---------------------------------------------------------------------------
// Limitation worth knowing: memory is per server process. On one VPS that is exactly
// right; on serverless hosts each instance counts separately, so limits are softer there.

export function clientIp(request: Request): string {
  const real = request.headers.get("x-real-ip");
  if (real) return real.trim().slice(0, 64);
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return (forwarded.split(",")[0] ?? "").trim().slice(0, 64) || "unknown";
  return "unknown";
}

/** Returns true when the caller is OVER the limit (and should get a 429). */
export function isRateLimited(key: string, limit: number, windowSeconds: number): boolean {
  const buckets = (g.__mmRate__ ??= new Map<string, number[]>());
  const now = Date.now();
  const cutoff = now - windowSeconds * 1000;
  const hits = (buckets.get(key) ?? []).filter((t) => t > cutoff);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    return true;
  }
  hits.push(now);
  buckets.set(key, hits);

  // Housekeeping so the map can't grow forever under a flood of unique IPs.
  if (buckets.size > 5000) {
    for (const [k, times] of buckets) {
      if (!times.some((t) => t > now - 3600_000)) buckets.delete(k);
    }
  }
  return false;
}

// ---------------------------------------------------------------------------
// Cookies
// ---------------------------------------------------------------------------
/** True when the visitor reached us over HTTPS (directly or via a proxy like Vercel/Nginx). */
export function isHttps(request: Request): boolean {
  const proto = request.headers.get("x-forwarded-proto");
  if (proto) return proto.split(",")[0]?.trim() === "https";
  return new URL(request.url).protocol === "https:";
}
