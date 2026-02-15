import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { fetchParkingCitations } from "@/lib/parking-citations";
import { getParkingStatsCached, setParkingStatsCached } from "@/lib/cache";

// Type-safe parking city ID validator
const PARKING_CITY_IDS = ["oakland", "sanfrancisco", "losangeles"] as const;
type ValidParkingCityId = typeof PARKING_CITY_IDS[number];

function getParkingCityId(param: string | null): ValidParkingCityId {
  if (param && PARKING_CITY_IDS.includes(param as ValidParkingCityId)) {
    return param as ValidParkingCityId;
  }
  return "oakland";
}

const getWeekNumberForDate = (date: Date): number => {
  const start = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date.getTime() - start.getTime()) / 86400000);
  return Math.ceil((days + start.getDay() + 1) / 7);
};

const weeksInYear = (year: number): number => {
  return getWeekNumberForDate(new Date(year, 11, 31));
};

export async function GET(request: NextRequest) {
  return Sentry.startSpan(
    {
      op: "http.server",
      name: "GET /api/parking/stats",
    },
    async (span) => {
      const searchParams = request.nextUrl.searchParams;

      const cityIdParam = searchParams.get("cityId");
      const cityId = getParkingCityId(cityIdParam);

      const yearParam = searchParams.get("year");
      const compareParam = searchParams.get("compareYear");
      const parsedYear = yearParam ? Number.parseInt(yearParam, 10) : NaN;
      const year = Number.isFinite(parsedYear) ? parsedYear : new Date().getFullYear();
      const parsedCompare = compareParam ? Number.parseInt(compareParam, 10) : NaN;
      const compareYear = Number.isFinite(parsedCompare) ? parsedCompare : year - 1;
      const forceRefresh = searchParams.get("force") === "true";

      span.setAttribute("cityId", cityId);
      span.setAttribute("year", year);
      span.setAttribute("compareYear", compareYear);
      span.setAttribute("forceRefresh", forceRefresh);

      try {
        // Check SQLite cache first (unless forced)
        let cached = null;
        if (!forceRefresh) {
          cached = await Sentry.startSpan(
            {
              op: "cache.query",
              name: "Check SQLite cache",
            },
            async () => {
              return await getParkingStatsCached({
                cityId,
                year,
              });
            }
          );
        }

        if (cached != null) {
          span.setAttribute("cacheHit", true);
          return NextResponse.json(cached, {
            headers: {
              'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
            },
          });
        }

        span.setAttribute("cacheHit", false);

        // Cache miss - fetch from Socrata and compute stats
        // For parking citations, we need to fetch actual data to calculate fine amounts
        const [currentYearCitations, previousYearCitations] = await Promise.all([
          Sentry.startSpan(
            {
              op: "http.client",
              name: `Fetch current year citations from Socrata (${cityId}, ${year})`,
            },
            async () => {
              // Fetch sample for stats calculation (limit to 10000 for performance)
              return await fetchParkingCitations({ cityId, year, limit: 10000 });
            }
          ),
          Sentry.startSpan(
            {
              op: "http.client",
              name: `Fetch previous year citations from Socrata (${cityId}, ${compareYear})`,
            },
            async () => {
              return await fetchParkingCitations({ cityId, year: compareYear, limit: 10000 });
            }
          ),
        ]);

        const totalCitations = currentYearCitations.length;
        const previousTotal = previousYearCitations.length;

        // Calculate fine amounts
        const totalFineAmount = currentYearCitations.reduce((sum, citation) => sum + citation.fineAmount, 0);
        const previousTotalFineAmount = previousYearCitations.reduce((sum, citation) => sum + citation.fineAmount, 0);
        const avgFineAmount = totalCitations > 0 ? totalFineAmount / totalCitations : 0;
        const previousAvgFineAmount = previousTotal > 0 ? previousTotalFineAmount / previousTotal : 0;

        // Calculate top violation types
        const violationCounts: Record<string, number> = {};
        for (const citation of currentYearCitations) {
          const violation = citation.violationDesc || citation.violation || "Unknown";
          violationCounts[violation] = (violationCounts[violation] || 0) + 1;
        }
        const topViolations = Object.entries(violationCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([violation, count]) => ({ violation, count }));

        const now = new Date();
        const weeksCurrent =
          year < now.getFullYear() ? weeksInYear(year) : Math.max(1, getWeekNumberForDate(now));
        const weeksPrevious =
          compareYear < now.getFullYear()
            ? weeksInYear(compareYear)
            : Math.max(1, getWeekNumberForDate(now));

        const avgPerWeek = totalCitations / weeksCurrent;
        const previousAvgPerWeek = previousTotal / weeksPrevious;
        const changePercent = previousAvgPerWeek > 0
          ? ((avgPerWeek - previousAvgPerWeek) / previousAvgPerWeek) * 100
          : 0;

        const statsData = {
          totalCitations,
          totalFineAmount: Math.round(totalFineAmount * 100) / 100,
          avgFineAmount: Math.round(avgFineAmount * 100) / 100,
          avgPerWeek: Math.round(avgPerWeek * 10) / 10,
          previousTotal,
          previousTotalFineAmount: Math.round(previousTotalFineAmount * 100) / 100,
          previousAvgFineAmount: Math.round(previousAvgFineAmount * 100) / 100,
          previousAvgPerWeek: Math.round(previousAvgPerWeek * 10) / 10,
          changePercent: Math.round(changePercent * 10) / 10,
          topViolations,
          year,
          compareYear,
          cityId,
        };

        span.setAttribute("totalCitations", totalCitations);
        span.setAttribute("totalFineAmount", totalFineAmount);
        span.setAttribute("previousTotal", previousTotal);
        span.setAttribute("changePercent", changePercent);

        // Store in SQLite cache
        try {
          await setParkingStatsCached({
            cityId,
            year,
            data: statsData,
          });
        } catch (err) {
          console.error("Failed to cache parking stats in SQLite:", err);
          Sentry.captureException(err);
        }

        return NextResponse.json(statsData);
      } catch (error) {
        console.error("Error fetching parking stats:", error);
        Sentry.captureException(error);
        return NextResponse.json(
          { error: "Failed to fetch parking stats" },
          { status: 500 }
        );
      }
    }
  );
}
