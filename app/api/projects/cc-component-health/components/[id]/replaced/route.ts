import { NextResponse } from "next/server";

import { getMockFeatureBootstrap } from "@/src/features/cc-component-health/adapters/mock/bootstrap";
import { markComponentReplacedRequestSchema } from "@/src/features/cc-component-health/schemas/feature";
import { markComponentReplaced } from "@/src/features/cc-component-health/server/mutations/markComponentReplaced";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const json = await request.json().catch(() => null);
  const parsedBody = markComponentReplacedRequestSchema.safeParse({
    ...json,
    componentId: params.id
  });

  if (!parsedBody.success) {
    return NextResponse.json(
      {
        error: parsedBody.error.flatten()
      },
      { status: 400 }
    );
  }

  const result = markComponentReplaced(getMockFeatureBootstrap().state, parsedBody.data);

  return NextResponse.json({
    ok: true,
    serviceEvent: result.serviceEvent
  });
}
