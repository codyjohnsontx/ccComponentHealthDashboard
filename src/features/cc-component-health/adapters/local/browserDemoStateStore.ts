import {
  demoStateSchema,
  persistedDemoStateSchema
} from "@/src/features/cc-component-health/schemas/feature";
import type { DemoState } from "@/src/features/cc-component-health/types";

export const STORAGE_KEY = "cc-component-health-demo-state";
export const STORAGE_SCHEMA_VERSION = 4;

type PersistedDemoState = DemoState & {
  _schemaVersion?: number;
};

export function loadBrowserDemoState(defaultState: DemoState): DemoState {
  if (typeof window === "undefined") {
    return defaultState;
  }

  const storedValue = window.localStorage.getItem(STORAGE_KEY);

  if (!storedValue) {
    return defaultState;
  }

  try {
    const parsedValue = persistedDemoStateSchema.parse(
      JSON.parse(storedValue)
    ) as PersistedDemoState;

    if (parsedValue._schemaVersion !== STORAGE_SCHEMA_VERSION) {
      return defaultState;
    }

    return demoStateSchema.parse({
      ...defaultState,
      ...parsedValue,
      stravaMode: defaultState.stravaMode,
      bikes: parsedValue.bikes ?? defaultState.bikes,
      selectedBikeId: parsedValue.selectedBikeId ?? defaultState.selectedBikeId,
      components: parsedValue.components ?? defaultState.components,
      serviceEvents: parsedValue.serviceEvents ?? defaultState.serviceEvents,
      affiliateClicks: parsedValue.affiliateClicks ?? defaultState.affiliateClicks
    });
  } catch {
    return defaultState;
  }
}

export function saveBrowserDemoState(state: DemoState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      ...demoStateSchema.parse(state),
      _schemaVersion: STORAGE_SCHEMA_VERSION
    } satisfies PersistedDemoState)
  );
}
