"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

import { trackEvent } from "@/src/features/cc-component-health/analytics/trackEvent";
import {
  createComponentFromPreset,
  componentPresetMap
} from "@/src/features/cc-component-health/data/componentPresets";
import { createSeededDemoState } from "@/src/features/cc-component-health/data/demoSeed";
import {
  buildAlertsSnapshot,
  buildComponentDetailSnapshot,
  buildDashboardSnapshot,
  buildGearHealthSnapshot,
  buildLandingSnapshot
} from "@/src/features/cc-component-health/domain/snapshots";
import {
  loadDemoState,
  saveDemoState
} from "@/src/features/cc-component-health/lib/storage";
import { canConnectStrava } from "@/src/features/cc-component-health/config/strava";
import { markComponentReplaced as applyComponentReplaced } from "@/src/features/cc-component-health/server/mutations/markComponentReplaced";
import { recordAffiliateClick as applyAffiliateClick } from "@/src/features/cc-component-health/server/mutations/recordAffiliateClick";
import { saveBikeSetup } from "@/src/features/cc-component-health/server/mutations/saveBikeSetup";
import type {
  AffiliateSurface,
  BikeComponent,
  BikeFilterId,
  BikeProfile,
  ComponentDetailSnapshot,
  ComponentType,
  DemoState,
  FeatureBootstrapData,
  GearHealthSnapshot,
  LandingSnapshot,
  OfferSummary,
  RetailerOffer,
  ServiceEvent
} from "@/src/features/cc-component-health/types";

interface DemoStateContextValue extends GearHealthSnapshot {
  hydrated: boolean;
  landingSnapshot: LandingSnapshot;
  dashboardSnapshot: ReturnType<typeof buildDashboardSnapshot>;
  alertsSnapshot: ReturnType<typeof buildAlertsSnapshot>;
  connectMockStrava: () => void;
  selectBike: (bikeId: BikeFilterId) => void;
  saveBike: (bikeProfile: BikeProfile) => void;
  addComponent: (component: BikeComponent) => void;
  addStarterKit: (bikeId?: string) => void;
  updateComponent: (component: BikeComponent) => void;
  markComponentReplaced: (componentId: string) => void;
  recordAffiliateClick: (input: {
    componentId: string;
    retailerId: RetailerOffer["retailerId"];
    offerId: string;
    surface: AffiliateSurface;
    catalogKey?: RetailerOffer["catalogKey"];
    price?: number;
    totalPrice?: number;
  }) => void;
  resetDemoState: () => void;
  getBikes: () => BikeProfile[];
  getComponentById: (componentId: string) => BikeComponent | undefined;
  getComponentsForBike: (bikeId: BikeFilterId) => BikeComponent[];
  getHealthByComponentId: (componentId: string) => GearHealthSnapshot["componentHealth"][number] | undefined;
  getOffersSummaryForComponent: (componentId: string) => OfferSummary | undefined;
  getOffersForComponent: (componentId: string) => RetailerOffer[];
  getComponentDetailSnapshot: (componentId: string) => ComponentDetailSnapshot;
}

const DemoStateContext = createContext<DemoStateContextValue | null>(null);

function createBikeId() {
  return crypto.randomUUID();
}

function buildBootstrap(
  state: DemoState,
  seed: FeatureBootstrapData
): FeatureBootstrapData {
  return {
    ...seed,
    state
  };
}

