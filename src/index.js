import { createProfileWorker, createRateLimiter } from "./profile-api.js";
import { createLinkedInSessionProvider } from "./providers/linkedin-session.js";
import { createCoordinatedProvider } from "./coordinated-provider.js";
export { ProfileSessionCoordinator } from "./session-coordinator-do.js";

const rateLimiter = createRateLimiter({ maxRequests: 10, windowMs: 60_000 });
const logger = (event) => console.log(JSON.stringify(event));

export default {
  fetch(request, env) {
    const provider = createLinkedInSessionProvider({
      sessionCookie: env.LINKEDIN_SESSION_COOKIE,
    });
    const coordinator = env.SESSION_COORDINATOR?.getByName("owner-session");
    const coordinatedProvider = coordinator
      ? createCoordinatedProvider(provider, coordinator)
      : provider;
    return createProfileWorker(coordinatedProvider, { rateLimiter, logger }).fetch(
      request,
    );
  },
};
