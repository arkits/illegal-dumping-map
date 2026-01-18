import { OAKLAND_DOMAIN, DATASET_ID, DumpingRequest, webMercatorToWGS84, distBetweenLatLon } from "@/lib/utils";

const API_TOKEN = process.env.OAK311_API_TOKEN;
const API_USERNAME = process.env.OAK311_API_USERNAME;

interface SocrataResponse {
  id: string;
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
  username: string | null | undefined,
  retryWithoutAuth = false
): Promise<{ response: Response; data: SocrataResponse[] }> {
  const headers: Record<string, string> = {};

  if (token && !retryWithoutAuth) {
    headers["X-App-Token"] = token;
  }

  const response = await fetch(url, {
    headers,
    // next: { revalidate: 300 },
  });

  if (!response.ok) {
    if (response.status === 403 && !retryWithoutAuth) {
      console.log("Got 403 error, retrying without authentication...");
      return fetchFromSocrata(url, null, null, true);
    }
    throw new Error(`API error: ${response.status}`);
  }

  const data: SocrataResponse[] = await response.json();
  return { response, data };
}

export async function fetchDumpingRequests(options: {
  year?: number;
  limit?: number;
  offset?: number;
  radius?: number;
  centerLat?: number;
  centerLon?: number;
}): Promise<DumpingRequest[]> {
  const { year, limit = 1000, offset = 0, radius, centerLat, centerLon } = options;

  let whereClause = "REQCATEGORY='ILLDUMP'";
  if (year) {
    whereClause += ` AND date_extract_y(DATETIMEINIT)=${year}`;
  }

  const url = new URL(`https://${OAKLAND_DOMAIN}/resource/${DATASET_ID}.json`);
  url.searchParams.set("$where", whereClause);
  url.searchParams.set("$limit", limit.toString());
  url.searchParams.set("$offset", offset.toString());
  url.searchParams.set("$order", "DATETIMEINIT DESC");

  const { data } = await fetchFromSocrata(url.toString(), API_TOKEN, API_USERNAME);

  return data
    .map((record) => {
      if (!record.srx || !record.sry) return null;
      const srx = parseFloat(record.srx);
      const sry = parseFloat(record.sry);
      if (!Number.isFinite(srx) || !Number.isFinite(sry)) return null;
      if (srx > 0 || srx < -18000000) return null;
      const isWGS84 = srx >= -180 && srx <= 180 && sry >= -90 && sry <= 90;
      const [lat, lon] = isWGS84 ? [sry, srx] : webMercatorToWGS84(srx, sry);

      return {
        id: record.id,
        lat,
        lon,
        datetimeinit: record.datetimeinit,
        status: record.status,
        description: record.description || "",
        address: record.address || "",
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
