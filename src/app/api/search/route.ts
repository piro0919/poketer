import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const formData = await request.formData();
  const hoge = formData.get("hoge");

  console.log(typeof hoge, hoge);

  return NextResponse.json({}, { status: 200 });
}
