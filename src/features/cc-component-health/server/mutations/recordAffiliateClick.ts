import { demoStateSchema } from "@/src/features/cc-component-health/schemas/feature";
import type { AffiliateClickEvent, DemoState } from "@/src/features/cc-component-health/types";

export function recordAffiliateClick(
  state: DemoState,
  input: Omit<AffiliateClickEvent, "id" | "clickedAt">
) {
  const event: AffiliateClickEvent = {
    id: `affiliate-${input.offerId}-${Date.now()}`,
    clickedAt: new Date().toISOString(),
    ...input
  };

  return {
    state: demoStateSchema.parse({
      ...state,
      affiliateClicks: [...state.affiliateClicks, event]
    }),
    event
  };
}
