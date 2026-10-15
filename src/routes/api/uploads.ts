import { createFileRoute } from "@tanstack/react-router";
import { requireCurator } from "@/lib/curator-auth.server";
import { jsonResponse } from "@/lib/fastapi.server";
import { MAX_UPLOAD_BYTES, saveUpload, VehicleError } from "@/lib/vehicle-store.server";

const MAX_REQUEST_BYTES = MAX_UPLOAD_BYTES + 64 * 1024;

export const Route = createFileRoute("/api/uploads")({
  server: {
    handlers: {
      // Admin only: upload one photo (multipart form field "file"). Returns its public URL.
      POST: async ({ request }) => {
        const deny = await requireCurator(request);
        if (deny) return deny;

        // Early reject using the declared size, before reading the body.
        const declared = Number(request.headers.get("content-length") ?? 0);
        if (declared > MAX_REQUEST_BYTES) {
          return jsonResponse({ detail: "Photo is larger than 8 MB." }, 413);
        }

        const contentType = request.headers.get("content-type") ?? "";
        if (!contentType.toLowerCase().startsWith("multipart/form-data")) {
          console.error("[uploads] unexpected content-type:", contentType);
          return jsonResponse({ detail: "Expected a multipart upload." }, 400);
        }

        // Let the platform parse the form directly (the old code re-wrapped the body
        // in a second Request, which is what was failing).
        let file: FormDataEntryValue | null = null;
        try {
          file = (await request.formData()).get("file");
        } catch (error) {
          // Log the REAL reason so it shows up in the server logs.
          console.error("[uploads] could not parse form data:", error);
          return jsonResponse({ detail: "Could not read the upload. Please try again." }, 400);
        }
        if (!(file instanceof Blob)) return jsonResponse({ detail: "No photo received." }, 400);
        if (file.size > MAX_UPLOAD_BYTES) {
          return jsonResponse({ detail: "Photo is larger than 8 MB." }, 413);
        }

        try {
          const url = await saveUpload(Buffer.from(await file.arrayBuffer()));
          return jsonResponse({ url }, 201);
        } catch (error) {
          if (error instanceof VehicleError) return jsonResponse({ detail: error.message }, error.status);
          console.error("[uploads] save failed:", error);
          return jsonResponse({ detail: "Could not store the photo. Is the data folder writable?" }, 500);
        }
      },
    },
  },
});