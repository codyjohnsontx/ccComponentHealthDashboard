import { describe, expect, it } from "vitest";

import { GET as getOffers } from "@/app/api/projects/cc-component-health/offers/route";
import { POST as postAffiliateClick } from "@/app/api/projects/cc-component-health/affiliate-clicks/route";
import { POST as postReplacement } from "@/app/api/projects/cc-component-health/components/[id]/replaced/route";

describe("feature routes", () => {
  it("rejects invalid offer queries", async () => {
    const response = await getOffers(
      new Request("http://localhost/api/projects/cc-component-health/offers")
    );

    expect(response.status).toBe(400);
  });

  it("records affiliate clicks with validated payloads", async () => {
    const response = await postAffiliateClick(
      new Request("http://localhost/api/projects/cc-component-health/affiliate-clicks", {
        method: "POST",
        body: JSON.stringify({
          componentId: "component-road-chain",
          retailerId: "jenson-usa",
          offerId: "offer-road-chain-jenson",
          surface: "detail"
        }),
        headers: {
          "Content-Type": "application/json"
        }
      })
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.persisted).toBe(false);
  });

  it("returns 404 when componentId matches nothing and no catalogKey is given", async () => {
    const response = await getOffers(
      new Request(
        "http://localhost/api/projects/cc-component-health/offers?componentId=component-does-not-exist"
      )
    );

    expect(response.status).toBe(404);
  });

  it("falls back to the catalog key when the component is unknown", async () => {
    const response = await getOffers(
      new Request(
        "http://localhost/api/projects/cc-component-health/offers?componentId=component-does-not-exist&catalogKey=road-chain"
      )
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.offers.length).toBeGreaterThan(0);
  });

  it("validates a component the seeded bootstrap has never heard of", async () => {
    const clientCreatedId = "3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d";
    const response = await postReplacement(
      new Request(
        `http://localhost/api/projects/cc-component-health/components/${clientCreatedId}/replaced`,
        {
          method: "POST",
          body: JSON.stringify({ mileageAtService: 100 }),
          headers: {
            "Content-Type": "application/json"
          }
        }
      ),
      {
        params: Promise.resolve({
          id: clientCreatedId
        })
      }
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.persisted).toBe(false);
    expect(body.serviceEvent.componentId).toBe(clientCreatedId);
    expect(body.serviceEvent.mileageAtService).toBe(100);
    expect(body.serviceEvent.bikeId).toBeUndefined();
  });

  it("rejects a replacement payload that fails validation", async () => {
    const response = await postReplacement(
      new Request(
        "http://localhost/api/projects/cc-component-health/components/component-road-chain/replaced",
        {
          method: "POST",
          body: JSON.stringify({ mileageAtService: -1 }),
          headers: {
            "Content-Type": "application/json"
          }
        }
      ),
      {
        params: Promise.resolve({
          id: "component-road-chain"
        })
      }
    );

    expect(response.status).toBe(400);
  });

  it("records component replacement payloads", async () => {
    const response = await postReplacement(
      new Request(
        "http://localhost/api/projects/cc-component-health/components/component-road-chain/replaced",
        {
          method: "POST",
          body: JSON.stringify({
            mileageAtService: 2034
          }),
          headers: {
            "Content-Type": "application/json"
          }
        }
      ),
      {
        params: Promise.resolve({
          id: "component-road-chain"
        })
      }
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.persisted).toBe(false);
    expect(body.serviceEvent.componentId).toBe("component-road-chain");
  });
});
