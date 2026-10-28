import { createFileRoute } from "@tanstack/react-router";
import { requireCurator } from "@/lib/curator-auth.server";
import { clean, jsonResponse, readJson } from "@/lib/fastapi.server";
import {
  deleteVehicle,
  getVehicle,
  updateVehicle,
  updateVehicleStatus,
  VehicleError,
} from "@/lib/vehicle-store.server";
import { firstIssue, VEHICLE_STATUSES, vehicleInputSchema } from "@/lib/vehicle-input";
import type { VehicleStatus } from "@/data/types";

export const Route = createFileRoute("/api/vehicles/$id")({
  server: {
    handlers: {
      // Admin only: the full record including the VIN, so the edit form can be filled in.
      GET: async ({ request, params }) => {
        const deny = await requireCurator(request);
        if (deny) return deny;
        const row = getVehicle(params.id);
        if (!row) return jsonResponse({ detail: "Vehicle not found." }, 404);
        return jsonResponse({ vehicle: row });
      },

      // Admin only: save edited details.
      PUT: async ({ request, params }) => {
        const deny = await requireCurator(request);
        if (deny) return deny;
        const body = await readJson(request);
        if (!body) return jsonResponse({ detail: "Invalid JSON." }, 400);
        // Re-validate on the server: never trust the browser.
        const parsed = vehicleInputSchema.safeParse(body);
        if (!parsed.success) return jsonResponse({ detail: firstIssue(parsed.error) }, 422);
        try {
          const row = updateVehicle(params.id, parsed.data);
          if (!row) return jsonResponse({ detail: "Vehicle not found." }, 404);
          return jsonResponse({ vehicle: row });
        } catch (error) {
          if (error instanceof VehicleError) return jsonResponse({ detail: error.message }, error.status);
          return jsonResponse({ detail: "Could not save the change." }, 500);
        }
      },

      // Change availability (e.g. mark as sold).
      PATCH: async ({ request, params }) => {
        const deny = await requireCurator(request);
        if (deny) return deny;
        const body = await readJson(request);
        const status = clean(body?.status, 20) as VehicleStatus;
        if (!VEHICLE_STATUSES.includes(status)) return jsonResponse({ detail: "Unknown status." }, 422);
        try {
          const row = updateVehicleStatus(params.id, status);
          if (!row) return jsonResponse({ detail: "Vehicle not found." }, 404);
          return jsonResponse({ id: row.id, status: row.status });
        } catch {
          return jsonResponse({ detail: "Could not save the change." }, 500);
        }
      },

      DELETE: async ({ request, params }) => {
        const deny = await requireCurator(request);
        if (deny) return deny;
        try {
          if (!deleteVehicle(params.id)) return jsonResponse({ detail: "Vehicle not found." }, 404);
          return jsonResponse({ id: params.id, deleted: true });
        } catch {
          return jsonResponse({ detail: "Could not save the change." }, 500);
        }
      },
    },
  },
});
