import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { fetchDumpingRequests } from "@/lib/socrata";
import { convexClient, api } from "@/lib/convex-client";

// Type-safe city ID validator that returns the exact literal type
const CITY_IDS = ["oakland", "sanfrancisco", "losangeles", "newyork", "chicago", "seattle", "dallas", "montgomery", "kansascity"] as const;
type ValidCityId = typeof CITY_IDS[number];

function getCityId(param: string | null): ValidCityId {
  if (param && CITY_IDS.includes(param as ValidCityId)) {
    return param as ValidCityId;
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
      name: "GET /api/stats",
    },
    async (span) => {
      const searchParams = request.nextUrl.searchParams;

      const cityIdParam = searchParams.get("cityId");
      const cityId = getCityId(cityIdParam);

      const yearParam = searchParams.get("year");
      const compareParam = searchParams.get("compareYear");
      const parsedYear = yearParam ? Number.parseInt(yearParam, 10) : NaN;
      const year = Number.isFinite(parsedYear) ? parsedYear : new Date().getFullYear();
      const parsedCompare = compareParam ? Number.parseInt(compareParam, 10) : NaN;
      const compareYear = Number.isFinite(parsedCompare) ? parsedCompare : year - 1;

      span.setAttribute("cityId", cityId);
      span.setAttribute("year", year);
      span.setAttribute("compareYear", compareYear);

      try {
        // Check Convex cache first
        const cached = await Sentry.startSpan(
          {
            op: "cache.query",
            name: "Check Convex cache",
          },
          async () => {
            return await convexClient.query(api.stats.getCached, {
              cityId,
              year,
              compareYear,
            });
          }
        );

        if (cached) {
          span.setAttribute("cacheHit", true);
          return NextResponse.json(cached, {
            headers: {
              'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
            },
          });
        }

        span.setAttribute("cacheHit", false);

        // Cache miss - fetch from Socrata and compute stats
        const [currentYearRequests, previousYearRequests] = await Promise.all([
          Sentry.startSpan(
            {
              op: "http.client",
              name: `Fetch current year requests from Socrata (${cityId}, ${year})`,
            },
            async () => {
              return await fetchDumpingRequests({ cityId, year, countOnly: true });
            }
          ),
          Sentry.startSpan(
            {
              op: "http.client",
              name: `Fetch previous year requests from Socrata (${cityId}, ${compareYear})`,
            },
            async () => {
              return await fetchDumpingRequests({ cityId, year: compareYear, countOnly: true });
            }
          ),
        ]);

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

        const statsData = {
          totalRequests,
          avgPerWeek: Math.round(avgPerWeek * 10) / 10,
          previousTotal,
          previousAvgPerWeek: Math.round(previousAvgPerWeek * 10) / 10,
          changePercent: Math.round(changePercent * 10) / 10,
          year,
          compareYear,
          cityId,
        };

        span.setAttribute("totalRequests", totalRequests);
        span.setAttribute("previousTotal", previousTotal);
        span.setAttribute("changePercent", changePercent);

        // Store in Convex cache (fire and forget)
        convexClient
          .mutation(api.stats.setCached, {
            cityId,
            year,
            compareYear,
            data: statsData,
          })
          .catch((err) => {
            console.error("Failed to cache stats in Convex:", err);
            Sentry.captureException(err);
          });

        return NextResponse.json(statsData);
      } catch (error) {
        console.error("Error fetching stats:", error);
        Sentry.captureException(error);
        return NextResponse.json(
          { error: "Failed to fetch stats" },
          { status: 500 }
        );
      }
    }
  );
}
