export type AnalyticsPayload = Record<
  string,
  string | number | boolean | null | undefined
>;

export interface AnalyticsPort {
  track: (name: string, payload?: AnalyticsPayload) => void;
}

const consoleAnalyticsPort: AnalyticsPort = {
  track(name, payload) {
    console.log("[analytics]", name, payload ?? {});
  }
};

export function getAnalyticsPort(): AnalyticsPort {
  return consoleAnalyticsPort;
}
