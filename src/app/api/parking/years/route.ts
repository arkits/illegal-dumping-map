import { NextRequest, NextResponse } from "next/server";
import { PARKING_CITIES, ParkingCityId } from "@/lib/parking-citations";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const cityIdParam = searchParams.get("cityId");
  const cityId = (cityIdParam && cityIdParam in PARKING_CITIES
    ? cityIdParam
    : "oakland") as ParkingCityId;

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  return NextResponse.json({ years, cityId });
}
