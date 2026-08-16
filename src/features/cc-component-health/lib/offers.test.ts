import { describe, expect, it } from "vitest";

import { createSeededDemoState } from "@/src/features/cc-component-health/data/demoSeed";
import { resolveComponentCompatibilityProfile } from "@/src/features/cc-component-health/domain/compatibility";
import {
  buildOfferSummary,
  getBestPriceOffer,
  getLowestDeliveredOffer,
  getOffersForCatalogKey,
  matchOffersForComponent,
  rankRetailerOffers
} from "@/src/features/cc-component-health/lib/offers";
import { mockOffers } from "@/src/features/cc-component-health/data/mockOffers";

describe("offer ranking", () => {
  it("selects the lowest listed price among in-stock offers", () => {
    const offers = getOffersForCatalogKey("road-rear-tire");

    expect(getBestPriceOffer(offers)?.retailerId).toBe("worldwide-cyclery");
  });

  it("selects the lowest delivered total separately from listed price", () => {
    const offers = getOffersForCatalogKey("road-brake-pads");

    expect(getLowestDeliveredOffer(offers)?.retailerId).toBe("worldwide-cyclery");
  });

  it("ranks out-of-stock offers after in-stock offers", () => {
    const offers = rankRetailerOffers(getOffersForCatalogKey("road-chain"));

    expect(offers.at(-1)?.inStock).toBe(false);
  });

  it("builds a summary with retailer coverage and freshest timestamp", () => {
    const summary = buildOfferSummary(getOffersForCatalogKey("bar-tape"));

    expect(summary.retailerCount).toBeGreaterThan(0);
    expect(summary.availableOfferCount).toBeGreaterThan(0);
    expect(summary.lastCheckedAt).toBeTruthy();
    expect(summary.compatibleOfferCount).toBeGreaterThan(0);
  });

  it("badges one offer as both best price and lowest delivered when it wins both", () => {
    const offers = rankRetailerOffers(getOffersForCatalogKey("bar-tape"));
    const winner = offers.find((offer) => offer.retailerId === "rei");

    expect(winner?.badges).toEqual(
      expect.arrayContaining(["best_price", "lowest_delivered"])
    );
    expect(
      offers.filter((offer) => offer.badges.includes("best_price"))
    ).toHaveLength(1);
  });

  it("counts unique retailers rather than offers", () => {
    const [first, second] = getOffersForCatalogKey("road-chain");
    const duplicateRetailerOffers = [
      first,
      { ...second, id: `${second.id}-second-listing`, retailerId: first.retailerId }
    ];

    const summary = buildOfferSummary(duplicateRetailerOffers);

    expect(summary.retailerCount).toBe(1);
  });

  it("attaches compatibility and freshness metadata to component matches", () => {
    const state = createSeededDemoState();
    const component = state.components.find((item) => item.id === "component-gravel-chain");
    const bike = state.bikes.find((item) => item.id === component?.bikeId);
    const offers = matchOffersForComponent(
      component!,
      resolveComponentCompatibilityProfile(component!, bike),
      mockOffers,
      bike
    );

    expect(offers.every((offer) => offer.matchConfidence)).toBe(true);
    expect(offers.some((offer) => offer.freshness === "aging")).toBe(true);
  });
});
