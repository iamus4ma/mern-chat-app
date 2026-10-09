import test from "node:test";
import assert from "node:assert/strict";
import AuthRateLimit from "../models/authRateLimit.model.js";
import { authRateLimit } from "./authRateLimit.js";

test("auth attempt limit returns 429 with a retry time", async () => {
  const original = AuthRateLimit.findOneAndUpdate;
  AuthRateLimit.findOneAndUpdate = async (query) => {
    assert.equal(query.key, "login:127.0.0.1");
    return { count: 3, resetAt: new Date(Date.now() + 60_000) };
  };
  const headers = {};
  const response = {
    set(key, value) { headers[key] = value; return this; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
  try {
    await authRateLimit({ scope: "login", max: 2, windowMs: 60_000 })(
      { ip: "127.0.0.1" }, response, () => { throw new Error("Limit was bypassed"); }
    );
    assert.equal(response.statusCode, 429);
    assert.ok(Number(headers["Retry-After"]) > 0);
  } finally {
    AuthRateLimit.findOneAndUpdate = original;
  }
});
