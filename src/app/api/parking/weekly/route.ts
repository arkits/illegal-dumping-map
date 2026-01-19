import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { fetchParkingCitations } from "@/lib/parking-citations";
import { getWeekNumber } from "@/lib/utils";
import { convexClient, api } from "@/lib/convex-client";

// Type-safe parking city ID validator
const PARKING_CITY_IDS = ["oakland", "sanfrancisco", "losangeles"] as const;
type ValidParkingCityId = typeof PARKING_CITY_IDS[number];

function getParkingCityId(param: string | null): ValidParkingCityId {
  if (param && PARKING_CITY_IDS.includes(param as ValidParkingCityId)) {
    return param as ValidParkingCityId;
  }
  return "oakland";
}

interface WeeklyData {
  week: number;
  year: number;
  count: number;
}

export async function GET(request: NextRequest) {
  return Sentry.startSpan(
    {
      op: "http.server",
      name: "GET /api/parking/weekly",
    },
    async (span) => {
      const searchParams = request.nextUrl.searchParams;
      const currentYear = new Date().getFullYear();

      const cityIdParam = searchParams.get("cityId");
      const cityId = getParkingCityId(cityIdParam);

      const yearsParam = searchParams.get("years");
      const allYearsParam = searchParams.get("all");

      let years: number[];

      if (allYearsParam === "true") {
        years = Array.from({ length: 10 }, (_, i) => currentYear - i);
      } else if (yearsParam) {
        const parsedYears = yearsParam
          .split(",")
          .map((y) => Number.parseInt(y.trim(), 10))
          .filter(Number.isFinite);
        years = parsedYears.length > 0 ? parsedYears : [currentYear, currentYear - 1];
      } else {
        years = [currentYear, currentYear - 1];
      }

      span.setAttribute("cityId", cityId);
      span.setAttribute("years", years.join(","));
      span.setAttribute("yearCount", years.length);

      try {
        // Check Convex cache first
        const cached = await Sentry.startSpan(
          {
            op: "cache.query",
            name: "Check Convex cache",
          },
          async () => {
            return await convexClient.query(api.parking.getWeeklyCached, {
              cityId,
              years,
            });
          }
        );

        if (cached) {
          span.setAttribute("cacheHit", true);
          return NextResponse.json({ weeklyData: cached, cityId }, {
            headers: {
              'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
            },
          });
        }

        span.setAttribute("cacheHit", false);

        const allWeeklyData: WeeklyData[] = [];

        const weeklyDataResults = await Promise.all(
          years.map(async (year) => {
            const citations = await Sentry.startSpan(
              {
                op: "http.client",
                name: `Fetch parking citations from Socrata (${cityId}, ${year})`,
              },
              async (yearSpan) => {
                yearSpan.setAttribute("year", year);
                return await fetchParkingCitations({ cityId, year, limit: 100000 });
              }
            );

            const weeklyCounts: Record<number, number> = {};
            for (let i = 1; i <= 53; i++) {
              weeklyCounts[i] = 0;
            }

            for (const citation of citations) {
              const dateStr = citation.issueDate.split("T")[0];
              const [yearStr, monthStr, dayStr] = dateStr.split("-");
              const date = new Date(parseInt(yearStr), parseInt(monthStr) - 1, parseInt(dayStr));
              const week = getWeekNumber(date);
              if (week >= 1 && week <= 53) {
                weeklyCounts[week]++;
              }
            }

            return Object.entries(weeklyCounts).map(([week, count]) => ({
              week: parseInt(week),
              year,
              count,
            }));
          })
        );

        for (const yearData of weeklyDataResults) {
          allWeeklyData.push(...yearData);
        }

        span.setAttribute("weeklyDataCount", allWeeklyData.length);

        // Store in Convex cache (fire and forget)
        convexClient
          .mutation(api.parking.setWeeklyCached, {
            cityId,
            years,
            data: allWeeklyData,
          })
          .catch((err) => {
            console.error("Failed to cache parking weekly data in Convex:", err);
            Sentry.captureException(err);
          });

        return NextResponse.json({ weeklyData: allWeeklyData, cityId });
      } catch (error) {
        console.error("Error fetching parking weekly data:", error);
        Sentry.captureException(error);
        return NextResponse.json(
          { error: "Failed to fetch parking weekly data" },
          { status: 500 }
        );
      }
    }
  );
}
