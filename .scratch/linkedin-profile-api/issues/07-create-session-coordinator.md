# 07 — Create the deployment session coordinator

**What to build:** Add a deployment-scoped session coordinator that serializes Owner Session Integration browser work and retains only minimal protected session state.

**Blocked by:** None — can start immediately

**Status:** resolved

- [x] A single session coordinator controls access to the deployment-owned browser session.
- [x] Concurrent profile requests receive a stable `session_busy` error rather than being queued.
- [x] Session state is protected and limited to authentication/session metadata; Profile data is not persisted.
- [x] Session invalidation can be marked explicitly for manual reauthentication.
- [x] Coordinator behavior has deterministic tests without live credentials.

## Resolution

Implemented the deployment-scoped `ProfileSessionCoordinator` Durable Object with SQLite-backed synchronous KV state, lease acquisition/release, expiration, invalidation, and status RPCs. Added deterministic coordinator tests, registered the SQLite Durable Object migration and binding, regenerated Worker types, and verified the bundle with `wrangler deploy --dry-run`. The full suite passes with 22 tests.

