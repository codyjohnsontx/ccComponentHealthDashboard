import { NextResponse } from "next/server";

import { getMockFeatureBootstrap } from "@/src/features/cc-component-health/adapters/mock/bootstrap";
import {
  matchOffersForComponent,
  rankRetailerOffers,
  buildOfferSummary,
  getOffersForCatalogKey
} from "@/src/features/cc-component-health/domain/offers";
import { resolveComponentCompatibilityProfile } from "@/src/features/cc-component-health/domain/compatibility";
import { offersQuerySchema } from "@/src/features/cc-component-health/schemas/feature";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsedQuery = offersQuerySchema.safeParse({
    componentId: searchParams.get("componentId") ?? undefined,
    catalogKey: searchParams.get("catalogKey") ?? undefined
  });

  if (!parsedQuery.success) {
    return NextResponse.json(
      { error: parsedQuery.error.flatten() },
      { status: 400 }
    );
  }

  const bootstrap = getMockFeatureBootstrap();
  const component = parsedQuery.data.componentId
    ? bootstrap.state.components.find(
        (item) => item.id === parsedQuery.data.componentId
      )
    : undefined;
  const bike = component
    ? bootstrap.state.bikes.find((item) => item.id === component.bikeId)
    : undefined;
  const offers = component
    ? rankRetailerOffers(
        matchOffersForComponent(
          component,
          resolveComponentCompatibilityProfile(component, bike),
          bootstrap.offers,
          bike
        )
      )
    : rankRetailerOffers(
        getOffersForCatalogKey(parsedQuery.data.catalogKey!, bootstrap.offers)
      );
  const summary = buildOfferSummary(offers);

  return NextResponse.json({
    offers,
    summary
  });
}
