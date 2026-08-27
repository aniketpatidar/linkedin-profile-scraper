# 10 — Add public MVP controls and safe observability

**What to build:** Apply the approved anonymous-MVP controls around the self-hosted agent so public callers can use the HTTPS endpoint without exposing credentials or profile data.

**Blocked by:** 09 — Return normalized Partial Profiles from the browser agent

**Status:** resolved

- [x] The profile endpoint remains anonymously callable for the MVP.
- [x] Requests are rate-limited per client IP with a separate single-session concurrency limit.
- [x] Logs contain request metadata and safe error codes only.
- [x] Profile URLs, names, cookies, HTML, screenshots, and provider payloads are absent from logs.
- [x] Profile data is not persisted and callers cannot submit credentials or cookies.
- [x] Tests verify rate limiting, concurrency behavior, and metadata-only logging.

## Resolution

Made anonymous rate limiting client-keyed using the edge client address, while preserving the single-session coordinator, metadata-only logging, no profile persistence, and credential-free caller boundary. Added independent-client regression coverage. The full suite passes with 26 tests, Worker types are current, deployment dry run succeeds, and `git diff --check` is clean.

