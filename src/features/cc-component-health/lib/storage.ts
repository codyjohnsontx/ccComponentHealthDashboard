import { getStravaMode } from "@/src/features/cc-component-health/config/strava";
import type { DemoState } from "@/src/features/cc-component-health/types";

const STORAGE_KEY = "cc-component-health-demo-state";

export function createDefaultDemoState(): DemoState {
  return {
    stravaConnected: false,
    stravaMode: getStravaMode(),
    athleteName: "Avery Rider",
    bike: null,
    components: []
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
    const parsedValue = JSON.parse(storedValue) as Partial<DemoState>;

    return {
      ...defaultState,
      ...parsedValue,
      stravaMode: defaultState.stravaMode,
      bike: parsedValue.bike ?? null,
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

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
