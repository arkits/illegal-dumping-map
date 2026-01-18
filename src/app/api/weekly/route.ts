import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { fetchDumpingRequests, CITIES } from "@/lib/socrata";
import { getWeekNumber, CityId } from "@/lib/utils";
import { convexClient, api } from "@/lib/convex-client";

interface WeeklyData {
  week: number;
  year: number;
  count: number;
}

export async function GET(request: NextRequest) {
  return Sentry.startSpan(
    {
      op: "http.server",
      name: "GET /api/weekly",
    },
    async (span) => {
      const searchParams = request.nextUrl.searchParams;
      const currentYear = new Date().getFullYear();

      const cityIdParam = searchParams.get("cityId");
      const cityId = (cityIdParam && cityIdParam in CITIES
        ? cityIdParam
        : "oakland") as CityId;

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
            return await convexClient.query(api.weekly.getCached, {
              cityId: cityId as "oakland" | "sanfrancisco" | "losangeles",
              years,
            });
          }
        );

        if (cached) {
          span.setAttribute("cacheHit", true);
          return NextResponse.json({ weeklyData: cached, cityId });
        }

        span.setAttribute("cacheHit", false);

        // Cache miss - fetch from Socrata and process
        const allWeeklyData: WeeklyData[] = [];

        for (const year of years) {
          const requests = await Sentry.startSpan(
            {
              op: "http.client",
              name: `Fetch dumping requests from Socrata (${cityId}, ${year})`,
            },
            async (yearSpan) => {
              yearSpan.setAttribute("year", year);
              return await fetchDumpingRequests({ cityId, year, limit: 100000 });
            }
          );

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

        span.setAttribute("weeklyDataCount", allWeeklyData.length);

        // Store in Convex cache (fire and forget)
        convexClient
          .mutation(api.weekly.setCached, {
            cityId: cityId as "oakland" | "sanfrancisco" | "losangeles",
            years,
            data: allWeeklyData,
          })
          .catch((err) => {
            console.error("Failed to cache weekly data in Convex:", err);
            Sentry.captureException(err);
          });

        return NextResponse.json({ weeklyData: allWeeklyData, cityId });
      } catch (error) {
        console.error("Error fetching weekly data:", error);
        Sentry.captureException(error);
        return NextResponse.json(
          { error: "Failed to fetch weekly data" },
          { status: 500 }
        );
      }
    }
  );
}
