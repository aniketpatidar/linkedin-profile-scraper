const LEASE_KEY = "owner-session-lease";
const STATE_KEY = "owner-session-state";
const DEFAULT_LEASE_MS = 30_000;

export class SessionBusyError extends Error {
  constructor() {
    super("deployment session is busy");
    this.name = "SessionBusyError";
    this.code = "session_busy";
  }
}

export function createSessionCoordinator({
  storage,
  now = () => Date.now(),
  leaseMs = DEFAULT_LEASE_MS,
  token = () => crypto.randomUUID(),
} = {}) {
  if (!storage) throw new Error("session coordinator storage is required");

  return {
    acquire() {
      const current = storage.get(LEASE_KEY);
      const timestamp = now();
      if (current && current.expiresAt > timestamp) throw new SessionBusyError();

      const lease = { token: token(), expiresAt: timestamp + leaseMs };
      storage.put(LEASE_KEY, lease);
      return lease;
    },

    release(leaseToken) {
      const current = storage.get(LEASE_KEY);
      if (current?.token === leaseToken) storage.delete(LEASE_KEY);
      return true;
    },

    invalidate(reason = "manual_reauthentication_required") {
      storage.delete(LEASE_KEY);
      storage.put(STATE_KEY, { status: "invalidated", reason, at: now() });
      return { status: "invalidated", reason };
    },

    status() {
      const lease = storage.get(LEASE_KEY);
      const state = storage.get(STATE_KEY) ?? { status: "ready" };
      if (!lease || lease.expiresAt <= now()) return { ...state, busy: false };
      return { ...state, busy: true, leaseExpiresAt: lease.expiresAt };
    },
  };
}

export { LEASE_KEY, STATE_KEY };
