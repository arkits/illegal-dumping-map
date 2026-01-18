import { NextRequest, NextResponse } from "next/server";
import { fetchDumpingRequests } from "@/lib/socrata";

const getWeekNumberForDate = (date: Date): number => {
  const start = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date.getTime() - start.getTime()) / 86400000);
  return Math.ceil((days + start.getDay() + 1) / 7);
};

const weeksInYear = (year: number): number => {
  return getWeekNumberForDate(new Date(year, 11, 31));
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const yearParam = searchParams.get("year");
  const compareParam = searchParams.get("compareYear");
  const parsedYear = yearParam ? Number.parseInt(yearParam, 10) : NaN;
  const year = Number.isFinite(parsedYear) ? parsedYear : new Date().getFullYear();
  const parsedCompare = compareParam ? Number.parseInt(compareParam, 10) : NaN;
  const compareYear = Number.isFinite(parsedCompare) ? parsedCompare : year - 1;

  try {
    const currentYearRequests = await fetchDumpingRequests({ year, countOnly: true });
    const previousYearRequests = await fetchDumpingRequests({ year: compareYear, countOnly: true });

    const totalRequests = parseInt(currentYearRequests[0]?.id || "0", 10);
    const previousTotal = parseInt(previousYearRequests[0]?.id || "0", 10);
    
    const now = new Date();
    const weeksCurrent =
      year < now.getFullYear() ? weeksInYear(year) : Math.max(1, getWeekNumberForDate(now));
    const weeksPrevious =
      compareYear < now.getFullYear()
        ? weeksInYear(compareYear)
        : Math.max(1, getWeekNumberForDate(now));

    const avgPerWeek = totalRequests / weeksCurrent;
    const previousAvgPerWeek = previousTotal / weeksPrevious;
    const changePercent = previousAvgPerWeek > 0
      ? ((avgPerWeek - previousAvgPerWeek) / previousAvgPerWeek) * 100
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
