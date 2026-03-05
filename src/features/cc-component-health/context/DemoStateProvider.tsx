"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

import { trackEvent } from "@/src/features/cc-component-health/analytics/trackEvent";
import { canConnectStrava } from "@/src/features/cc-component-health/config/strava";
import {
  componentPresetMap,
  createComponentFromPreset
} from "@/src/features/cc-component-health/data/componentPresets";
import { createSeededDemoState } from "@/src/features/cc-component-health/data/demoSeed";
import { mockActivities } from "@/src/features/cc-component-health/data/mockActivities";
import { buildAlerts } from "@/src/features/cc-component-health/lib/alerts";
import {
  buildOfferSummary,
  getBestPriceOffer,
  getLowestDeliveredOffer,
  getOffersForCatalogKey,
  rankRetailerOffers,
  resolveComponentCatalogKey
} from "@/src/features/cc-component-health/lib/offers";
import {
  createDefaultDemoState,
  loadDemoState,
  saveDemoState
} from "@/src/features/cc-component-health/lib/storage";
import { calculateAllComponentHealth } from "@/src/features/cc-component-health/lib/wear";
import type {
  BikeComponent,
  BikeFilterId,
  BikeProfile,
  ComponentHealth,
  ComponentPreset,
  ComponentType,
  DemoState,
  HealthAlert,
  OfferSummary,
  RetailerOffer,
  WearSensitivity
} from "@/src/features/cc-component-health/types";

type DerivedComponentHealth = ComponentHealth & {
  component: BikeComponent;
  componentLabel: string;
  bike?: BikeProfile;
  bikeName: string;
  preset?: ComponentPreset;
  catalogKey: ReturnType<typeof resolveComponentCatalogKey>;
  offers: RetailerOffer[];
  offerSummary: OfferSummary;
  bestPriceOffer: RetailerOffer | null;
  lowestDeliveredOffer: RetailerOffer | null;
};

type RideStats = {
  count: number;
  miles: number;
};

interface DemoStateContextValue {
  hydrated: boolean;
  state: DemoState;
  activities: typeof mockActivities;
  bikes: BikeProfile[];
  selectedBikeId: BikeFilterId;
  totalRideMiles: number;
  rideStatsByBike: Record<string, RideStats>;
  componentHealth: DerivedComponentHealth[];
  filteredComponentHealth: DerivedComponentHealth[];
  alerts: HealthAlert[];
  filteredAlerts: HealthAlert[];
  isSetupComplete: boolean;
  connectMockStrava: () => void;
  selectBike: (bikeId: BikeFilterId) => void;
  saveBike: (bikeProfile: BikeProfile) => void;
  addComponent: (component: BikeComponent) => void;
  addStarterKit: (bikeId?: string) => void;
  updateComponent: (component: BikeComponent) => void;
  markComponentReplaced: (componentId: string) => void;
  resetDemoState: () => void;
  getBikes: () => BikeProfile[];
  getComponentById: (componentId: string) => BikeComponent | undefined;
  getComponentsForBike: (bikeId: BikeFilterId) => BikeComponent[];
  getHealthByComponentId: (componentId: string) => DerivedComponentHealth | undefined;
  getOffersSummaryForComponent: (componentId: string) => OfferSummary | undefined;
  getOffersForComponent: (componentId: string) => RetailerOffer[];
}

const DemoStateContext = createContext<DemoStateContextValue | null>(null);

