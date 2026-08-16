import { NextResponse } from "next/server";

import { getMockFeatureBootstrap } from "@/src/features/cc-component-health/adapters/mock/bootstrap";
import { markComponentReplacedRequestSchema } from "@/src/features/cc-component-health/schemas/feature";
import { markComponentReplaced } from "@/src/features/cc-component-health/server/mutations/markComponentReplaced";

/**
 * Stateless validation endpoint. This project has no server-side store, so the
 * replacement is validated and the service event it would produce is echoed
 * back; nothing is saved. The browser owns the demo state through
 * DemoStateProvider, which applies the same reducer and persists it to
 * localStorage. Responses carry `persisted: false` so callers cannot mistake
 * this for a write.
 */
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

  const state = getMockFeatureBootstrap().state;

  if (!state.components.some((component) => component.id === parsedBody.data.componentId)) {
    return NextResponse.json(
      {
        error: { message: `Component not found: ${parsedBody.data.componentId}` }
      },
      { status: 404 }
    );
  }

  const result = markComponentReplaced(state, parsedBody.data);

  return NextResponse.json({
    ok: true,
    persisted: false,
    serviceEvent: result.serviceEvent
  });
}
