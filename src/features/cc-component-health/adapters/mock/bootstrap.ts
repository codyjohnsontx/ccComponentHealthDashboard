import { createSeededDemoState } from "@/src/features/cc-component-health/data/demoSeed";
import { mockActivities } from "@/src/features/cc-component-health/data/mockActivities";
import { mockOffers } from "@/src/features/cc-component-health/data/mockOffers";
import { getStravaMode } from "@/src/features/cc-component-health/config/strava";
import {
  demoStateSchema,
  retailerOfferSchema
} from "@/src/features/cc-component-health/schemas/feature";
import type { DemoState, FeatureBootstrapData } from "@/src/features/cc-component-health/types";

export function createDefaultDemoState(): DemoState {
  return demoStateSchema.parse({
    ...createSeededDemoState(),
    stravaMode: getStravaMode()
  });
}

export function getMockFeatureBootstrap(): FeatureBootstrapData {
  return {
    state: createDefaultDemoState(),
    activities: mockActivities,
    offers: retailerOfferSchema.array().parse(mockOffers)
  };
}
