import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { fetchDumpingRequests } from "@/lib/socrata";
import { getRequestsCached, setRequestsCached } from "@/lib/cache";

// Type-safe city ID validator that returns the exact literal type
const CITY_IDS = ["oakland", "sanfrancisco", "losangeles", "newyork", "chicago", "seattle", "dallas", "montgomery", "kansascity"] as const;
type ValidCityId = typeof CITY_IDS[number];

function getCityId(param: string | null): ValidCityId {
  if (param && CITY_IDS.includes(param as ValidCityId)) {
    return param as ValidCityId;
  }
  return "oakland";
}

export async function GET(request: NextRequest) {
  return Sentry.startSpan(
    {
      op: "http.server",
      name: "GET /api/requests",
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
  const cityId = getCityId(cityIdParam);

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
            return await getRequestsCached({
              cityId,
              year,
              limit,
              offset,
              radius,
              centerLat,
              centerLon,
            });
          }
        ) as Awaited<ReturnType<typeof fetchDumpingRequests>> | null | undefined;

        if (cached != null) {
          span.setAttribute("cacheHit", true);
          return NextResponse.json({ requests: cached, count: cached.length }, {
            headers: {
              'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
            },
          });
        }

        span.setAttribute("cacheHit", false);

        // Cache miss - fetch from Socrata
        const requests = await Sentry.startSpan(
          {
            op: "http.client",
            name: `Fetch dumping requests from Socrata (${cityId})`,
          },
          async () => {
            return await fetchDumpingRequests({
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

        span.setAttribute("requestCount", requests.length);

        // Store in SQLite cache
        try {
          await setRequestsCached({
            cityId,
            year,
            limit,
            offset,
            radius,
            centerLat,
            centerLon,
            data: requests,
          });
        } catch (err) {
          console.error("Failed to cache requests in SQLite:", err);
          Sentry.captureException(err);
        }

        return NextResponse.json({ requests, count: requests.length });
      } catch (error) {
        console.error("Error fetching requests:", error);
        Sentry.captureException(error);
        return NextResponse.json(
          { error: "Failed to fetch requests" },
          { status: 500 }
        );
      }
    }
  );
}
