# LinkedIn Session Integration

The service uses a limited-use integration backed by the owner’s manually obtained LinkedIn browser session cookie. The cookie is an `Owner Credential`: it is configured as the `LINKEDIN_SESSION_COOKIE` Cloudflare Worker secret and is never accepted from API callers.

## Configuration

For local development, create an untracked `.dev.vars` file from `.dev.vars.example` and set the cookie value locally. For a deployed Worker, set the secret through Wrangler’s interactive secret command:

```sh
npx wrangler secret put LINKEDIN_SESSION_COOKIE
```

Never place the value in `wrangler.jsonc`, source code, logs, request bodies, fixtures, or Git. Rotate the cookie by replacing the Worker secret when the LinkedIn session expires or is revoked.

## Runtime verification

The Browser Run Profile Provider opens one public rendered profile per synchronous request. The Worker coordinates access through a deployment-scoped session coordinator and returns a normalized Partial Profile when identity is available. Automated tests use fixtures and mocked browser behavior; live connectivity requires deployment with the Owner Credential.

## Reauthentication

When the owner session is invalidated, stop live requests, sign in again, and replace the deployment secret interactively:

```sh
npx wrangler secret put LINKEDIN_SESSION_COOKIE
```

The session coordinator must then be cleared through its operator-only reauthentication operation before live requests resume. Never expose or send the cookie through the API.

## Scope and limitations

This is limited to the configured deployment and the owner’s account. It is not a general-purpose authorized LinkedIn data service. It does not accept LinkedIn passwords, caller-provided cookies, or arbitrary authentication material. A session cookie may expire, be revoked, or fail when LinkedIn requires browser execution or rejects Worker-originated requests; in that case the integration must be marked runtime-incompatible rather than bypassing protections.
Operational safeguards are intentionally MVP-scoped: profile retrieval is on demand with no profile persistence or cache, upstream responses are bounded and timed out, and the Worker applies a best-effort per-client rate limit plus a single-session concurrency limit. This is not a durable abuse-control boundary.
Live verification observed LinkedIn HTTP 999 from the Worker despite a configured session cookie; this is treated as provider_unavailable and indicates LinkedIn is blocking Worker-originated access. The adapter does not bypass that protection.
