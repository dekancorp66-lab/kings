import { createServerFn } from "@tanstack/react-start";

/**
 * The public address of the website, e.g. "https://kingsellers.co.tz" (no trailing slash).
 *
 * Why this exists: WhatsApp, Facebook and Google need ABSOLUTE links for the share picture,
 * the canonical link and the sitemap. A server function is used because route loaders also
 * run on the server, where "/og.jpg" alone means nothing.
 *
 * Production: set SITE_URL in your host's environment settings (it always wins).
 * Local dev: falls back to the address the visitor used (http://localhost:8080).
 */
export const getSiteOrigin = createServerFn({ method: "GET" }).handler(
  async (): Promise<string> => {
    await import("@/lib/security.server"); // side effect: loads the .env file
    const configured = (process.env.SITE_URL ?? "").trim().replace(/\/+$/, "");
    if (/^https?:\/\/[^\s/]+$/.test(configured)) return configured;

    const { getRequestUrl } = await import("@tanstack/react-start/server");
    return getRequestUrl({ xForwardedHost: true, xForwardedProto: true }).origin;
  },
);
