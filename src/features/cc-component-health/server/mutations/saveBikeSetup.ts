import { demoStateSchema } from "@/src/features/cc-component-health/schemas/feature";
import type { DemoState } from "@/src/features/cc-component-health/types";

export function saveBikeSetup(state: DemoState) {
  return {
    state: demoStateSchema.parse(state),
    savedAt: new Date().toISOString()
  };
}
