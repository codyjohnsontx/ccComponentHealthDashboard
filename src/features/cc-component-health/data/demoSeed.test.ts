import { describe, expect, it } from "vitest";

import {
  createSeededDemoState,
  SEEDED_BIKE_IDS
} from "@/src/features/cc-component-health/data/demoSeed";
import { mockActivities } from "@/src/features/cc-component-health/data/mockActivities";
import { buildAlerts } from "@/src/features/cc-component-health/lib/alerts";
import {
  getBestPriceOffer,
  getOffersForCatalogKey,
  resolveComponentCatalogKey
} from "@/src/features/cc-component-health/lib/offers";
import { calculateAllComponentHealth } from "@/src/features/cc-component-health/lib/wear";

describe("seeded demo state", () => {
  it("starts connected with bikes and components", () => {
    const seededState = createSeededDemoState();
    const cruxComponents = seededState.components.filter(
      (component) => component.bikeId === SEEDED_BIKE_IDS.gravel
    );

    expect(seededState.stravaConnected).toBe(true);
    expect(seededState.bikes.length).toBeGreaterThan(1);
    expect(seededState.components.length).toBeGreaterThan(0);
    expect(cruxComponents).toHaveLength(6);
  });

  it("produces alerts across bikes on first load", () => {
    const seededState = createSeededDemoState();
    const bikeSensitivityById = Object.fromEntries(
      seededState.bikes.map((bike) => [bike.id, bike.wearSensitivity])
    );
    const healthItems = calculateAllComponentHealth(
      seededState.components,
      mockActivities,
      "normal",
      bikeSensitivityById
    ).map((health) => {
      const component = seededState.components.find(
        (item) => item.id === health.componentId
      );
      const bike = seededState.bikes.find((item) => item.id === component?.bikeId);

      return {
        ...health,
        componentLabel: component?.label ?? "Component",
        bikeId: component?.bikeId ?? "unknown-bike",
        bikeName: bike?.name ?? "Bike"
      };
    });

    const alerts = buildAlerts(healthItems);
    const cruxAlerts = alerts.filter((alert) => alert.bikeId === SEEDED_BIKE_IDS.gravel);

    expect(alerts.length).toBeGreaterThan(0);
    expect(new Set(alerts.map((alert) => alert.bikeId)).size).toBeGreaterThan(1);
    expect(cruxAlerts).toHaveLength(3);
    expect(cruxAlerts.some((alert) => alert.severity === "expired")).toBe(false);
  });

  it("ships seeded offers for all seeded Crux components", () => {
    const seededState = createSeededDemoState();
    const cruxComponents = seededState.components.filter(
      (component) => component.bikeId === SEEDED_BIKE_IDS.gravel
    );

    cruxComponents.forEach((component) => {
      const offers = getOffersForCatalogKey(resolveComponentCatalogKey(component));

      expect(offers.length).toBeGreaterThan(0);
      expect(getBestPriceOffer(offers)).not.toBeNull();
    });
  });
});
