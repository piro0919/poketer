import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  attackType: z.preprocess(
    (input) => JSON.parse(`${input as string}`),
    z.boolean(),
  ),
});

export type FilterData = z.infer<typeof schema>;

export type FilterError = z.ZodError<FilterData>;

export async function POST(
  request: NextRequest,
): Promise<NextResponse<FilterData | FilterError>> {
  const formData = await request.formData();
  const validatedFields = schema.safeParse({
    attackType: formData.get("attackType"),
  });

  if (!validatedFields.success) {
    return NextResponse.json(validatedFields.error, { status: 500 });
  }

  return NextResponse.json(validatedFields.data, { status: 200 });
}
