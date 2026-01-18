import { NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  return NextResponse.json({ years });
}
