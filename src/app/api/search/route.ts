import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  filters: z.array(
    z.object({
      compare: z.union([
        z.literal("equals"),
        z.literal("greaterThan"),
        z.literal("lessThan"),
      ]),
      name: z.union([
        z.literal("a"),
        z.literal("b"),
        z.literal("c"),
        z.literal("d"),
        z.literal("h"),
        z.literal("s"),
        z.literal("t"),
      ]),
      value: z.preprocess(
        (input) => JSON.parse(`${input as string}`),
        z.number(),
      ),
    }),
  ),
});

export type SearchData = z.infer<typeof schema>;

export type SearchError = z.ZodError<SearchData>;

// eslint-disable-next-line @typescript-eslint/require-await
export async function POST(
  request: NextRequest,
): Promise<NextResponse<SearchData | SearchError>> {
  const formData = await request.formData();
  const validatedFields = schema.safeParse({
    filters: JSON.parse(formData.get("filters")?.toString() ?? ""),
  });

  if (!validatedFields.success) {
    return NextResponse.json(validatedFields.error, { status: 500 });
  }

  return NextResponse.json(validatedFields.data, { status: 200 });
}
