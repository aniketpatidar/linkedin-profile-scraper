# LinkedIn access and Browser Run research

Date: 2026-08-27

## Question

Why does the deployed Worker fail to retrieve a profile with an owner session cookie, and does a browser runtime provide a supported path forward?

## Verified evidence

### LinkedIn API access

LinkedIn's official Profile API requires an authenticated access token and is restricted to approved developers and applicable data agreements. The current-member endpoint is GET /v2/me. Retrieving another member requires a Person ID available only through certain limited-access APIs, and field projections require additional permissions.

Source: [LinkedIn Profile API](https://learn.microsoft.com/en-us/linkedin/shared/integrations/people/profile-api)

LinkedIn's documented authorization model is OAuth 2.0: member authorization grants an application permission to access that member's resources, and application access is governed by the permissions and partner programs available to the application.

Source: [Getting Access to LinkedIn APIs](https://learn.microsoft.com/en-us/linkedin/shared/authentication/getting-access)
Source: [Authorization Code Flow](https://learn.microsoft.com/en-us/linkedin/shared/authentication/authorization-code-flow)

### Automated access restrictions

LinkedIn's User Agreement prohibits software, scripts, robots, crawlers, or other processes used to scrape or copy LinkedIn services, including profiles. It also prohibits bypassing security features, access controls, or use limits, and prohibits unauthorized automated access.

Source: [LinkedIn User Agreement, Section 8.2](https://www.linkedin.com/legal/user-agreement)

LinkedIn's Crawling Terms state that automated crawling requires express permission, must use the approved IP address and user-agent identity, and must not circumvent measures used to control or limit access.

Source: [LinkedIn Crawling Terms](https://www.linkedin.com/legal/crawling-terms)

### Cloudflare Browser Run

Cloudflare Browser Run supports browser sessions through Puppeteer in a Worker when a browser binding is declared and the @cloudflare/puppeteer package is installed. The documented Worker integration is puppeteer.launch(env.BROWSER).

Source: [Cloudflare Browser Run Puppeteer](https://developers.cloudflare.com/browser-run/puppeteer/)
Source: [Cloudflare Browser Run Wrangler binding](https://developers.cloudflare.com/browser-run/reference/wrangler/)

Browser Run is a browser execution environment, not a LinkedIn authorization mechanism. Cloudflare documents browser automation capabilities, but its documentation does not promise access to sites that reject automated clients.

Source: [Cloudflare Browser Run overview](https://developers.cloudflare.com/browser-run/)

## Local implementation experiment

The Worker was deployed with:

- a BROWSER binding;
- @cloudflare/puppeteer;
- server-side injection of the configured LinkedIn session cookies;
- a 15-second navigation timeout;
- browser cleanup in finally;
- the existing profile parser plus a rendered-DOM identity fallback.

The deterministic browser-provider tests pass. The public request to the supplied profile URL produced:

HTTP 404
error=profile_not_found

Before Browser Run, the plain Worker fetch path produced:

HTTP 999
error=provider_unavailable

The Browser Run result is evidence that the browser path changed the upstream behavior from an explicit HTTP 999 block to a page that did not expose a parseable profile identity. It does not prove that the cookie was accepted or that the account was authenticated in the browser context.

## Ranked conclusions

1. The current failure is not explained by the Worker URL parser or cookie secret provisioning. The plain path received LinkedIn HTTP 999; the browser path reached a page but yielded no parseable identity.
2. Browser Run is technically integrated, but it is not a reliable solution for this profile retrieval target. More selector work may improve parsing only if the rendered page actually contains authorized profile data; it cannot solve a denied or redirected session.
3. The official, supportable implementation path is OAuth-based retrieval of the authenticated member's permitted data, subject to LinkedIn approval and field permissions.
4. Arbitrary public-profile retrieval requires a provider or written permission that explicitly covers automated collection and redistribution. A private endpoint or stealth-browser approach would conflict with the restrictions above and is not a sound fix.

## Recommended next step

Do not add more request headers, private endpoints, proxy rotation, CAPTCHA bypasses, or stealth behavior. Either narrow the API to OAuth-authorized member data, obtain an explicitly permitted data provider, or retain the current provider-neutral contract with live LinkedIn retrieval documented as unavailable in this runtime.
