import test from "node:test";
import assert from "node:assert/strict";
import { apiRequest } from "./apiRequest.js";

test("API request distinguishes unauthorized and unavailable responses", async () => {
  const originalFetch = globalThis.fetch;
  let unauthorized = 0;
  try {
    globalThis.fetch = async () => ({
      ok: false,
      status: 401,
      headers: { get: () => null },
      json: async () => ({ error: "Session expired" }),
    });
    await assert.rejects(
      apiRequest("/api/users", { onUnauthorized: () => { unauthorized += 1; } }),
      (error) => error.status === 401 && error.message === "Session expired"
    );
    assert.equal(unauthorized, 1);
    globalThis.fetch = async () => { throw new TypeError("offline"); };
    await assert.rejects(apiRequest("/api/users"), (error) => error.status === 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
