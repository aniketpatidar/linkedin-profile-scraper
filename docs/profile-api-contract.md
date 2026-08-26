# Profile API contract

The Worker exposes `POST /profile` with a JSON body containing one `url` field:

```json
{"url":"https://www.linkedin.com/in/example"}
```

Only HTTPS URLs for public member profiles in the `/in/{public-identifier}` shape are accepted. Locale subdomains, trailing slashes, and query parameters are normalized away. Company pages, posts, search URLs, recruiter/private URLs, non-HTTPS URLs, and non-LinkedIn URLs are rejected.

Collection item shapes are stable: experience uses company/title/description/startDate/endDate; education uses institution/degree/startDate/endDate; skills use name; certifications use name/issuer/dateIssued; languages use name/proficiency; images use provider url/kind and optional width/height.
Successful responses contain `identity`, `headline`, `location`, `about`, `experience`, `education`, `skills`, `certifications`, `languages`, `images`, and `meta`. Missing singular fields are `null`; missing collections are `[]`. `meta.fieldAvailability` identifies which fields the source supplied. A profile identified by the provider with missing fields is a Partial Profile and still returns HTTP 200.

Errors use this shape:

```json
{"error":{"code":"unsupported_profile","message":"only public member profiles are supported","requestId":"..."}}
```

The current slice maps invalid input to `400`, unsupported profile shapes to `422`, missing profiles to `404`, and provider failures to `502`. Every response includes an `x-request-id` header; profile content and provider error details are not logged or returned.
