# Authorized Source Research

Status: blocked
Date: 2026-08-27

## Conclusion

No Authorized Source is selected for the current challenge scope. The implementation is blocked until a provider gives written authorization for this hosted API use, or the product scope is changed to a consent-based API that retrieves the authenticated caller’s own profile.

## Official LinkedIn API

LinkedIn’s Profile API documentation says access is restricted to approved developers and requires an access token on behalf of a user. The current-member endpoint is `GET /v2/me`; retrieving another member requires a Person ID available only through limited-access APIs and is subject to privacy settings. Additional field projections require permissions granted only to select partners. The documented public URL is derived from a returned `vanityName`, not accepted as a general lookup key.

The open self-serve OpenID Connect profile permission provides the authenticated member’s name, headline, and photo. This does not satisfy anonymous lookup of an arbitrary public profile or the requested experience, education, skills, certifications, and languages coverage.

Sources: [LinkedIn Profile API](https://learn.microsoft.com/en-us/linkedin/shared/integrations/people/profile-api), [Getting Access to LinkedIn APIs](https://learn.microsoft.com/en-us/linkedin/shared/authentication/getting-access), [Sign In with LinkedIn](https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/sign-in-with-linkedin).

## Bright Data LinkedIn Scraper API

Bright Data documents a URL-based LinkedIn profile endpoint that returns structured JSON and advertises profile work history, education, skills, and other fields. It uses an API key, supports synchronous requests for real-time lookups, and documents a maximum of 20 URLs for synchronous requests in the general LinkedIn Scraper API guide. Cloudflare Worker compatibility is technically plausible because the integration is an outbound HTTPS request with a bearer token.

However, Bright Data’s current License Agreement says clients may not distribute, transmit, reproduce, publish, license, transfer, or sell Data to offer a similar or competitive product. It also grants use of relevant systems for the client’s internal business operations and places legal/privacy obligations on the client. A public API that accepts profile URLs and returns profile data appears potentially similar to the requested product, so the available public terms are insufficient to establish authorization. Do not integrate this provider without written confirmation that this exact use and redistribution model is permitted.

Sources: [LinkedIn Scraper API introduction](https://docs.brightdata.com/datasets/scrapers/linkedin/introduction), [Collect LinkedIn Profiles by URL](https://docs.brightdata.com/api-reference/scrapers/social-media-apis/linkedin-profiles-collect-by-url), [Bright Data License Agreement](https://brightdata.com/license).

## Cloudflare Worker compatibility and secrets

Cloudflare Workers support outbound `fetch()` calls from the request handler. Cloudflare documents encrypted Worker secret bindings for API keys and auth tokens, and recommends secrets rather than plaintext variables for sensitive values. This runtime requirement is therefore not the blocker; source authorization and contract suitability are.

Sources: [Workers Fetch API](https://developers.cloudflare.com/workers/runtime-apis/fetch/), [Workers Secrets](https://developers.cloudflare.com/workers/configuration/secrets/).

## Required resolution

Obtain written provider authorization covering: accepting arbitrary public member-profile URLs; returning profile data through this API to third-party callers; the intended commercial/non-commercial use; retention and deletion; image URL handling; rate limits; and the requested field set. If no provider grants those rights, revise the scope to an authenticated-member profile API and require OAuth consent from the member whose profile is requested.

## Known contract gaps and failure modes

- Official self-serve LinkedIn access cannot provide arbitrary public-profile lookup.
- Official profile fields and permissions may omit most requested enrichment fields.
- Member privacy settings, Off-LinkedIn Visibility, approval status, and partner permissions can prevent retrieval.
- Third-party provider fields, freshness, image URLs, rate limits, and errors must not be claimed until contractually and technically verified.
- Provider authorization, API key validity, rate limits, timeouts, malformed payloads, unavailable profiles, and revoked access must map to the normalized error/availability model.
