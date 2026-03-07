import { NextResponse } from "next/server";

import { setupMutationSchema } from "@/src/features/cc-component-health/schemas/feature";
import { saveBikeSetup } from "@/src/features/cc-component-health/server/mutations/saveBikeSetup";

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

  const result = saveBikeSetup(parsedBody.data.state);

  return NextResponse.json({
    ok: true,
    savedAt: result.savedAt,
    bikes: result.state.bikes.length,
    components: result.state.components.length
  });
}
