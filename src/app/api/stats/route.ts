import { NextRequest, NextResponse } from "next/server";
import { fetchAllRequestsForYear, fetchDumpingRequests } from "@/lib/socrata";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const year = searchParams.get("year") ? parseInt(searchParams.get("year")!) : new Date().getFullYear();
  const compareYear = searchParams.get("compareYear") ? parseInt(searchParams.get("compareYear")!) : year - 1;

  try {
    const currentYearRequests = await fetchDumpingRequests({ year, limit: 100000 });
    const previousYearRequests = await fetchDumpingRequests({ year: compareYear, limit: 100000 });

    const totalRequests = currentYearRequests.length;
    const previousTotal = previousYearRequests.length;
    const avgPerWeek = totalRequests / 52;
    const previousAvgPerWeek = previousTotal / 52;
    const changePercent = previousTotal > 0 
      ? ((totalRequests - previousTotal) / previousTotal) * 100 
      : 0;

    return NextResponse.json({
      totalRequests,
      avgPerWeek: Math.round(avgPerWeek * 10) / 10,
      previousTotal,
      previousAvgPerWeek: Math.round(previousAvgPerWeek * 10) / 10,
      changePercent: Math.round(changePercent * 10) / 10,
      year,
      compareYear,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
