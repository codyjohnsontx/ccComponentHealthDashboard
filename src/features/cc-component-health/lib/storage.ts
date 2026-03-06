import { createSeededDemoState } from "@/src/features/cc-component-health/data/demoSeed";
import { getStravaMode } from "@/src/features/cc-component-health/config/strava";
import type { DemoState } from "@/src/features/cc-component-health/types";

const STORAGE_KEY = "cc-component-health-demo-state";
const STORAGE_SCHEMA_VERSION = 3;

type PersistedDemoState = DemoState & {
  _schemaVersion?: number;
};

export function createDefaultDemoState(): DemoState {
  return {
    ...createSeededDemoState(),
    stravaMode: getStravaMode()
  };
}

export function loadDemoState(): DemoState {
  const defaultState = createDefaultDemoState();

  if (typeof window === "undefined") {
    return defaultState;
  }

  const storedValue = window.localStorage.getItem(STORAGE_KEY);

  if (!storedValue) {
    return defaultState;
  }

  try {
    const parsedValue = JSON.parse(storedValue) as Partial<PersistedDemoState>;

    if (parsedValue._schemaVersion !== STORAGE_SCHEMA_VERSION) {
      return defaultState;
    }

    return {
      ...defaultState,
      ...parsedValue,
      stravaMode: defaultState.stravaMode,
      bikes: parsedValue.bikes ?? defaultState.bikes,
      selectedBikeId: parsedValue.selectedBikeId ?? defaultState.selectedBikeId,
      components: parsedValue.components ?? []
    };
  } catch {
    return defaultState;
  }
}

export function saveDemoState(state: DemoState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      ...state,
      _schemaVersion: STORAGE_SCHEMA_VERSION
    } satisfies PersistedDemoState)
  );
}
