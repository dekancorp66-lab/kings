import { createFileRoute } from "@tanstack/react-router";
import { requireCurator } from "@/lib/curator-auth.server";
import { stats } from "@/lib/store.server";
import { bearer, fastapi, jsonResponse } from "@/lib/fastapi.server";
import { listVehicles } from "@/lib/vehicle-store.server";

export const Route = createFileRoute("/api/stats")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        // Verify the token is genuine. The old code only checked that a token EXISTED, so any
        // visitor sending "Cookie: mm_session=x" could read customer data.
        const deny = await requireCurator(request);
        if (deny) return deny;
        const token = bearer(request);
        const upstream = await fastapi("/api/stats", {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (upstream?.ok) {
          const data = (await upstream.json()) as Record<string, number>;
          return jsonResponse({
            ...data,
            inStock: listVehicles().filter((item) => item.status === "available").length,
            sold: listVehicles().filter((item) => item.status === "sold").length,
          });
        }
        return jsonResponse({
          ...stats(),
          inStock: listVehicles().filter((item) => item.status === "available").length,
          sold: listVehicles().filter((item) => item.status === "sold").length,
        });
      },
    },
  },
});