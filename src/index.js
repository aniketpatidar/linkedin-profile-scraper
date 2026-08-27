import { createLinkedInBrowserProvider } from "./providers/linkedin-browser.js";
import { createProfileWorker, createRateLimiter } from "./profile-api.js";
import { createLinkedInSessionProvider } from "./providers/linkedin-session.js";
export { ProfileSessionCoordinator } from "./session-coordinator-do.js";

const rateLimiter = createRateLimiter({ maxRequests: 10, windowMs: 60_000 });
const logger = (event) => console.log(JSON.stringify(event));

export default {
  fetch(request, env) {
    const provider = env.BROWSER
      ? createLinkedInBrowserProvider({
          browser: env.BROWSER,
          sessionCookie: env.LINKEDIN_SESSION_COOKIE,
        })
      : createLinkedInSessionProvider({
          sessionCookie: env.LINKEDIN_SESSION_COOKIE,
        });
    return createProfileWorker(provider, { rateLimiter, logger }).fetch(
      request,
    );
  },
};
