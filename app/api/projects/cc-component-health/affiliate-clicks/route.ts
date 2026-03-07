import { NextResponse } from "next/server";

import { getMockFeatureBootstrap } from "@/src/features/cc-component-health/adapters/mock/bootstrap";
import { affiliateClickRequestSchema } from "@/src/features/cc-component-health/schemas/feature";
import { recordAffiliateClick } from "@/src/features/cc-component-health/server/mutations/recordAffiliateClick";

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
    event: result.event
  });
}
