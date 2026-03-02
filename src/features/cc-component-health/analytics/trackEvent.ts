export function trackEvent(
  name: string,
  payload?: Record<string, string | number | boolean | null | undefined>
) {
  console.log("[analytics]", name, payload ?? {});
}
