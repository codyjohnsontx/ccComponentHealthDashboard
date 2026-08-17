import { NextResponse } from "next/server";

import { getMockFeatureBootstrap } from "@/src/features/cc-component-health/adapters/mock/bootstrap";
import { affiliateClickRequestSchema } from "@/src/features/cc-component-health/schemas/feature";
import { recordAffiliateClick } from "@/src/features/cc-component-health/server/mutations/recordAffiliateClick";

/**
 * Stateless validation endpoint. This project has no server-side store, so the
 * click is validated and the event it would produce is echoed back; nothing is
 * recorded here. The browser owns the demo state through DemoStateProvider,
 * which applies the same reducer and persists it to localStorage. Responses
 * carry `persisted: false` so callers cannot mistake this for a write.
 */
export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsedBody = affiliateClickRequestSchema.safeParse(json);

  if (!parsedBody.success) {
    return NextResponse.json(
      {
        error: parsedBody.error.flatten()
      },
      { status: 400 }
    );
  }

  const result = recordAffiliateClick(getMockFeatureBootstrap().state, parsedBody.data);

  return NextResponse.json({
    ok: true,
    persisted: false,
    event: result.event
  });
}
