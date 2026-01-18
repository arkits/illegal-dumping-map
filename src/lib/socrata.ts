import { OAKLAND_DOMAIN, DATASET_ID, DumpingRequest, webMercatorToWGS84, distBetweenLatLon } from "@/lib/utils";
import { LRUCache } from "lru-cache";

const API_TOKEN = process.env.OAK311_API_TOKEN;

const apiCache = new LRUCache<string, SocrataResponse[]>({
  max: 100,
  ttl: 1000 * 60 * 5,
});

interface SocrataResponse {
  id: string;
  requestid: string;
  srx: string;
  sry: string;
  datetimeinit: string;
  status: string;
  reqcategory: string;
  description: string;
  address: string;
  neighborhood: string;
  [key: string]: string;
}

async function fetchFromSocrata(
  url: string,
  token: string | null | undefined,
  retryWithoutAuth = false
): Promise<{ response: Response; data: SocrataResponse[] }> {
  const cached = apiCache.get(url);
  if (cached) {
    return { response: new Response(null, { status: 200 }), data: cached };
  }

  const headers: Record<string, string> = {};

  if (token && !retryWithoutAuth) {
    headers["X-App-Token"] = token;
  }

  const response = await fetch(url, {
    headers,
  });

  if (!response.ok) {
    if (response.status === 403 && !retryWithoutAuth) {
      console.log("Got 403 error, retrying without authentication...");
      return fetchFromSocrata(url, null, true);
    }
    throw new Error(`API error: ${response.status}`);
  }

  const data: SocrataResponse[] = await response.json();
  apiCache.set(url, data);
  return { response, data };
}

export async function fetchDumpingRequests(options: {
  year?: number;
  limit?: number;
  offset?: number;
  radius?: number;
  centerLat?: number;
  centerLon?: number;
  countOnly?: boolean;
}): Promise<DumpingRequest[]> {
  const { year, limit = 5000, offset = 0, radius, centerLat, centerLon, countOnly = false } = options;

  let whereClause = "REQCATEGORY='ILLDUMP'";
  if (year) {
    whereClause += ` AND date_extract_y(DATETIMEINIT)=${year}`;
  }

  const url = new URL(`https://${OAKLAND_DOMAIN}/resource/${DATASET_ID}.json`);
  url.searchParams.set("$where", whereClause);

  if (countOnly) {
    url.searchParams.set("$select", "count(*)");
  } else {
    url.searchParams.set("$limit", limit.toString());
    url.searchParams.set("$offset", offset.toString());
    url.searchParams.set("$order", "DATETIMEINIT DESC");
  }

  const { data } = await fetchFromSocrata(url.toString(), API_TOKEN);

  if (countOnly) {
    const countData = data as unknown as Array<{ count: string }>;
    return [{ id: countData[0]?.count || "0", lat: 0, lon: 0, datetimeinit: "", status: "", description: "", address: "" }];
  }

  const filteredData = data
    .filter(record => record.srx && record.sry)
    .map((record) => ({
      requestid: record.requestid,
      srx: record.srx,
      sry: record.sry,
      datetimeinit: record.datetimeinit,
      status: record.status,
      description: record.description || "",
      probaddress: record.probaddress,
      address: record.address,
    }));

  return filteredData
    .map((record) => {
      if (!record.srx || !record.sry) return null;
      const srx = parseFloat(record.srx);
      const sry = parseFloat(record.sry);
      if (!Number.isFinite(srx) || !Number.isFinite(sry)) return null;
      if (srx > 0 || srx < -18000000) return null;
      const isWGS84 = srx >= -180 && srx <= 180 && sry >= -90 && sry <= 90;
      const [lat, lon] = isWGS84 ? [sry, srx] : webMercatorToWGS84(srx, sry);

      return {
        id: record.requestid,
        lat,
        lon,
        datetimeinit: record.datetimeinit,
        status: record.status,
        description: record.description || "",
        address: record.probaddress || record.address || "",
      };
    })
    .filter((record): record is DumpingRequest => record !== null)
    .filter((record) => {
      if (radius != null && centerLat != null && centerLon != null) {
        const distanceKm = distBetweenLatLon(
          [record.lat, record.lon],
          [centerLat, centerLon]
        );
        return distanceKm <= radius;
      }
      return true;
    });
}

export async function fetchAllRequestsForYear(year: number): Promise<DumpingRequest[]> {
  const allRequests: DumpingRequest[] = [];
  let offset = 0;
  const limit = 5000;
  let hasMore = true;

  while (hasMore) {
    const requests = await fetchDumpingRequests({ year, limit, offset });
    if (requests.length < limit) {
      hasMore = false;
    }
    allRequests.push(...requests);
    offset += limit;
  }

  return allRequests;
}
