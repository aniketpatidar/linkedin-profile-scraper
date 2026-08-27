import test from "node:test";
import assert from "node:assert/strict";
import { createCoordinatedProvider } from "../src/coordinated-provider.js";

test("serializes provider work and releases the lease", async () => {
  const calls = [];
  const coordinator = {
    acquire: async () => { calls.push("acquire"); return { token: "lease" }; },
    release: async (token) => calls.push(`release:${token}`),
    invalidate: async () => calls.push("invalidate"),
  };
  const provider = createCoordinatedProvider(async (url) => { calls.push(url); return { identity: { name: "Ada" } }; }, coordinator);
  const result = await provider("profile-url");
  assert.equal(result.identity.name, "Ada");
  assert.deepEqual(calls, ["acquire", "profile-url", "release:lease"]);
});

test("maps a busy session and invalidates on authentication failure", async () => {
  const events = [];
  const busy = createCoordinatedProvider(async () => null, {
    acquire: async () => { throw Object.assign(new Error(), { code: "session_busy" }); },
    release: async () => events.push("release"),
    invalidate: async () => events.push("invalidate"),
  });
  await assert.rejects(busy("profile-url"), { code: "session_busy", status: 429 });

  const authFailed = createCoordinatedProvider(async () => {
    throw Object.assign(new Error(), { code: "provider_auth_failed" });
  }, {
    acquire: async () => ({ token: "lease" }),
    release: async () => events.push("release"),
    invalidate: async (reason) => events.push(reason),
  });
  await assert.rejects(authFailed("profile-url"), { code: "provider_auth_failed" });
  assert.deepEqual(events, ["provider_auth_failed", "release"]);
});
