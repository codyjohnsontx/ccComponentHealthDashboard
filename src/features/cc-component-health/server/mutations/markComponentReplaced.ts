import { demoStateSchema } from "@/src/features/cc-component-health/schemas/feature";
import type { DemoState, ServiceEvent } from "@/src/features/cc-component-health/types";

function createEventId(componentId: string, date: string) {
  // A component can be replaced more than once on the same day, so the date
  // alone is not unique enough to key the service history by.
  return `service-${componentId}-${date}-${crypto.randomUUID()}`;
}

export function markComponentReplaced(
  state: DemoState,
  input: {
    componentId: string;
    date?: string;
    mileageAtService: number;
    notes?: string;
  }
) {
  const component = state.components.find((item) => item.id === input.componentId);

  if (!component) {
    throw new Error(`Component not found: ${input.componentId}`);
  }

  const date = input.date ?? new Date().toISOString().slice(0, 10);
  const serviceEvent: ServiceEvent = {
    id: createEventId(input.componentId, date),
    componentId: input.componentId,
    bikeId: component.bikeId,
    type: "replaced",
    date,
    mileageAtService: input.mileageAtService,
    notes: input.notes,
    source: "user"
  };

  const nextState = demoStateSchema.parse({
    ...state,
    components: state.components.map((component) =>
      component.id === input.componentId
        ? {
            ...component,
            installDate: date,
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
