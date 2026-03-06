import { afterEach, describe, expect, it } from "vitest";

import { createSeededDemoState } from "@/src/features/cc-component-health/data/demoSeed";
import { loadDemoState } from "@/src/features/cc-component-health/lib/storage";
import type { DemoState } from "@/src/features/cc-component-health/types";

const STORAGE_KEY = "cc-component-health-demo-state";
const STORAGE_SCHEMA_VERSION = 3;

function installWindow(initialValue?: string) {
  const store = new Map<string, string>();

  if (initialValue !== undefined) {
    store.set(STORAGE_KEY, initialValue);
  }

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      localStorage: {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => {
          store.set(key, value);
        },
        removeItem: (key: string) => {
          store.delete(key);
        }
      }
    }
  });
}

afterEach(() => {
  Reflect.deleteProperty(globalThis, "window");
});

describe("loadDemoState", () => {
  it("returns the seeded demo state when localStorage is empty", () => {
    installWindow();

    const state = loadDemoState();

    expect(state).toEqual({
      ...createSeededDemoState(),
      stravaMode: state.stravaMode
    });
  });

  it("returns the seeded demo state when localStorage contains invalid JSON", () => {
    installWindow("{bad-json");

    const state = loadDemoState();

    expect(state).toEqual({
      ...createSeededDemoState(),
      stravaMode: state.stravaMode
    });
  });

  it("returns saved local state when valid data exists", () => {
    const savedState: DemoState = {
      ...createSeededDemoState(),
      athleteName: "Casey Demo",
      stravaConnected: false,
      bikes: [
        {
          id: "custom-bike",
          name: "Custom Bike",
          discipline: "gravel",
          wearSensitivity: "aggressive"
        }
      ],
      selectedBikeId: "custom-bike",
      components: []
    };

    installWindow(
      JSON.stringify({
        ...savedState,
        _schemaVersion: STORAGE_SCHEMA_VERSION
      })
    );

    const state = loadDemoState();

    expect(state.athleteName).toBe("Casey Demo");
    expect(state.stravaConnected).toBe(false);
    expect(state.bikes[0]?.name).toBe("Custom Bike");
    expect(state.selectedBikeId).toBe("custom-bike");
    expect(state.components).toEqual([]);
  });

  it("migrates legacy saved state back to the seeded experience", () => {
    installWindow(
      JSON.stringify({
        ...createSeededDemoState(),
        athleteName: "Legacy Rider",
        components: []
      })
    );

    const state = loadDemoState();

    expect(state.athleteName).toBe("Avery Rider");
    expect(state.components.length).toBeGreaterThan(0);
  });
});
