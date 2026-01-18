import { NextRequest, NextResponse } from "next/server";
import { fetchDumpingRequests } from "@/lib/socrata";
import { getWeekNumber } from "@/lib/utils";

interface WeeklyData {
  week: number;
  year: number;
  count: number;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const currentYear = new Date().getFullYear();
  const yearsParam = searchParams.get("years");
  const parsedYears = yearsParam
    ? yearsParam
        .split(",")
        .map((y) => Number.parseInt(y.trim(), 10))
        .filter(Number.isFinite)
    : [];
  const years = parsedYears.length > 0 ? parsedYears : [currentYear, currentYear - 1];

  try {
    const allWeeklyData: WeeklyData[] = [];

    for (const year of years) {
      const requests = await fetchDumpingRequests({ year, limit: 100000 });
      
      const weeklyCounts: Record<number, number> = {};
      for (let i = 1; i <= 53; i++) {
        weeklyCounts[i] = 0;
      }

      for (const req of requests) {
        const dateStr = req.datetimeinit.split("T")[0];
        const [yearStr, monthStr, dayStr] = dateStr.split("-");
        const date = new Date(parseInt(yearStr), parseInt(monthStr) - 1, parseInt(dayStr));
        const week = getWeekNumber(date);
        if (week >= 1 && week <= 53) {
          weeklyCounts[week]++;
        }
      }

      for (const [week, count] of Object.entries(weeklyCounts)) {
        allWeeklyData.push({
          week: parseInt(week),
          year,
          count,
        });
      }
    }

    return NextResponse.json({ weeklyData: allWeeklyData });
  } catch (error) {
    console.error("Error fetching weekly data:", error);
    return NextResponse.json(
      { error: "Failed to fetch weekly data" },
      { status: 500 }
    );
  }
}
