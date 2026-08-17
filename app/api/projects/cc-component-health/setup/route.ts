import { NextResponse } from "next/server";

import { setupMutationSchema } from "@/src/features/cc-component-health/schemas/feature";
import { validateBikeSetup } from "@/src/features/cc-component-health/server/mutations/validateBikeSetup";

/**
 * Stateless validation endpoint. This project has no server-side store, so the
 * posted setup is validated and echoed back; it is never saved. The browser owns
 * the demo state through DemoStateProvider, which persists it to localStorage.
 * Responses carry `persisted: false` so callers cannot mistake this for a write.
 */
export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsedBody = setupMutationSchema.safeParse(json);

  if (!parsedBody.success) {
    return NextResponse.json(
      {
        error: parsedBody.error.flatten()
      },
      { status: 400 }
    );
  }

  const result = validateBikeSetup(parsedBody.data.state);

  return NextResponse.json({
    ok: true,
    persisted: false,
    validatedAt: result.validatedAt,
    bikes: result.state.bikes.length,
    components: result.state.components.length
  });
}
