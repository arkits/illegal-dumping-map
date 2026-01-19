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
  unique_key?: string;
  sr_number?: string;
  servicerequestnumber?: string;
  srx?: string;
  sry?: string;
  lat?: string;
  long?: string;
  latitude?: string;
  longitude?: string;
  datetimeinit?: string;
  requested_datetime?: string;
  createddate?: string;
  created_date?: string;
  datetimeclosed?: string;
  closeddate?: string;
  closed_date?: string;
  status?: string;
  status_description?: string;
  servicerequeststatusname?: string;
  reqcategory?: string;
  service_details?: string;
  requesttype?: string;
  complaint_type?: string;
  sr_type?: string;
  description?: string;
  descriptor?: string;
  descriptionoftheillegaldumping?: string;
  address?: string;
  probaddress?: string;
  incident_address?: string;
  street_address?: string;
  location?: string;
  neighborhood?: string;
  geolocation?: {
    coordinates?: [number, number];
  };
  address_with_geocode?: {
    latitude?: string;
    longitude?: string;
  };
  street_no?: string;
  street_name?: string;
  city?: string;
  caseno?: string;
  case_id?: string;
  service_request_number?: string;
  service_request_type?: string;
  lat_location?: string;
  [key: string]: string | undefined | { coordinates?: [number, number] } | { latitude?: string; longitude?: string };
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
  let datetimeclosed: string | undefined;
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
    datetimeclosed = record.datetimeclosed; // Verified
    status = record.status || "";
    description = record.description || "";
    address = record.probaddress || record.address || "";
  } else if (cityId === "sanfrancisco") {
    id = record.service_request_id || "";
    lat = parseFloat(record.lat || "0");
    lon = parseFloat(record.long || "0");

    if (!filterInvalidCoordinates(lon, lat)) {
      return null;
    }

    datetimeinit = record.requested_datetime || "";
    datetimeclosed = record.closed_date; // Verified
    status = record.status_description || "";
    description = record.service_details || record.description || "";
    address = record.address || "";
  } else if (cityId === "losangeles") {
    id = record.srnumber || "";
    lat = parseFloat(record.latitude || "0");
    lon = parseFloat(record.longitude || "0");

    if (!filterInvalidCoordinates(lon, lat)) {
      return null;
    }

    datetimeinit = record.createddate || "";
    datetimeclosed = record.closeddate; // Verified
    status = record.status || "";
    description = record.requesttype || record.description || "";
    address = record.address || "";
  } else if (cityId === "newyork") {
    id = record.unique_key || "";
    lat = parseFloat(record.latitude || "0");
    lon = parseFloat(record.longitude || "0");

    if (!filterInvalidCoordinates(lon, lat)) {
      return null;
    }

    datetimeinit = record.created_date || "";
    datetimeclosed = record.closed_date; // Assumed standard, though missing in sample
    status = record.status || "";
    description = record.descriptor || "";
    address = record.incident_address || "";
  } else if (cityId === "chicago") {
    id = record.sr_number || "";
    lat = parseFloat(record.latitude || "0");
    lon = parseFloat(record.longitude || "0");

    if (!filterInvalidCoordinates(lon, lat)) {
      return null;
    }

    datetimeinit = record.created_date || "";
    datetimeclosed = record.closed_date; // Verified
    status = record.status || "";
    description = record.sr_type || "";
    address = record.street_address || "";
  } else if (cityId === "seattle") {
    id = record.servicerequestnumber || "";
    lat = parseFloat(record.latitude || "0");
    lon = parseFloat(record.longitude || "0");

    if (!filterInvalidCoordinates(lon, lat)) {
      return null;
    }

    datetimeinit = record.createddate || "";
    datetimeclosed = undefined; // Verified missing in Socrata API
    status = record.servicerequeststatusname || "";
    description = record.descriptionoftheillegaldumping || "";
    address = record.location || "";
  } else if (cityId === "dallas") {
    id = (record.service_request_number as string) || "";

    // Dallas uses lat_location field in format "(lat,lon)" as a string
    const latLocationStr = (record.lat_location as string) || "";
    if (latLocationStr) {
      // Parse "(lat,lon)" format - remove parentheses and split by comma
      const cleaned = latLocationStr.trim().replace(/^\(|\)$/g, "");
      const parts = cleaned.split(",");
      if (parts.length === 2) {
        lat = parseFloat(parts[0].trim());
        lon = parseFloat(parts[1].trim());
      } else {
        lat = 0;
        lon = 0;
      }
    } else {
      // Fallback to latitude/longitude if lat_location is not available
      const latStr = (record.latitude as string) || "0";
      const lonStr = (record.longitude as string) || "0";
      lat = parseFloat(latStr);
      lon = parseFloat(lonStr);
    }

    if (!filterInvalidCoordinates(lon, lat)) {
      return null;
    }

    // lat and lon are already numbers, no conversion needed

    datetimeinit = (record.created_date as string) || "";
    datetimeclosed = (record.closed_date as string); // Verified
    status = (record.status as string) || "";
    description = (record.service_request_type as string) || "";
    address = (record.address as string) || "";
  } else if (cityId === "montgomery") {
    id = (record.caseno as string) || "";
    const coords = record.geolocation?.coordinates;
    if (!coords || coords.length !== 2) {
      return null;
    }

    lat = coords[1];
    lon = coords[0];

    datetimeinit = (record.opendate as string) || "";
    datetimeclosed = (record.closedate as string); // Verified (note spelling)
    status = "";
    description = (record.casedesc as string) || "";
    const streetNo = record.street_no as string;
    const streetName = record.street_name as string;
    const city = record.city as string;
    address = streetNo && streetName && city ? `${streetNo} ${streetName}` : city || "";
  } else if (cityId === "kansascity") {
    id = (record.case_id as string) || "";
    const addrGeo = record.address_with_geocode;
    if (!addrGeo) {
      return null;
    }
    const latStr = addrGeo.latitude || "0";
    const lonStr = addrGeo.longitude || "0";
    lat = parseFloat(latStr);
    lon = parseFloat(lonStr);

    if (!filterInvalidCoordinates(lon, lat)) {
      return null;
    }

    datetimeinit = (record.creation_date as string) || "";
    datetimeclosed = (record.closed_date as string); // Verified
    status = (record.status as string) || "";
    description = (record.request_type as string) || "";
    address = (record.street_address as string) || "";
  } else {
    const rec: any = record;
    id = rec.service_request_id || rec.servicerequestnumber || rec.unique_key || "";
    const latStr = rec.lat || "0";
    const lonStr = rec.long || "0";
    lat = parseFloat(latStr);
    lon = parseFloat(lonStr);

    if (!filterInvalidCoordinates(lon, lat)) {
      return null;
    }

    datetimeinit = rec.requested_datetime || rec.createddate || rec.created_date || "";
    datetimeclosed = rec.datetimeclosed || rec.closed_date || rec.closeddate || rec.closedate;
    status = rec.status_description || rec.servicerequeststatusname || rec.status || "";
    description = rec.service_request_type || rec.requesttype || rec.service_subtype || rec.description || rec.descriptor || rec.descriptionoftheillegaldumping || rec.service_details || "";
    address = rec.address || rec.street_address || rec.incident_address || rec.location || rec.probaddress || "";
  }

  if (!id || !datetimeinit) {
    return null;
  }

  return {
    id,
    lat,
    lon,
    datetimeinit,
    datetimeclosed,
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
  onlyClosed?: boolean;
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
    onlyClosed = false,
  } = options;

  const city = getCityConfig(cityId);

  let whereClause = "";
  if (city.filterField && city.filterValue) {
    whereClause = `${city.filterField}='${city.filterValue}'`;
    if (year) {
      whereClause += ` AND date_extract_y(${city.dateField})=${year}`;
    }
  } else if (year) {
    // For Seattle (no filter needed, all records are illegal dumping)
    whereClause = `date_extract_y(${city.dateField})=${year}`;
  }

  // Add onlyClosed filter
  if (onlyClosed) {
    // Determine the closed date field for this city
    let closedField = "";
    if (cityId === "oakland") closedField = "datetimeclosed";
    else if (cityId === "sanfrancisco" || cityId === "chicago" || cityId === "newyork" || cityId === "dallas" || cityId === "kansascity") closedField = "closed_date";
    else if (cityId === "losangeles") closedField = "closeddate";
    else if (cityId === "montgomery") closedField = "closedate";

    // Check if we identified a closed field (Seattle has none)
    if (closedField) {
      const condition = `${closedField} IS NOT NULL`;
      whereClause = whereClause ? `${whereClause} AND ${condition}` : condition;
    }
  }

  const url = new URL(`https://${city.domain}/resource/${city.datasetId}.json`);
  if (whereClause) {
    url.searchParams.set("$where", whereClause);
  }

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
