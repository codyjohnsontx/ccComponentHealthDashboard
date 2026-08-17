import { getMockFeatureBootstrap } from "@/src/features/cc-component-health/adapters/mock/bootstrap";
import {
  buildAlertsSnapshot,
  buildComponentDetailSnapshot,
  buildDashboardSnapshot,
  buildLandingSnapshot
} from "@/src/features/cc-component-health/domain/snapshots";

export async function getLandingSnapshot() {
  return buildLandingSnapshot(getMockFeatureBootstrap());
}

export async function getDashboardSnapshot(input?: { bikeId?: string }) {
  const bootstrap = getMockFeatureBootstrap();

  return buildDashboardSnapshot(bootstrap, input?.bikeId ?? bootstrap.state.selectedBikeId);
}

export async function getAlertsSnapshot(input?: { bikeId?: string }) {
  const bootstrap = getMockFeatureBootstrap();

  return buildAlertsSnapshot(bootstrap, input?.bikeId ?? bootstrap.state.selectedBikeId);
}

export async function getComponentDetailSnapshot(input: { componentId: string }) {
  return buildComponentDetailSnapshot(getMockFeatureBootstrap(), input.componentId);
}

export async function getFeatureBootstrap() {
  return getMockFeatureBootstrap();
}
