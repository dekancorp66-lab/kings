import assert from "node:assert/strict";
import test from "node:test";
import { readLimitedBody, RequestBodyTooLargeError } from "./upload-body.server.ts";

test("reads streamed request bodies up to the configured limit", async () => {
  const request = new Request("https://example.test/upload", {
    method: "POST",
    body: new ReadableStream({
      start(controller) {
        controller.enqueue(new Uint8Array([1, 2]));
        controller.enqueue(new Uint8Array([3, 4]));
        controller.close();
      },
    }),
    // Streaming bodies have no Content-Length by default.
    duplex: "half",
  } as RequestInit);

  assert.deepEqual(await readLimitedBody(request, 4), new Uint8Array([1, 2, 3, 4]));
});

test("rejects streamed request bodies above the configured limit", async () => {
  const request = new Request("https://example.test/upload", {
    method: "POST",
    body: new ReadableStream({
      start(controller) {
        controller.enqueue(new Uint8Array([1, 2, 3]));
        controller.enqueue(new Uint8Array([4, 5, 6]));
        controller.close();
      },
    }),
    duplex: "half",
  } as RequestInit);

  await assert.rejects(readLimitedBody(request, 5), RequestBodyTooLargeError);
});