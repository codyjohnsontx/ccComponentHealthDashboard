import { describe, expect, it } from "vitest";

import { createSeededDemoState } from "@/src/features/cc-component-health/data/demoSeed";
import { markComponentReplaced } from "@/src/features/cc-component-health/server/mutations/markComponentReplaced";
import { recordAffiliateClick } from "@/src/features/cc-component-health/server/mutations/recordAffiliateClick";

describe("markComponentReplaced", () => {
  it("carries the component's bikeId onto the service event", () => {
    const state = createSeededDemoState();
    const component = state.components[0];

    const result = markComponentReplaced(state, {
      componentId: component.id,
      mileageAtService: 1200
    });

    expect(result.serviceEvent.bikeId).toBe(component.bikeId);
  });

  it("gives same-day replacements of one component distinct event ids", () => {
    const state = createSeededDemoState();
    const componentId = state.components[0].id;

    const first = markComponentReplaced(state, {
      componentId,
      date: "2026-08-16",
      mileageAtService: 1200
    });
    const second = markComponentReplaced(first.state, {
      componentId,
      date: "2026-08-16",
      mileageAtService: 1400
    });

    expect(second.serviceEvent.id).not.toBe(first.serviceEvent.id);
    expect(new Set(second.state.serviceEvents.map((event) => event.id)).size).toBe(
      second.state.serviceEvents.length
    );
  });

  it("refuses to create an orphaned event for an unknown component", () => {
    const state = createSeededDemoState();

    expect(() =>
      markComponentReplaced(state, {
        componentId: "component-does-not-exist",
        mileageAtService: 1200
      })
    ).toThrow(/component-does-not-exist/);
    expect(state.serviceEvents.every((event) => event.componentId !== "component-does-not-exist")).toBe(
      true
    );
  });
});

describe("recordAffiliateClick", () => {
  it("gives rapid clicks on the same offer distinct event ids", () => {
    const state = createSeededDemoState();
    const input = {
      componentId: state.components[0].id,
      retailerId: "jenson-usa" as const,
      offerId: "offer-road-chain-jenson",
      surface: "detail" as const
    };

    const ids = new Set(
      Array.from({ length: 50 }, () => recordAffiliateClick(state, input).event.id)
    );

    expect(ids.size).toBe(50);
  });
});
