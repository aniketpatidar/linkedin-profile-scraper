import { createProfileWorker } from "./profile-api.js";
import { createLinkedInSessionProvider } from "./providers/linkedin-session.js";

export default {
  fetch(request, env) {
    const provider = createLinkedInSessionProvider({
      sessionCookie: env.LINKEDIN_SESSION_COOKIE
    });
    return createProfileWorker(provider).fetch(request);
  }
};
