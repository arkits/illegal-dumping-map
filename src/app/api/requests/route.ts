import { NextRequest, NextResponse } from "next/server";
import { fetchDumpingRequests } from "@/lib/socrata";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const year = searchParams.get("year") ? parseInt(searchParams.get("year")!) : undefined;
  const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 1000;
  const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!) : 0;
  const radius = searchParams.get("radius") ? parseFloat(searchParams.get("radius")!) : undefined;
  const centerLat = searchParams.get("centerLat") ? parseFloat(searchParams.get("centerLat")!) : undefined;
  const centerLon = searchParams.get("centerLon") ? parseFloat(searchParams.get("centerLon")!) : undefined;

  try {
    const requests = await fetchDumpingRequests({
      year,
      limit,
      offset,
      radius,
      centerLat,
      centerLon,
    });

    return NextResponse.json({ requests, count: requests.length });
  } catch (error) {
    console.error("Error fetching requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch requests" },
      { status: 500 }
    );
  }
}
