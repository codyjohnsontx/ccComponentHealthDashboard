import { componentPresetMap } from "@/src/features/cc-component-health/data/componentPresets";
import { retailerMap } from "@/src/features/cc-component-health/data/retailers";
import {
  evaluateOfferCompatibility,
  resolveCatalogCompatibility
} from "@/src/features/cc-component-health/domain/compatibility";
import type {
  BikeComponent,
  BikeProfile,
  ComponentCompatibilityProfile,
  ComponentPreset,
  OfferCatalogKey,
  OfferSummary,
  RetailerId,
  RetailerOffer
} from "@/src/features/cc-component-health/types";

function getCompatibilityWeight(offer: RetailerOffer): number {
  switch (offer.compatibilityStatus) {
    case "confirmed":
      return 0;
    case "likely":
      return 1;
    case "review":
      return 2;
    case "incompatible":
    default:
      return 3;
  }
}

function getFreshnessWeight(offer: RetailerOffer): number {
  switch (offer.freshness) {
    case "fresh":
      return 0;
    case "aging":
      return 1;
    case "stale":
    default:
      return 2;
  }
}

function compareBestPrice(left: RetailerOffer, right: RetailerOffer) {
  const compatibilityDelta = getCompatibilityWeight(left) - getCompatibilityWeight(right);

  if (compatibilityDelta !== 0) {
    return compatibilityDelta;
  }

  if (left.price !== right.price) {
    return left.price - right.price;
  }

  if (left.totalPrice !== right.totalPrice) {
    return left.totalPrice - right.totalPrice;
  }

  return getFreshnessWeight(left) - getFreshnessWeight(right);
}

function compareLowestDelivered(left: RetailerOffer, right: RetailerOffer) {
  const compatibilityDelta = getCompatibilityWeight(left) - getCompatibilityWeight(right);

  if (compatibilityDelta !== 0) {
    return compatibilityDelta;
  }

  if (left.totalPrice !== right.totalPrice) {
    return left.totalPrice - right.totalPrice;
  }

  if (left.price !== right.price) {
    return left.price - right.price;
  }

  return getFreshnessWeight(left) - getFreshnessWeight(right);
}

export function getPresetForComponent(
  component: BikeComponent
): ComponentPreset | undefined {
  return componentPresetMap.get(component.type);
}

export function resolveComponentCatalogKey(component: BikeComponent): OfferCatalogKey {
  return component.catalogKey ?? getPresetForComponent(component)?.catalogKey ?? "road-chain";
}

export function resolveComponentSearchLabel(component: BikeComponent): string {
  return (
    component.replacementSearchLabel ??
    getPresetForComponent(component)?.replacementSearchLabel ??
    component.label
  );
}

function isMatchingCatalog(
  offerCatalogKey: OfferCatalogKey,
  componentProfile: ComponentCompatibilityProfile
): boolean {
  const catalogProfile = resolveCatalogCompatibility(offerCatalogKey);

  return (
    catalogProfile.componentType === componentProfile.componentType &&
    catalogProfile.discipline === componentProfile.discipline
  );
}

export function getOffersForCatalogKey(
  catalogKey: OfferCatalogKey,
  offers: RetailerOffer[],
  retailers?: RetailerId[]
): RetailerOffer[] {
  const retailerFilter = retailers ? new Set(retailers) : null;

  return offers.filter(
    (offer) =>
      offer.catalogKey === catalogKey &&
      (!retailerFilter || retailerFilter.has(offer.retailerId))
  );
}

export function matchOffersForComponent(
  component: BikeComponent,
  componentProfile: ComponentCompatibilityProfile,
  offers: RetailerOffer[],
  bike?: BikeProfile
): RetailerOffer[] {
  const directCatalogKey = resolveComponentCatalogKey(component);
  const candidateOffers = offers.filter(
    (offer) =>
      offer.catalogKey === directCatalogKey ||
      isMatchingCatalog(offer.catalogKey, componentProfile)
  );

  return candidateOffers.map((offer) => {
    const compatibility = evaluateOfferCompatibility(componentProfile, {
      listingId: offer.listingId,
      catalogKey: offer.catalogKey,
      retailerId: offer.retailerId,
      productName: offer.productName,
      brand: offer.brand,
      productUrl: offer.productUrl,
      affiliateUrl: offer.affiliateUrl,
      compatibilityProfile: {
        ...offer.compatibilityProfile,
        discipline:
          offer.compatibilityProfile.discipline ??
          resolveCatalogCompatibility(offer.catalogKey).discipline ??
          bike?.discipline
      }
    });

    return {
      ...offer,
      ...compatibility
    };
  });
}

export function getBestPriceOffer(offers: RetailerOffer[]): RetailerOffer | null {
  const availableOffers = offers.filter(
    (offer) => offer.inStock && offer.compatibilityStatus !== "incompatible"
  );

  if (availableOffers.length === 0) {
    return null;
  }

  return [...availableOffers].sort(compareBestPrice)[0] ?? null;
}

export function getLowestDeliveredOffer(offers: RetailerOffer[]): RetailerOffer | null {
  const availableOffers = offers.filter(
    (offer) => offer.inStock && offer.compatibilityStatus !== "incompatible"
  );

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

      const compatibilityDelta = getCompatibilityWeight(left) - getCompatibilityWeight(right);

      if (compatibilityDelta !== 0) {
        return compatibilityDelta;
      }

      const freshnessDelta = getFreshnessWeight(left) - getFreshnessWeight(right);

      if (freshnessDelta !== 0) {
        return freshnessDelta;
      }

      const deliveredDelta = compareLowestDelivered(left, right);

      if (deliveredDelta !== 0) {
        return deliveredDelta;
      }

      const leftRetailer = retailerMap.get(left.retailerId)?.name ?? left.retailerId;
      const rightRetailer = retailerMap.get(right.retailerId)?.name ?? right.retailerId;

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
    compatibleOfferCount: rankedOffers.filter(
      (offer) => offer.compatibilityStatus !== "incompatible"
    ).length,
    freshOfferCount: rankedOffers.filter((offer) => offer.freshness === "fresh").length,
    agingOfferCount: rankedOffers.filter((offer) => offer.freshness === "aging").length,
    staleOfferCount: rankedOffers.filter((offer) => offer.freshness === "stale").length,
    retailerCount: rankedOffers.length,
    lastCheckedAt
  };
}
