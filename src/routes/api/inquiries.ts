import { createFileRoute } from "@tanstack/react-router";
import { requireCurator } from "@/lib/curator-auth.server";
import { addInquiry, listInquiries } from "@/lib/store.server";
import { bearer, clean, fastapi, isEmail, jsonResponse, readJson } from "@/lib/fastapi.server";
import { clientIp, isRateLimited } from "@/lib/security.server";

export const Route = createFileRoute("/api/inquiries")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        // Verify the token is genuine. The old code only checked that a token EXISTED, so any
        // visitor sending "Cookie: mm_session=x" could read customer data.
        const deny = await requireCurator(request);
        if (deny) return deny;
        const token = bearer(request);
        const upstream = await fastapi("/api/inquiries", {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (upstream) return upstream;
        return jsonResponse({ inquiries: listInquiries() });
      },
      POST: async ({ request }) => {
        // Spam control for the public form: max 8 per hour per visitor.
        if (isRateLimited(`inq:${clientIp(request)}`, 8, 3600)) {
          return jsonResponse({ detail: "Too many requests. Please wait a moment." }, 429);
        }
        const body = await readJson(request);
        if (!body) return jsonResponse({ detail: "Invalid JSON." }, 400);
        // Honeypot: real people never see this hidden field, bots fill it. Pretend success
        // so the bot doesn't learn it was caught, and store nothing.
        if (clean(body.website, 200)) return jsonResponse({ id: "ok", status: "received" });
        const payload = {
          firstName: clean(body.firstName, 60),
          lastName: clean(body.lastName, 60),
          email: clean(body.email, 120).toLowerCase(),
          phone: clean(body.phone, 32),
          vehicle: clean(body.vehicle, 120),
          message: clean(body.message, 2000),
        };
        if (
          !payload.firstName ||
          !payload.lastName ||
          !isEmail(payload.email) ||
          payload.message.length < 8
        ) {
          return jsonResponse({ detail: "Please complete every required field." }, 422);
        }
        const upstream = await fastapi("/api/inquiries", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        if (upstream) return upstream;
        const row = addInquiry(payload);
        return jsonResponse({ id: row.id, status: "received" });
      },
    },
  },
});