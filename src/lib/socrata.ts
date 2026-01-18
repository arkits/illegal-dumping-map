import { LRUCache } from "lru-cache";
import {
  CITIES,
  CityId,
  DumpingRequest,
  getCityConfig,
  webMercatorToWGS84,
  distBetweenLatLon,
  isWGS84,
  filterInvalidCoordinates,
} from "@/lib/utils";

const API_TOKEN = process.env.OAK311_API_TOKEN;

const apiCache = new LRUCache<string, SocrataResponse[]>({
  max: 200,
  ttl: 1000 * 60 * 5,
});

interface SocrataResponse {
  id: string;
  requestid?: string;
  service_request_id?: string;
  srnumber?: string;
  srx?: string;
  sry?: string;
  lat?: string;
  long?: string;
  latitude?: string;
  longitude?: string;
  datetimeinit?: string;
  requested_datetime?: string;
  createddate?: string;
  status?: string;
  status_description?: string;
  reqcategory?: string;
  service_details?: string;
  requesttype?: string;
  description?: string;
  address?: string;
  probaddress?: string;
  neighborhood?: string;
  [key: string]: string | undefined;
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

function transformRecord(record: SocrataResponse, cityId: CityId): DumpingRequest | null {
  let id: string;
  let lat: number;
  let lon: number;
  let datetimeinit: string;
  let status: string;
  let description: string;
  let address: string;

  if (cityId === "oakland") {
    id = record.requestid || "";
    const srx = parseFloat(record.srx || "0");
    const sry = parseFloat(record.sry || "0");

    if (!filterInvalidCoordinates(srx, sry)) {
      return null;
    }

    const isWGS = isWGS84(srx, sry);
    [lat, lon] = isWGS ? [sry, srx] : webMercatorToWGS84(srx, sry);
    datetimeinit = record.datetimeinit || "";
    status = record.status || "";
    description = record.description || "";
    address = record.probaddress || record.address || "";
  } else if (cityId === "losangeles") {
    id = record.srnumber || "";
    lat = parseFloat(record.latitude || "0");
    lon = parseFloat(record.longitude || "0");

    if (!filterInvalidCoordinates(lon, lat)) {
      return null;
    }

    datetimeinit = record.createddate || "";
    status = record.status || "";
    description = record.requesttype || record.description || "";
    address = record.address || "";
  } else {
    id = record.service_request_id || "";
    lat = parseFloat(record.lat || "0");
    lon = parseFloat(record.long || "0");

    if (!filterInvalidCoordinates(lon, lat)) {
      return null;
    }

    datetimeinit = record.requested_datetime || "";
    status = record.status_description || "";
    description = record.service_details || record.description || "";
    address = record.address || "";
  }

  if (!id || !datetimeinit) {
    return null;
  }

  return {
    id,
    lat,
    lon,
    datetimeinit,
    status,
    description,
    address,
    cityId,
  };
}

export async function fetchDumpingRequests(options: {
  cityId: CityId;
  year?: number;
  limit?: number;
  offset?: number;
  radius?: number;
  centerLat?: number;
  centerLon?: number;
  countOnly?: boolean;
}): Promise<DumpingRequest[]> {
  const {
    cityId,
    year,
    limit = 5000,
    offset = 0,
    radius,
    centerLat,
    centerLon,
    countOnly = false,
  } = options;

  const city = getCityConfig(cityId);

  let whereClause = `${city.filterField}='${city.filterValue}'`;
  if (year) {
    whereClause += ` AND date_extract_y(${city.dateField})=${year}`;
  }

  const url = new URL(`https://${city.domain}/resource/${city.datasetId}.json`);
  url.searchParams.set("$where", whereClause);

  if (countOnly) {
    url.searchParams.set("$select", "count(*)");
  } else {
    url.searchParams.set("$limit", limit.toString());
    url.searchParams.set("$offset", offset.toString());
    url.searchParams.set("$order", `${city.dateField} DESC`);
  }

  const { data } = await fetchFromSocrata(url.toString(), API_TOKEN);

  if (countOnly) {
    const countData = data as unknown as Array<{ count: string }>;
    return [
      {
        id: countData[0]?.count || "0",
        lat: 0,
        lon: 0,
        datetimeinit: "",
        status: "",
        description: "",
        address: "",
        cityId,
      },
    ];
  }

  return data
    .map((record) => transformRecord(record, cityId))
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

export async function fetchAllRequestsForYear(
  cityId: CityId,
  year: number
): Promise<DumpingRequest[]> {
  const allRequests: DumpingRequest[] = [];
  let offset = 0;
  const limit = 5000;
  let hasMore = true;

  while (hasMore) {
    const requests = await fetchDumpingRequests({ cityId, year, limit, offset });
    if (requests.length < limit) {
      hasMore = false;
    }
    allRequests.push(...requests);
    offset += limit;
  }

  return allRequests;
}

export function clearCache(): void {
  apiCache.clear();
}

export { CITIES };