function createBikeId() {
  return crypto.randomUUID();
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function DemoStateProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<DemoState>(createDefaultDemoState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadDemoState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    saveDemoState(state);
  }, [hydrated, state]);

  const bikes = state.bikes;
  const selectedBikeId = state.selectedBikeId;

  const bikeMap = useMemo(
    () => new Map(bikes.map((bike) => [bike.id, bike])),
    [bikes]
  );

  const bikeSensitivityById = useMemo<Partial<Record<string, WearSensitivity>>>(
    () =>
      bikes.reduce<Partial<Record<string, WearSensitivity>>>((result, bike) => {
        result[bike.id] = bike.wearSensitivity;
        return result;
      }, {}),
    [bikes]
  );

  const totalRideMiles = useMemo(
    () =>
      mockActivities.reduce((total, activity) => total + activity.distanceMiles, 0),
    []
  );

  const rideStatsByBike = useMemo<Record<string, RideStats>>(
    () =>
      mockActivities.reduce<Record<string, RideStats>>((result, activity) => {
        const current = result[activity.bikeId] ?? { count: 0, miles: 0 };

        result[activity.bikeId] = {
          count: current.count + 1,
          miles: current.miles + activity.distanceMiles
        };

        return result;
      }, {}),
    []
  );

  const componentHealth = useMemo<DerivedComponentHealth[]>(
    () =>
      calculateAllComponentHealth(
        state.components,
        mockActivities,
        "normal",
        bikeSensitivityById
      ).map((health) => {
        const component = state.components.find(
          (item) => item.id === health.componentId
        );
        const bike = component ? bikeMap.get(component.bikeId) : undefined;
        const preset = component ? componentPresetMap.get(component.type) : undefined;
        const catalogKey = component ? resolveComponentCatalogKey(component) : "road-chain";
        const offers = rankRetailerOffers(getOffersForCatalogKey(catalogKey));

        return {
          ...health,
          component: component!,
          componentLabel: component?.label ?? "Component",
          bike,
          bikeName: bike?.name ?? "Bike",
          preset,
          catalogKey,
          offers,
          offerSummary: buildOfferSummary(offers),
          bestPriceOffer: getBestPriceOffer(offers),
          lowestDeliveredOffer: getLowestDeliveredOffer(offers)
        };
      }),
    [bikeMap, bikeSensitivityById, state.components]
  );

  const filteredComponentHealth = useMemo(
    () =>
      selectedBikeId === "all"
        ? componentHealth
        : componentHealth.filter((item) => item.bikeId === selectedBikeId),
    [componentHealth, selectedBikeId]
  );

  const alerts = useMemo(
    () =>
      buildAlerts(
        componentHealth.map((item) => ({
          ...item,
          bikeId: item.bikeId,
          bikeName: item.bikeName
        }))
      ).map((alert) => {
        const healthItem = componentHealth.find(
          (item) => item.componentId === alert.componentId
        );

        return {
          ...alert,
          catalogKey: healthItem?.catalogKey,
          bestPriceStartingAt: healthItem?.bestPriceOffer?.price,
          retailerCount: healthItem?.offerSummary.retailerCount ?? 0
        };
      }),
    [componentHealth]
  );

  const filteredAlerts = useMemo(
    () =>
      selectedBikeId === "all"
        ? alerts
        : alerts.filter((alert) => alert.bikeId === selectedBikeId),
    [alerts, selectedBikeId]
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
      activityCount: mockActivities.length
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

      if (!existingBike) {
        trackEvent("bike_created", {
          bikeId: normalizedBike.id,
          discipline: normalizedBike.discipline,
          sensitivity: normalizedBike.wearSensitivity
        });
      }

      return {
        ...currentState,
        bikes: existingBike
          ? currentState.bikes.map((bike) =>
              bike.id === normalizedBike.id ? normalizedBike : bike
            )
          : [...currentState.bikes, normalizedBike]
      };
    });
  }

  function addComponent(component: BikeComponent) {
    setState((currentState) => ({
      ...currentState,
      components: [...currentState.components, component]
    }));

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
      (selectedBikeId !== "all" ? selectedBikeId : state.bikes[0]?.id);

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
    const starterKit = starterTypes.flatMap((type) => {
      const preset = componentPresetMap.get(type);
      return preset ? [createComponentFromPreset(preset, targetBikeId)] : [];
    });

    starterKit.forEach((component) => addComponent(component));
  }

  function updateComponent(component: BikeComponent) {
    setState((currentState) => ({
      ...currentState,
      components: currentState.components.map((currentComponent) =>
        currentComponent.id === component.id ? component : currentComponent
      )
    }));
  }

  function markComponentReplaced(componentId: string) {
    const healthItem = componentHealth.find((item) => item.componentId === componentId);

    setState((currentState) => ({
      ...currentState,
      components: currentState.components.map((component) =>
        component.id === componentId
          ? {
              ...component,
              installDate: todayIso(),
              baselineMiles: 0,
              replacementCount: component.replacementCount + 1
            }
          : component
      )
    }));

    trackEvent("component_marked_replaced", {
      componentId,
      bikeId: healthItem?.bikeId ?? null,
      remainingMiles: healthItem?.remainingMiles ?? 0,
      remainingPercent: healthItem?.remainingPercent ?? 0
    });
  }

  function resetDemoState() {
    setState({
      ...createSeededDemoState(),
      stravaMode: state.stravaMode
    });

    trackEvent("demo_reset", {
      source: "shell"
    });
  }

  function getBikes() {
    return state.bikes;
  }

  function getComponentById(componentId: string) {
    return state.components.find((component) => component.id === componentId);
  }

  function getComponentsForBike(bikeId: BikeFilterId) {
    return bikeId === "all"
      ? state.components
      : state.components.filter((component) => component.bikeId === bikeId);
  }

  function getHealthByComponentId(componentId: string) {
    return componentHealth.find((health) => health.componentId === componentId);
  }

  function getOffersSummaryForComponent(componentId: string) {
    return getHealthByComponentId(componentId)?.offerSummary;
  }

  function getOffersForComponent(componentId: string) {
    return getHealthByComponentId(componentId)?.offers ?? [];
  }

  const value = useMemo<DemoStateContextValue>(
    () => ({
      hydrated,
      state,
      activities: mockActivities,
      bikes,
      selectedBikeId,
      totalRideMiles,
      rideStatsByBike,
      componentHealth,
      filteredComponentHealth,
      alerts,
      filteredAlerts,
      isSetupComplete: Boolean(state.bikes.length > 0 && state.components.length > 0),
      connectMockStrava,
      selectBike,
      saveBike,
      addComponent,
      addStarterKit,
      updateComponent,
      markComponentReplaced,
      resetDemoState,
      getBikes,
      getComponentById,
      getComponentsForBike,
      getHealthByComponentId,
      getOffersSummaryForComponent,
      getOffersForComponent
    }),
    [
      alerts,
      bikes,
      componentHealth,
      filteredAlerts,
      filteredComponentHealth,
      hydrated,
      rideStatsByBike,
      selectedBikeId,
      state,
      totalRideMiles
    ]
  );

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
