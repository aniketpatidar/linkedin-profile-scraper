# Use a Cloudflare Worker as the hosted runtime

Status: accepted

The public API will run as a Cloudflare Worker over HTTPS. Provider credentials stay in deployment-managed secrets; profile data is not persisted, with only an optional short-lived cache permitted later.
