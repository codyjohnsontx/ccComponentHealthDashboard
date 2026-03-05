import { describe, expect, it } from "vitest";

import {
  buildOfferSummary,
  getBestPriceOffer,
  getLowestDeliveredOffer,
  getOffersForCatalogKey,
  rankRetailerOffers
} from "@/src/features/cc-component-health/lib/offers";

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
  });
});
