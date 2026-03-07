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
    expect(body.serviceEvent.componentId).toBe("component-road-chain");
  });
});
