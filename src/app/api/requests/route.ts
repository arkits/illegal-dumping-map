import { NextRequest, NextResponse } from "next/server";
import { fetchDumpingRequests } from "@/lib/socrata";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  const parseIntParam = (v: string | null, fallback: number) => {
    const n = Number.parseInt(v ?? "", 10);
    return Number.isFinite(n) ? n : fallback;
  };
  
  const parseFloatParam = (v: string | null) => {
    const n = Number.parseFloat(v ?? "");
    return Number.isFinite(n) ? n : undefined;
  };

  const yearParam = parseIntParam(searchParams.get("year"), NaN);
  const year = Number.isFinite(yearParam) ? yearParam : undefined;
  
  const limit = Math.min(5000, Math.max(1, parseIntParam(searchParams.get("limit"), 1000)));
  const offset = Math.max(0, parseIntParam(searchParams.get("offset"), 0));
  
  const radiusParam = parseFloatParam(searchParams.get("radius"));
  const radius = radiusParam !== undefined && radiusParam >= 0 ? radiusParam : undefined;
  
  const centerLatParam = parseFloatParam(searchParams.get("centerLat"));
  const centerLat = centerLatParam !== undefined && centerLatParam >= -90 && centerLatParam <= 90 
    ? centerLatParam 
    : undefined;
  
  const centerLonParam = parseFloatParam(searchParams.get("centerLon"));
  const centerLon = centerLonParam !== undefined && centerLonParam >= -180 && centerLonParam <= 180 
    ? centerLonParam 
    : undefined;

  if (limit < 0 || offset < 0) {
    return NextResponse.json(
      { error: "Invalid pagination parameters" },
      { status: 400 }
    );
  }

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
