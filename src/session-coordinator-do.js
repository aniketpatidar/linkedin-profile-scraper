import { DurableObject } from "cloudflare:workers";
import { createSessionCoordinator } from "./session-coordinator.js";

export class ProfileSessionCoordinator extends DurableObject {
  #coordinator;

  constructor(ctx, env) {
    super(ctx, env);
    this.#coordinator = createSessionCoordinator({ storage: ctx.storage.kv });
  }

  acquire() {
    return this.#coordinator.acquire();
  }

  release(token) {
    return this.#coordinator.release(token);
  }

  invalidate(reason) {
    return this.#coordinator.invalidate(reason);
  }

  status() {
    return this.#coordinator.status();
  }
}
