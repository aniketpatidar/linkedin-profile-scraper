# LinkedIn Profile API

A Cloudflare Worker implementing the LinkedIn profile API. It accepts a canonical public member-profile URL and returns a provider-neutral normalized profile.

## Scope

This is a limited-use integration using the operator's own manually obtained LinkedIn browser session cookie. It is not a general-purpose or production LinkedIn data service. The cookie is server-side only and is never accepted from API callers. Provider coverage is shape-dependent: the adapter maps fields present in its LinkedIn HTML/JSON-LD response, and missing fields remain explicit Partial Profile values.

## Prerequisites

- Node.js 22 or newer
- A Cloudflare account with Workers access
- Wrangler 4 (installed by the project dependencies)
- The operator's own LinkedIn session cookie, kept outside Git

Install dependencies and run deterministic tests:

```sh
npm install
npm test
```

Tests use synthetic fixtures and never require real LinkedIn credentials.

## Local development

Create the ignored local secret file:

```sh
cp .dev.vars.example .dev.vars
# Edit .dev.vars and set LINKEDIN_SESSION_COOKIE locally
npm run dev
```

The local Worker is available at `http://localhost:8787`. Do not commit `.dev.vars` or place credentials in requests, fixtures, source, or logs.

## Deployment

Authenticate Wrangler, then provision the secret interactively (never pass its value as a command argument):

```sh
npx wrangler login
npx wrangler secret put LINKEDIN_SESSION_COOKIE
npm run deploy
```

Wrangler prints the deployed `workers.dev` URL after a successful deployment. Record that URL in this README only after verifying it. Deployed endpoint: https://linkedin-profile-api.aniketpatidar01.workers.dev. The deployment uses the configured server-side session secret.

## API

`POST /profile` accepts one JSON field:

```json
{ "url": "https://www.linkedin.com/in/example" }
```

Only HTTPS `/in/{public-identifier}` member-profile URLs are accepted. Host aliases, query parameters, and trailing slashes are normalized. Company pages, posts, search URLs, recruiter/private paths, non-HTTPS URLs, and non-LinkedIn URLs are rejected.

Successful responses contain:

- `identity`: name and normalized profile URL
- `headline`, `location`, `about`: nullable singular fields
- `experience`: company, title, description, start/end dates
- `education`: institution, degree, start/end dates
- `skills`: named skills
- `certifications`: name, issuer, issue date
- `languages`: name and proficiency
- `images`: provider URL, kind, and optional dimensions; images are never downloaded or embedded
- `meta`: schema version, retrieval time, source label, and field availability

Missing singular fields are `null`; missing collections are `[]`. An identified profile with missing fields returns HTTP 200 as a Partial Profile.

Errors use `error.code`, `error.message`, and `error.requestId`. Current statuses are `400` invalid input, `404` missing route/profile, `422` unsupported URL, `429` rate limit or `session_busy`, and `502` provider/authentication failure or unavailability. Every response includes `x-request-id`.

## Operational limits

Retrieval is on demand. The Worker does not persist profiles or cache responses. Upstream responses are bounded to 2 MiB and requests time out after 10 seconds. Anonymous access has a best-effort limit of 10 profile requests per minute per client key, plus one active browser operation for the deployment session. Logs contain only method, route, status, request ID, and duration; they omit profile data, full URLs, images, cookies, and provider details. Caller authentication and durable abuse controls are intentionally deferred for this MVP.

## Verification

Use `npm test` for the deterministic verification suite (26 tests). Live verification is opt-in and requires the deployed Worker plus the Owner Credential; it is not part of CI. Verify `/health`, one valid profile request, one unsupported URL, and one provider/authentication failure without recording profile content or credentials. If LinkedIn invalidates the Owner Credential, rotate it interactively with `npx wrangler secret put LINKEDIN_SESSION_COOKIE`, clear coordinated session state through the operator-only reauthentication operation, and do not retry automatically.

The deployed smoke checks verify `GET /health` → `200` and unsupported profile validation → `422`. A successful profile retrieval requires a real public profile URL whose Owner Session Integration is accepted by LinkedIn; the deployment may return `502 provider_unavailable` when LinkedIn rejects Browser Run access.

See [the profile contract](docs/profile-api-contract.md) and [linkedin session integration notes](docs/linkedin-session-integration.md) for the detailed schema and limitations.
