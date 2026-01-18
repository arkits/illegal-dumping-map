import { NextRequest, NextResponse } from "next/server";
import { CITIES, CityId } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const cityIdParam = searchParams.get("cityId");
  const cityId = (cityIdParam && cityIdParam in CITIES
    ? cityIdParam
    : "oakland") as CityId;

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  return NextResponse.json({ years, cityId });
}
