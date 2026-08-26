# Challenge Integration

The hiring challenge uses a challenge-only integration backed by the owner’s manually obtained LinkedIn browser session cookie. The cookie is an `Owner Credential`: it is configured as the `LINKEDIN_SESSION_COOKIE` Cloudflare Worker secret and is never accepted from API callers.

## Configuration

For local development, create an untracked `.dev.vars` file from `.dev.vars.example` and set the cookie value locally. For a deployed Worker, set the secret through Wrangler’s interactive secret command:

```sh
npx wrangler secret put LINKEDIN_SESSION_COOKIE
```

Never place the value in `wrangler.jsonc`, source code, logs, request bodies, fixtures, or Git. Rotate the cookie by replacing the Worker secret when the LinkedIn session expires or is revoked.

## Runtime verification

Workers can make outbound HTTPS requests from the fetch handler. The session provider seam constructs requests for normalized /in/ paths using only the server-side secret. Automated tests use fixtures; live connectivity requires deployment with the Owner Credential.

## Scope and limitations

This is limited to the hiring challenge deployment and the owner’s account. It is not a general-purpose authorized LinkedIn data service. It does not accept LinkedIn passwords, caller-provided cookies, or arbitrary authentication material. A session cookie may expire, be revoked, or fail when LinkedIn requires browser execution or rejects Worker-originated requests; in that case the integration must be marked runtime-incompatible rather than bypassing protections.
