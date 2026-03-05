import { componentPresetMap } from "@/src/features/cc-component-health/data/componentPresets";
import { mockOffers } from "@/src/features/cc-component-health/data/mockOffers";
import { retailerMap } from "@/src/features/cc-component-health/data/retailers";
import type {
  BikeComponent,
  ComponentPreset,
  OfferCatalogKey,
  OfferSummary,
  RetailerId,
  RetailerOffer
} from "@/src/features/cc-component-health/types";

function compareBestPrice(left: RetailerOffer, right: RetailerOffer) {
  if (left.price !== right.price) {
    return left.price - right.price;
  }

  if (left.totalPrice !== right.totalPrice) {
    return left.totalPrice - right.totalPrice;
  }

  return left.retailerId.localeCompare(right.retailerId);
}

function compareLowestDelivered(left: RetailerOffer, right: RetailerOffer) {
  if (left.totalPrice !== right.totalPrice) {
    return left.totalPrice - right.totalPrice;
  }

  if (left.price !== right.price) {
    return left.price - right.price;
  }

  return left.retailerId.localeCompare(right.retailerId);
}

export function getOffersForCatalogKey(
  catalogKey: OfferCatalogKey,
  retailers?: RetailerId[]
): RetailerOffer[] {
  const retailerFilter = retailers ? new Set(retailers) : null;

  return mockOffers.filter(
    (offer) =>
      offer.catalogKey === catalogKey &&
      (!retailerFilter || retailerFilter.has(offer.retailerId))
  );
}

export function getBestPriceOffer(offers: RetailerOffer[]): RetailerOffer | null {
  const availableOffers = offers.filter((offer) => offer.inStock);

  if (availableOffers.length === 0) {
    return null;
  }

  return [...availableOffers].sort(compareBestPrice)[0] ?? null;
}

export function getLowestDeliveredOffer(offers: RetailerOffer[]): RetailerOffer | null {
  const availableOffers = offers.filter((offer) => offer.inStock);

  if (availableOffers.length === 0) {
    return null;
  }

  return [...availableOffers].sort(compareLowestDelivered)[0] ?? null;
}

export function rankRetailerOffers(offers: RetailerOffer[]): RetailerOffer[] {
  const bestPriceOffer = getBestPriceOffer(offers);
  const lowestDeliveredOffer = getLowestDeliveredOffer(offers);

  return [...offers]
    .map((offer) => {
      let badge: RetailerOffer["badge"] = "none";

      if (bestPriceOffer && offer.id === bestPriceOffer.id) {
        badge = "best_price";
      } else if (lowestDeliveredOffer && offer.id === lowestDeliveredOffer.id) {
        badge = "lowest_delivered";
      }

      return {
        ...offer,
        badge
      };
    })
    .sort((left, right) => {
      if (left.inStock !== right.inStock) {
        return left.inStock ? -1 : 1;
      }

      const leftRetailer = retailerMap.get(left.retailerId)?.name ?? left.retailerId;
      const rightRetailer = retailerMap.get(right.retailerId)?.name ?? right.retailerId;
      const deliveredDelta = compareLowestDelivered(left, right);

      if (deliveredDelta !== 0) {
        return deliveredDelta;
      }

      return leftRetailer.localeCompare(rightRetailer);
    });
}

export function buildOfferSummary(offers: RetailerOffer[]): OfferSummary {
  const rankedOffers = rankRetailerOffers(offers);
  const bestPriceOffer = rankedOffers.find((offer) => offer.badge === "best_price") ?? null;
  const lowestDeliveredOffer =
    rankedOffers.find((offer) => offer.badge === "lowest_delivered") ??
    bestPriceOffer;
  const lastCheckedAt =
    rankedOffers
      .map((offer) => offer.lastCheckedAt)
      .sort()
      .at(-1) ?? null;

  return {
    catalogKey: rankedOffers[0]?.catalogKey ?? offers[0]?.catalogKey ?? "road-chain",
    bestPriceOfferId: bestPriceOffer?.id ?? null,
    lowestDeliveredOfferId: lowestDeliveredOffer?.id ?? null,
    availableOfferCount: rankedOffers.filter((offer) => offer.inStock).length,
    retailerCount: rankedOffers.length,
    lastCheckedAt
  };
}

export function getPresetForComponent(
  component: BikeComponent
): ComponentPreset | undefined {
  return componentPresetMap.get(component.type);
}

export function resolveComponentCatalogKey(component: BikeComponent): OfferCatalogKey {
  return (
    component.catalogKey ??
    getPresetForComponent(component)?.catalogKey ??
    "road-chain"
  );
}

export function resolveComponentSearchLabel(component: BikeComponent): string {
  return (
    component.replacementSearchLabel ??
    getPresetForComponent(component)?.replacementSearchLabel ??
    component.label
  );
}
