import { loadBrowserDemoState, saveBrowserDemoState } from "@/src/features/cc-component-health/adapters/local/browserDemoStateStore";
import { createDefaultDemoState } from "@/src/features/cc-component-health/adapters/mock/bootstrap";
import type { DemoState } from "@/src/features/cc-component-health/types";

export { STORAGE_KEY, STORAGE_SCHEMA_VERSION } from "@/src/features/cc-component-health/adapters/local/browserDemoStateStore";
export { createDefaultDemoState } from "@/src/features/cc-component-health/adapters/mock/bootstrap";

export function loadDemoState(defaultState = createDefaultDemoState()): DemoState {
  return loadBrowserDemoState(defaultState);
}

export function saveDemoState(state: DemoState) {
  saveBrowserDemoState(state);
}
