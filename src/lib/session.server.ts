import { SignJWT, jwtVerify } from "jose";
import { adminEmail, getSessionSecret } from "@/lib/security.server";

// Why the secret is read inside the functions (not at import time): it keeps the server
// booting even if the env is misconfigured, and the value never sits in a module constant.

export async function signSession() {
  return new SignJWT({ role: "curator" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(adminEmail())
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getSessionSecret());
}

export async function verifySession(token: string) {
  // Pin the algorithm so a forged token can't pick a weaker one (e.g. "none").
  const { payload } = await jwtVerify(token, getSessionSecret(), { algorithms: ["HS256"] });
  return payload;
}

/**
 * `secure` is true when the visitor is on HTTPS: the browser then refuses to send the
 * cookie over plain HTTP, so a café Wi-Fi sniffer can't steal the admin session.
 */
export function sessionCookie(token: string, secure: boolean) {
  return `mm_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=28800${secure ? "; Secure" : ""}`;
}

export const clearSessionCookie = "mm_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0";