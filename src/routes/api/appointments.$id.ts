import { createFileRoute } from "@tanstack/react-router";
import { requireCurator } from "@/lib/curator-auth.server";
import { updateAppointment } from "@/lib/store.server";
import { bearer, clean, fastapi, jsonResponse, readJson } from "@/lib/fastapi.server";
import type { Appointment } from "@/data/types";

const allowed = new Set<Appointment["status"]>(["confirmed", "pending", "completed"]);

export const Route = createFileRoute("/api/appointments/$id")({
  server: {
    handlers: {
      PATCH: async ({ request, params }) => {
        // Verify the token is genuine. The old code only checked that a token EXISTED, so any
        // visitor sending "Cookie: mm_session=x" could read customer data.
        const deny = await requireCurator(request);
        if (deny) return deny;
        const token = bearer(request);
        const body = await readJson(request);
        const status = clean(body?.status, 20) as Appointment["status"];
        const upstream = await fastapi(`/api/appointments/${encodeURIComponent(params.id)}`, {
          method: "PATCH",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          body: JSON.stringify({ status }),
        });
        if (upstream) return upstream;
        if (!allowed.has(status)) return jsonResponse({ detail: "Unknown status." }, 422);
        let row;
        try {
          row = updateAppointment(params.id, status);
        } catch {
          return jsonResponse({ detail: "Could not save the change." }, 500);
        }
        if (!row) return jsonResponse({ detail: "Appointment not found." }, 404);
        return jsonResponse({ id: row.id, status: row.status });
      },
    },
  },
});