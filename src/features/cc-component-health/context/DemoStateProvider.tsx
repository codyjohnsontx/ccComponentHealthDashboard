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
import { mockActivities } from "@/src/features/cc-component-health/data/mockActivities";
import { buildAlerts } from "@/src/features/cc-component-health/lib/alerts";
import { createDefaultDemoState, loadDemoState, saveDemoState } from "@/src/features/cc-component-health/lib/storage";
import { calculateAllComponentHealth } from "@/src/features/cc-component-health/lib/wear";
import type {
  BikeComponent,
  BikeProfile,
  ComponentHealth,
  ComponentType,
  ComponentPreset,
  DemoState,
  HealthAlert
} from "@/src/features/cc-component-health/types";

type DerivedComponentHealth = ComponentHealth & {
  component: BikeComponent;
  componentLabel: string;
  preset?: ComponentPreset;
};

interface DemoStateContextValue {
  hydrated: boolean;
  state: DemoState;
  activities: typeof mockActivities;
  totalRideMiles: number;
  componentHealth: DerivedComponentHealth[];
  alerts: HealthAlert[];
  isSetupComplete: boolean;
  connectMockStrava: () => void;
  saveBike: (bikeProfile: BikeProfile) => void;
  addComponent: (component: BikeComponent) => void;
  addStarterKit: () => void;
  updateComponent: (component: BikeComponent) => void;
  markComponentReplaced: (componentId: string) => void;
  getComponentById: (componentId: string) => BikeComponent | undefined;
  getHealthByComponentId: (componentId: string) => DerivedComponentHealth | undefined;
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

  const totalRideMiles = useMemo(
    () =>
      mockActivities.reduce((total, activity) => total + activity.distanceMiles, 0),
    []
  );

  const sensitivity = state.bike?.wearSensitivity ?? "normal";

  const componentHealth = useMemo<DerivedComponentHealth[]>(
    () =>
      calculateAllComponentHealth(state.components, mockActivities, sensitivity).map(
        (health) => {
          const component = state.components.find(
            (item) => item.id === health.componentId
          );

          return {
            ...health,
            component: component!,
            componentLabel: component?.label ?? "Component",
            preset: component ? componentPresetMap.get(component.type) : undefined
          };
        }
      ),
    [sensitivity, state.components]
  );

  const alerts = useMemo(
    () => buildAlerts(componentHealth),
    [componentHealth]
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

  function saveBike(bikeProfile: BikeProfile) {
    const normalizedBike = {
      ...bikeProfile,
      id: bikeProfile.id || createBikeId()
    };

    setState((currentState) => {
      const isNewBike = !currentState.bike;

      if (isNewBike) {
        trackEvent("bike_created", {
          bikeId: normalizedBike.id,
          discipline: normalizedBike.discipline,
          sensitivity: normalizedBike.wearSensitivity
        });
      }

      return {
        ...currentState,
        bike: normalizedBike
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
      componentType: component.type,
      serviceLifeMiles: component.serviceLifeMiles
    });
  }

  function addStarterKit() {
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
      return preset ? [createComponentFromPreset(preset)] : [];
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
      remainingMiles: healthItem?.remainingMiles ?? 0,
      remainingPercent: healthItem?.remainingPercent ?? 0
    });
  }

  function getComponentById(componentId: string) {
    return state.components.find((component) => component.id === componentId);
  }

  function getHealthByComponentId(componentId: string) {
    return componentHealth.find((health) => health.componentId === componentId);
  }

  const value = useMemo<DemoStateContextValue>(
    () => ({
      hydrated,
      state,
      activities: mockActivities,
      totalRideMiles,
      componentHealth,
      alerts,
      isSetupComplete: Boolean(state.bike && state.components.length > 0),
      connectMockStrava,
      saveBike,
      addComponent,
      addStarterKit,
      updateComponent,
      markComponentReplaced,
      getComponentById,
      getHealthByComponentId
    }),
    [alerts, componentHealth, hydrated, state, totalRideMiles]
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
