# Improve Codebase Architecture

Status: resolved
Label: ready-for-agent

## Problem Statement

The codebase currently suffers from architectural friction in two key areas. First, the `Profile Provider` (`linkedin-session.js`) is a shallow module that mixes network transport logic (timeouts, HTTP errors, CSRF tokens) with a complex JSON graph traversal parser for the Voyager Dash API. This lack of locality makes testing the parser difficult, as it requires mocking HTTP responses, and makes the module fragile to changes. Second, the `Owner Session Integration` boundary is blurry. The `session-coordinator.js` (which manages the lease) intercepts and relies on specific HTTP-level `ProfileApiError` codes leaking out from the provider to determine if the session is busy or requires reauthentication. This tightly couples the lease orchestration to the provider's HTTP error mapping logic.

## Solution

We will resolve this friction by deepening the relevant modules and clarifying their seams:
1. **Isolate the Voyager Dash Mapper:** Extract the pure data transformation logic out of the network adapter and into a standalone `voyager-dash-mapper.js` module. The `linkedin-session.js` file will become a thin network adapter.
2. **Formalize the Owner Session Boundary:** Decouple the `SessionCoordinator` from the provider's HTTP errors. The coordinator should act as a pure concurrency lock that manages state, while the provider fetches data without leaking transport-specific error types into the coordinator's domain logic.

## User Stories

1. As a developer maintaining the codebase, I want the Voyager Dash API parsing logic to live in a pure, standalone module, so that I can easily write unit tests for it using raw JSON fixtures without mocking the network layer.
2. As a developer extending the API, I want the `Profile Provider` to act as a thin network adapter, so that I can modify HTTP timeout or retry logic without risking breakages in the complex JSON parsing logic.
3. As a developer troubleshooting API failures, I want the `Profile Provider` and the `Voyager Dash Mapper` to have clear, separate responsibilities, so that stack traces and test failures immediately point to either a network issue or a data-mapping issue.
4. As a developer working on the `Owner Session Integration`, I want the `SessionCoordinator` to be decoupled from HTTP error codes, so that changes to the provider's error mapping do not break the session lease logic.
5. As a developer debugging concurrency, I want the `CoordinatedProvider` to cleanly wrap the provider with a lease, so that I can be confident the lease is always acquired and released reliably, regardless of what error the provider throws.
6. As a developer writing new tests, I want the seams between these modules to be explicit and high-level, so that I can mock dependencies cleanly and avoid fragile integration tests that rely on deep implementation details.

## Implementation Decisions

- **New Module:** Create `src/providers/voyager-dash-mapper.js`. This module will expose a pure function `parseVoyagerDashJson(payload, profileUrl)` that takes the raw Voyager Dash JSON object and returns the normalized `Profile` contract.
- **Module Modification:** Modify `src/providers/linkedin-session.js` to remove the parsing logic. It will now solely focus on constructing the `fetch` request, handling the HTTP response, and delegating the successful payload to the new mapper module.
- **Module Modification:** Modify `src/coordinated-provider.js` to handle generic errors or use a dedicated exception type for session lock issues, rather than parsing `ProfileApiError` HTTP status codes to determine reauthentication state. 
- **Module Modification:** Modify `src/session-coordinator.js` to act purely as a state machine for the lease, devoid of any knowledge of HTTP status codes or API-specific error envelopes.
- **API Contracts:** The external API contract of the Cloudflare Worker remains entirely unchanged. This is a purely internal architectural refactor to improve AI-navigability and testability.
- **Architectural Decisions:** The refactor adheres to the principle of "locality" (grouping related complex logic together) and "leverage" (making complex logic purely functional and easily testable). We are turning shallow modules into deep modules.

## Testing Decisions

- A good test in this context will only test the external behavior of the newly deepened modules at their defined seams. We will not test internal implementation details or private helper functions.
- **`voyager-dash-mapper.js`:** Will be tested in isolation using the existing `voyager-dash.json` fixture. We will assert that given the raw JSON, it returns the exactly expected `Profile` object.
- **`linkedin-session.js`:** Will be tested as a thin network adapter. We will assert that it correctly handles 401, 404, 429, and 500 errors, and properly delegates successful payloads to the mapper.
- **`session-coordinator.js`:** Will be tested purely as a state machine to ensure `acquire`, `release`, and `invalidate` work correctly without any HTTP mocking.
- **`coordinated-provider.js`:** Will be tested to ensure that the lease is always acquired before fetching and released after fetching, verifying the orchestration logic.
- **Prior Art:** We will adapt the existing `test/linkedin-session.test.js` and `test/session-coordinator.test.js` files, migrating the parsing assertions out of the session test and into a dedicated `voyager-dash-mapper.test.js`.

## Out of Scope

- Changing the underlying LinkedIn endpoints or authentication mechanism.
- Modifying the public `Profile` API response contract.
- Adding new features or data fields to the profile enrichment.
- Changing the Cloudflare Worker routing or durable object infrastructure.

## Further Notes

- This PRD was generated as part of a codebase architecture review focusing on deepening opportunities to improve testability and reduce architectural friction.
