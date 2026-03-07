import { mockOffers } from "@/src/features/cc-component-health/data/mockOffers";
import {
  buildOfferSummary as buildOfferSummaryInternal,
  getBestPriceOffer as getBestPriceOfferInternal,
  getLowestDeliveredOffer as getLowestDeliveredOfferInternal,
  getOffersForCatalogKey as getOffersForCatalogKeyInternal,
  getPresetForComponent,
  matchOffersForComponent,
  rankRetailerOffers as rankRetailerOffersInternal,
  resolveComponentCatalogKey,
  resolveComponentSearchLabel
} from "@/src/features/cc-component-health/domain/offers";
import type { OfferCatalogKey, RetailerId, RetailerOffer } from "@/src/features/cc-component-health/types";

export { getPresetForComponent, matchOffersForComponent, resolveComponentCatalogKey, resolveComponentSearchLabel };

export function getOffersForCatalogKey(
  catalogKey: OfferCatalogKey,
  retailers?: RetailerId[]
): RetailerOffer[] {
  return getOffersForCatalogKeyInternal(catalogKey, mockOffers, retailers);
}

export function getBestPriceOffer(offers: RetailerOffer[]) {
  return getBestPriceOfferInternal(offers);
}

export function getLowestDeliveredOffer(offers: RetailerOffer[]) {
  return getLowestDeliveredOfferInternal(offers);
}

export function rankRetailerOffers(offers: RetailerOffer[]) {
  return rankRetailerOffersInternal(offers);
}

export function buildOfferSummary(offers: RetailerOffer[]) {
  return buildOfferSummaryInternal(offers);
}
