import { describe, expect, it } from "vitest";

import { resolveComponentCompatibilityProfile, evaluateOfferCompatibility } from "@/src/features/cc-component-health/domain/compatibility";
import { createSeededDemoState } from "@/src/features/cc-component-health/data/demoSeed";
import { mockOffers } from "@/src/features/cc-component-health/data/mockOffers";

describe("offer compatibility", () => {
  it("confirms matching gravel listings against seeded gravel components", () => {
    const state = createSeededDemoState();
    const component = state.components.find((item) => item.id === "component-gravel-chain");
    const bike = state.bikes.find((item) => item.id === component?.bikeId);
    const offer = mockOffers.find((item) => item.id === "offer-gravel-chain-jenson");

    const match = evaluateOfferCompatibility(
      resolveComponentCompatibilityProfile(component!, bike),
      offer!
    );

    expect(match.compatibilityStatus).toBe("confirmed");
    expect(match.matchConfidence).toBe("exact");
  });

  it("rejects mismatched discipline profiles", () => {
    const state = createSeededDemoState();
    const component = state.components.find((item) => item.id === "component-road-chain");
    const bike = state.bikes.find((item) => item.id === component?.bikeId);
    const offer = mockOffers.find((item) => item.id === "offer-gravel-chain-jenson");

    const match = evaluateOfferCompatibility(
      resolveComponentCompatibilityProfile(component!, bike),
      offer!
    );

    expect(match.compatibilityStatus).toBe("incompatible");
  });
});
