export function formatMiles(value: number): string {
  return `${Math.round(value).toLocaleString()} mi`;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

export function formatDateTime(value: string | null): string {
  if (!value) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

export function formatOfferFreshness(value: "fresh" | "aging" | "stale"): string {
  switch (value) {
    case "fresh":
      return "Fresh";
    case "aging":
      return "Aging";
    case "stale":
    default:
      return "Stale";
  }
}

export function formatMatchConfidence(
  value: "exact" | "high" | "medium" | "low"
): string {
  switch (value) {
    case "exact":
      return "Exact fit";
    case "high":
      return "High fit";
    case "medium":
      return "Review fit";
    case "low":
    default:
      return "Low fit";
  }
}
