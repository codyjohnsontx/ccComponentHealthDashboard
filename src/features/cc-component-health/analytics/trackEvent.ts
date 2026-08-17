import { getAnalyticsPort } from "@/src/features/cc-component-health/analytics/port";

export function trackEvent(
  name: string,
  payload?: Record<string, string | number | boolean | null | undefined>
) {
  getAnalyticsPort().track(name, payload);
}
