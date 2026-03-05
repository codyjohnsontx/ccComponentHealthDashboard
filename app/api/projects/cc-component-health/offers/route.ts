import { NextResponse } from "next/server";

import {
  buildOfferSummary,
  getOffersForCatalogKey,
  rankRetailerOffers
} from "@/src/features/cc-component-health/lib/offers";
import type { OfferCatalogKey } from "@/src/features/cc-component-health/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const catalogKey = searchParams.get("catalogKey") as OfferCatalogKey | null;

  if (!catalogKey) {
    return NextResponse.json(
      { error: "catalogKey query param is required" },
      { status: 400 }
    );
  }

  const offers = rankRetailerOffers(getOffersForCatalogKey(catalogKey));
  const summary = buildOfferSummary(offers);

  return NextResponse.json({
    offers,
    summary
  });
}
