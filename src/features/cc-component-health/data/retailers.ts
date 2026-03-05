import type { Retailer, RetailerId } from "@/src/features/cc-component-health/types";

export const retailers: Retailer[] = [
  {
    id: "jenson-usa",
    name: "Jenson USA",
    baseUrl: "https://www.jensonusa.com",
    partnerLabel: "Partner retailer",
    shippingPolicySummary: "Free shipping on most orders over $50.",
    logoText: "JU",
    disclosureLabel: "Eligible for partner attribution"
  },
  {
    id: "competitive-cyclist",
    name: "Competitive Cyclist",
    baseUrl: "https://www.competitivecyclist.com",
    partnerLabel: "Partner retailer",
    shippingPolicySummary: "Fast shipping on in-stock components.",
    logoText: "CC",
    disclosureLabel: "Eligible for partner attribution"
  },
  {
    id: "worldwide-cyclery",
    name: "Worldwide Cyclery",
    baseUrl: "https://www.worldwidecyclery.com",
    partnerLabel: "Partner retailer",
    shippingPolicySummary: "Large component inventory with free shipping thresholds.",
    logoText: "WW",
    disclosureLabel: "Eligible for partner attribution"
  },
  {
    id: "trek-bikes",
    name: "Trek Bikes",
    baseUrl: "https://www.trekbikes.com",
    partnerLabel: "Brand partner",
    shippingPolicySummary: "Brand-direct fulfillment where stock is available.",
    logoText: "TR",
    disclosureLabel: "Eligible for partner attribution"
  },
  {
    id: "rei",
    name: "REI",
    baseUrl: "https://www.rei.com",
    partnerLabel: "Marketplace partner",
    shippingPolicySummary: "Member-friendly shipping and returns.",
    logoText: "REI",
    disclosureLabel: "Eligible for partner attribution"
  }
];

export const retailerMap = new Map<RetailerId, Retailer>(
  retailers.map((retailer) => [retailer.id, retailer])
);
