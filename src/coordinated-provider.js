import { ProfileApiError } from "./profile-api.js";

export function createCoordinatedProvider(provider, coordinator) {
  return async function coordinatedProvider(profileUrl) {
    let lease;
    try {
      lease = await coordinator.acquire();
      return await provider(profileUrl);
    } catch (error) {
      if (error?.code === "session_busy") {
        throw new ProfileApiError("session_busy", "deployment session is busy", 429);
      }
      if (error?.code === "provider_auth_failed") {
        await coordinator.invalidate("manual_reauthentication_required");
      }
      throw error;
    } finally {
      if (lease) await coordinator.release(lease.token);
    }
  };
}
