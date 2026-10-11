import { createFileRoute } from "@tanstack/react-router";
import { requireCurator } from "@/lib/curator-auth.server";
import { jsonResponse } from "@/lib/fastapi.server";
import { MAX_UPLOAD_BYTES, saveUpload, VehicleError } from "@/lib/vehicle-store.server";
import { readLimitedBody, RequestBodyTooLargeError } from "@/lib/upload-body.server";

export const Route = createFileRoute("/api/uploads")({
  server: {
    handlers: {
      // Admin only: upload one photo (multipart form field "file"). Returns its public URL.
      POST: async ({ request }) => {
        const deny = await requireCurator(request);
        if (deny) return deny;

        // Cheap early reject using the declared size, before reading the body into memory.
        const declared = Number(request.headers.get("content-length") ?? 0);
        if (declared > MAX_UPLOAD_BYTES + 64 * 1024) {
          return jsonResponse({ detail: "Photo is larger than 8 MB." }, 413);
        }

        const maxRequestBytes = MAX_UPLOAD_BYTES + 64 * 1024;
        let file: FormDataEntryValue | null = null;
        try {
          const body = await readLimitedBody(request, maxRequestBytes);
          const boundedRequest = new Request(request.url, {
            method: request.method,
            headers: request.headers,
            body: Uint8Array.from(body),
          });
          file = (await boundedRequest.formData()).get("file");
        } catch (error) {
          if (error instanceof RequestBodyTooLargeError) {
            return jsonResponse({ detail: "Photo is larger than 8 MB." }, 413);
          }
          return jsonResponse({ detail: "Expected a multipart upload." }, 400);
        }
        if (!(file instanceof File)) return jsonResponse({ detail: "No photo received." }, 400);

        try {
          const url = await saveUpload(Buffer.from(await file.arrayBuffer()));
          return jsonResponse({ url }, 201);
        } catch (error) {
          if (error instanceof VehicleError) return jsonResponse({ detail: error.message }, error.status);
          return jsonResponse({ detail: "Could not store the photo. Is the data folder writable?" }, 500);
        }
      },
    },
  },
});
