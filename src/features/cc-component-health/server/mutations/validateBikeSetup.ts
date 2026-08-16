import { demoStateSchema } from "@/src/features/cc-component-health/schemas/feature";
import type { DemoState } from "@/src/features/cc-component-health/types";

/**
 * Validates a demo state payload and returns the parsed copy. This project has no
 * server-side store: the client owns state through DemoStateProvider and persists
 * it with saveDemoState (localStorage). Nothing here writes anywhere.
 */
export function validateBikeSetup(state: DemoState) {
  return {
    state: demoStateSchema.parse(state),
    validatedAt: new Date().toISOString()
  };
}
