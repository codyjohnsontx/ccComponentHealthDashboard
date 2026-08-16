import { demoStateSchema } from "@/src/features/cc-component-health/schemas/feature";
import type { DemoState, ServiceEvent } from "@/src/features/cc-component-health/types";

export interface MarkComponentReplacedInput {
  componentId: string;
  date?: string;
  mileageAtService: number;
  notes?: string;
}

function createEventId(componentId: string, date: string) {
  // A component can be replaced more than once on the same day, so the date
  // alone is not unique enough to key the service history by.
  return `service-${componentId}-${date}-${crypto.randomUUID()}`;
}

/**
 * Builds the replacement event without the `bikeId`, which only the state that
 * owns the component can resolve.
 */
export function buildReplacementServiceEvent(
  input: MarkComponentReplacedInput
): Omit<ServiceEvent, "bikeId"> {
  const date = input.date ?? new Date().toISOString().slice(0, 10);

  return {
    id: createEventId(input.componentId, date),
    componentId: input.componentId,
    type: "replaced",
    date,
    mileageAtService: input.mileageAtService,
    notes: input.notes,
    source: "user"
  };
}

export function markComponentReplaced(state: DemoState, input: MarkComponentReplacedInput) {
  const component = state.components.find((item) => item.id === input.componentId);

  if (!component) {
    throw new Error(`Component not found: ${input.componentId}`);
  }

  const serviceEvent: ServiceEvent = {
    ...buildReplacementServiceEvent(input),
    bikeId: component.bikeId
  };

  const nextState = demoStateSchema.parse({
    ...state,
    components: state.components.map((component) =>
      component.id === input.componentId
        ? {
            ...component,
            installDate: serviceEvent.date,
            baselineMiles: 0,
            replacementCount: component.replacementCount + 1
          }
        : component
    ),
    serviceEvents: [...state.serviceEvents, serviceEvent]
  });

  return {
    state: nextState,
    serviceEvent
  };
}
