import test from "node:test";
import assert from "node:assert/strict";
import {
  createSessionCoordinator,
  SessionBusyError,
} from "../src/session-coordinator.js";

function storage() {
  const values = new Map();
  return {
    get: (key) => values.get(key),
    put: (key, value) => values.set(key, value),
    delete: (key) => values.delete(key),
  };
}

test("leases the deployment session and rejects concurrent work", () => {
  let now = 1000;
  const coordinator = createSessionCoordinator({
    storage: storage(),
    now: () => now,
    token: () => "lease-1",
    leaseMs: 100,
  });

  const lease = coordinator.acquire();
  assert.deepEqual(lease, { token: "lease-1", expiresAt: 1100 });
  assert.throws(() => coordinator.acquire(), (error) => error instanceof SessionBusyError && error.code === "session_busy");
  assert.equal(coordinator.status().busy, true);

  coordinator.release(lease.token);
  assert.equal(coordinator.status().busy, false);
  now = 1100;
  assert.equal(coordinator.acquire().expiresAt, 1200);
});

test("invalidates the session without persisting credentials or profile data", () => {
  const coordinator = createSessionCoordinator({ storage: storage(), token: () => "lease-1" });
  coordinator.acquire();
  assert.deepEqual(coordinator.invalidate(), {
    status: "invalidated",
    reason: "manual_reauthentication_required",
  });
  assert.equal(coordinator.status().busy, false);
  assert.equal(coordinator.status().status, "invalidated");
});
