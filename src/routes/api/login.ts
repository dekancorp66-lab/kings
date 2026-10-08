import { createFileRoute } from "@tanstack/react-router";
import { checkCurator } from "@/lib/store.server";
import { clean, fastapi, jsonResponse, readJson } from "@/lib/fastapi.server";
import { adminEmail, clientIp, isHttps, isRateLimited } from "@/lib/security.server";
import { sessionCookie, signSession } from "@/lib/session.server";

const TOO_MANY = "Too many sign-in attempts. Please wait a few minutes.";
const BAD_LOGIN = "Those credentials were not recognised.";

export const Route = createFileRoute("/api/login")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Two buckets on purpose. Per-IP stops one person guessing. The shared bucket is the
        // backstop for attackers who fake their IP header: they still can't exceed it.
        if (
          isRateLimited(`login:ip:${clientIp(request)}`, 6, 300) ||
          isRateLimited("login:all", 40, 900)
        ) {
          return jsonResponse({ detail: TOO_MANY }, 429);
        }

        const body = await readJson(request);
        if (!body) return jsonResponse({ detail: "Invalid JSON." }, 400);
        const email = clean(body.email, 120).toLowerCase();
        const password = String(body.password ?? "").slice(0, 128);
        const secure = isHttps(request);

        const upstream = await fastapi("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        if (upstream?.ok) {
          const data = (await upstream.json()) as {
            token: string;
            curator: { email: string; name: string };
          };
          const response = jsonResponse({ curator: data.curator });
          response.headers.append("Set-Cookie", sessionCookie(data.token, secure));
          return response;
        }
        if (upstream && upstream.status === 429) return jsonResponse({ detail: TOO_MANY }, 429);

        // Same message whether the email or the password was wrong, so attackers learn nothing.
        if (upstream && upstream.status === 401) return jsonResponse({ detail: BAD_LOGIN }, 401);
        if (!checkCurator(email, password)) return jsonResponse({ detail: BAD_LOGIN }, 401);

        const token = await signSession();
        const response = jsonResponse({
          curator: { email: adminEmail(), name: "Dealer" },
        });
        response.headers.append("Set-Cookie", sessionCookie(token, secure));
        return response;
      },
    },
  },
});
