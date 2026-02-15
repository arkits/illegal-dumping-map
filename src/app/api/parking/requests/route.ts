import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { fetchParkingCitations } from "@/lib/parking-citations";
import { getParkingRequestsCached, setParkingRequestsCached } from "@/lib/cache";

// Type-safe parking city ID validator
const PARKING_CITY_IDS = ["oakland", "sanfrancisco", "losangeles"] as const;
type ValidParkingCityId = typeof PARKING_CITY_IDS[number];

function getParkingCityId(param: string | null): ValidParkingCityId {
  if (param && PARKING_CITY_IDS.includes(param as ValidParkingCityId)) {
    return param as ValidParkingCityId;
  }
  return "oakland";
}

export async function GET(request: NextRequest) {
  return Sentry.startSpan(
    {
      op: "http.server",
      name: "GET /api/parking/requests",
    },
    async (span) => {
      const searchParams = request.nextUrl.searchParams;

      const parseIntParam = (v: string | null, fallback: number) => {
        const n = Number.parseInt(v ?? "", 10);
        return Number.isFinite(n) ? n : fallback;
      };

      const parseFloatParam = (v: string | null) => {
        const n = Number.parseFloat(v ?? "");
        return Number.isFinite(n) ? n : undefined;
      };

      const cityIdParam = searchParams.get("cityId");
      const cityId = getParkingCityId(cityIdParam);

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

      span.setAttribute("cityId", cityId);
      span.setAttribute("year", year ?? "all");
      span.setAttribute("limit", limit);
      span.setAttribute("offset", offset);

      try {
      // Check SQLite cache first
      const cached = await Sentry.startSpan(
        {
          op: "cache.query",
          name: "Check SQLite cache",
        },
        async () => {
          return await getParkingRequestsCached({
            cityId,
            year,
            limit,
            offset,
            radius,
            centerLat,
            centerLon,
          });
        }
      ) as Awaited<ReturnType<typeof fetchParkingCitations>> | null | undefined;

        if (cached != null) {
          span.setAttribute("cacheHit", true);
          return NextResponse.json({ citations: cached, count: cached.length }, {
            headers: {
              'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
            },
          });
        }

        span.setAttribute("cacheHit", false);

        // Cache miss - fetch from Socrata
        const citations = await Sentry.startSpan(
          {
            op: "http.client",
            name: `Fetch parking citations from Socrata (${cityId})`,
          },
          async () => {
            return await fetchParkingCitations({
              cityId,
              year,
              limit,
              offset,
              radius,
              centerLat,
              centerLon,
            });
          }
        );

        span.setAttribute("citationCount", citations.length);

        // Store in SQLite cache
        try {
          await setParkingRequestsCached({
            cityId,
            year,
            limit,
            offset,
            radius,
            centerLat,
            centerLon,
            data: citations,
          });
        } catch (err) {
          console.error("Failed to cache parking citations in SQLite:", err);
          Sentry.captureException(err);
        }

        return NextResponse.json({ citations, count: citations.length });
      } catch (error) {
        console.error("Error fetching parking citations:", error);
        Sentry.captureException(error);
        return NextResponse.json(
          { error: "Failed to fetch parking citations" },
          { status: 500 }
        );
      }
    }
  );
}