export function DemoStateProvider({
  children,
  initialBootstrap
}: {
  children: React.ReactNode;
  initialBootstrap: FeatureBootstrapData;
}) {
  const [state, setState] = useState<DemoState>(initialBootstrap.state);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadDemoState(initialBootstrap.state));
    setHydrated(true);
  }, [initialBootstrap.state]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    saveDemoState(state);
  }, [hydrated, state]);

  const bootstrap = useMemo(
    () => buildBootstrap(state, initialBootstrap),
    [initialBootstrap, state]
  );
  const snapshot = useMemo(() => buildGearHealthSnapshot(bootstrap), [bootstrap]);
  const landingSnapshot = useMemo(() => buildLandingSnapshot(bootstrap), [bootstrap]);
  const dashboardSnapshot = useMemo(
    () => buildDashboardSnapshot(bootstrap, snapshot.selectedBikeId),
    [bootstrap, snapshot.selectedBikeId]
  );
  const alertsSnapshot = useMemo(
    () => buildAlertsSnapshot(bootstrap, snapshot.selectedBikeId),
    [bootstrap, snapshot.selectedBikeId]
  );

  function connectMockStrava() {
    if (!canConnectStrava(state.stravaMode)) {
      return;
    }

    setState((currentState) => ({
      ...currentState,
      stravaConnected: true
    }));

    trackEvent("strava_connect_success", {
      athleteName: state.athleteName,
      mode: state.stravaMode,
      activityCount: snapshot.activities.length
    });
  }

  function selectBike(bikeId: BikeFilterId) {
    setState((currentState) => ({
      ...currentState,
      selectedBikeId: bikeId
    }));

    trackEvent("bike_filter_changed", {
      bikeId
    });
  }

  function saveBike(bikeProfile: BikeProfile) {
    const normalizedBike = {
      ...bikeProfile,
      id: bikeProfile.id || createBikeId()
    };

    setState((currentState) => {
      const existingBike = currentState.bikes.find(
        (bike) => bike.id === normalizedBike.id
      );
      const nextState = {
        ...currentState,
        bikes: existingBike
          ? currentState.bikes.map((bike) =>
              bike.id === normalizedBike.id ? normalizedBike : bike
            )
          : [...currentState.bikes, normalizedBike]
      };

      saveBikeSetup(nextState);

      if (!existingBike) {
        trackEvent("bike_created", {
          bikeId: normalizedBike.id,
          discipline: normalizedBike.discipline,
          sensitivity: normalizedBike.wearSensitivity
        });
      }

      return nextState;
    });
  }

  function addComponent(component: BikeComponent) {
    setState((currentState) => {
      const serviceEvent: ServiceEvent = {
        id: `service-install-${component.id}`,
        componentId: component.id,
        bikeId: component.bikeId,
        type: "installed",
        date: component.installDate,
        mileageAtService: component.baselineMiles,
        notes: component.notes,
        source: "user"
      };
      const nextState = {
        ...currentState,
        components: [...currentState.components, component],
        serviceEvents: [...currentState.serviceEvents, serviceEvent]
      };

      saveBikeSetup(nextState);
      return nextState;
    });

    trackEvent("component_added", {
      componentId: component.id,
      bikeId: component.bikeId,
      componentType: component.type,
      serviceLifeMiles: component.serviceLifeMiles
    });
  }

  function addStarterKit(bikeId?: string) {
    const targetBikeId =
      bikeId ??
      (snapshot.selectedBikeId !== "all"
        ? snapshot.selectedBikeId
        : snapshot.bikes[0]?.id);

    if (!targetBikeId) {
      return;
    }

    const starterTypes: ComponentType[] = [
      "chain",
      "front-tire",
      "rear-tire",
      "brake-pads",
      "cassette",
      "bar-tape-grips"
    ];

    starterTypes.forEach((type) => {
      const preset = componentPresetMap.get(type);

      if (preset) {
        addComponent(createComponentFromPreset(preset, targetBikeId));
      }
    });
  }

  function updateComponent(component: BikeComponent) {
    setState((currentState) => {
      const nextState = {
        ...currentState,
        components: currentState.components.map((currentComponent) =>
          currentComponent.id === component.id ? component : currentComponent
        )
      };

      saveBikeSetup(nextState);
      return nextState;
    });
  }

  function markComponentReplaced(componentId: string) {
    const healthItem = snapshot.componentHealth.find(
      (item) => item.componentId === componentId
    );

    setState((currentState) =>
      applyComponentReplaced(currentState, {
        componentId,
        mileageAtService: healthItem?.rawMilesSinceInstall ?? 0
      }).state
    );

    void fetch(`/api/projects/cc-component-health/components/${componentId}/replaced`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        componentId,
        mileageAtService: healthItem?.rawMilesSinceInstall ?? 0
      })
    }).catch(() => {});

    trackEvent("component_marked_replaced", {
      componentId,
      bikeId: healthItem?.bikeId ?? null,
      remainingMiles: healthItem?.remainingMiles ?? 0,
      remainingPercent: healthItem?.remainingPercent ?? 0
    });
  }

  function recordAffiliateClick(input: {
    componentId: string;
    retailerId: RetailerOffer["retailerId"];
    offerId: string;
    surface: AffiliateSurface;
    catalogKey?: RetailerOffer["catalogKey"];
    price?: number;
    totalPrice?: number;
  }) {
    setState((currentState) => applyAffiliateClick(currentState, input).state);
    void fetch("/api/projects/cc-component-health/affiliate-clicks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(input)
    }).catch(() => {});
  }

  function resetDemoState() {
    const nextState = {
      ...createSeededDemoState(),
      stravaMode: state.stravaMode
    };

    setState(nextState);
    saveBikeSetup(nextState);

    trackEvent("demo_reset", {
      source: "shell"
    });
  }

  function getBikes() {
    return snapshot.state.bikes;
  }

  function getComponentById(componentId: string) {
    return snapshot.state.components.find((component) => component.id === componentId);
  }

  function getComponentsForBike(bikeId: BikeFilterId) {
    return bikeId === "all"
      ? snapshot.state.components
      : snapshot.state.components.filter((component) => component.bikeId === bikeId);
  }

  function getHealthByComponentId(componentId: string) {
    return snapshot.componentHealth.find((health) => health.componentId === componentId);
  }

  function getOffersSummaryForComponent(componentId: string) {
    return getHealthByComponentId(componentId)?.offerSummary;
  }

  function getOffersForComponent(componentId: string) {
    return getHealthByComponentId(componentId)?.offers ?? [];
  }

  function getComponentDetailSnapshot(componentId: string) {
    return buildComponentDetailSnapshot(bootstrap, componentId);
  }

  const value: DemoStateContextValue = {
    hydrated,
    landingSnapshot,
    dashboardSnapshot,
    alertsSnapshot,
    ...snapshot,
    connectMockStrava,
    selectBike,
    saveBike,
    addComponent,
    addStarterKit,
    updateComponent,
    markComponentReplaced,
    recordAffiliateClick,
    resetDemoState,
    getBikes,
    getComponentById,
    getComponentsForBike,
    getHealthByComponentId,
    getOffersSummaryForComponent,
    getOffersForComponent,
    getComponentDetailSnapshot
  };

  return (
    <DemoStateContext.Provider value={value}>
      {children}
    </DemoStateContext.Provider>
  );
}

export function useDemoState() {
  const context = useContext(DemoStateContext);

  if (!context) {
    throw new Error("useDemoState must be used within DemoStateProvider.");
  }

  return context;
}
