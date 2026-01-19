import { LRUCache } from "lru-cache";
import { distBetweenLatLon, filterInvalidCoordinates } from "@/lib/utils";

const API_TOKEN = process.env.OAK311_API_TOKEN;

const apiCache = new LRUCache<string, ParkingSocrataResponse[]>({
  max: 200,
  ttl: 1000 * 60 * 5, // 5 minutes
});

export interface ParkingCityConfig {
  id: string;
  route: string;
  name: string;
  state: string;
  domain: string;
  datasetId: string;
  dateField: string;
  addressField: string;
  violationField: string;
  violationDescField: string;
  fineAmountField: string;
  centerLat: number;
  centerLon: number;
  requiresCoordinateFilter: boolean; // For Oakland
  color: string;
  shortDescription?: string;
  imagePath?: string;
}

export const PARKING_CITIES: Record<string, ParkingCityConfig> = {
  oakland: {
    id: "oakland",
    route: "/parking/oakland",
    name: "Oakland",
    state: "CA",
    domain: "data.oaklandca.gov",
    datasetId: "58em-y96b",
    dateField: "ticket_iss",
    addressField: "location",
    violationField: "violation",
    violationDescField: "violatio_1",
    fineAmountField: "fine_amount",
    centerLat: 37.804747,
    centerLon: -122.272,
    requiresCoordinateFilter: true,
    color: "amber",
    shortDescription: "Explore 2.5M+ parking citations with violation details.",
    imagePath: "/images/cities/oakland.png",
  },
  sanfrancisco: {
    id: "sanfrancisco",
    route: "/parking/san-francisco",
    name: "San Francisco",
    state: "CA",
    domain: "data.sfgov.org",
    datasetId: "ab4h-6ztd",
    dateField: "citation_issued_datetime",
    addressField: "citation_location",
    violationField: "violation",
    violationDescField: "violation_desc",
    fineAmountField: "fine_amount",
    centerLat: 37.7749,
    centerLon: -122.4194,
    requiresCoordinateFilter: false,
    color: "rose",
    shortDescription: "Visualize 23M+ parking citations from SFMTA.",
    imagePath: "/images/cities/san-francisco.png",
  },
  losangeles: {
    id: "losangeles",
    route: "/parking/los-angeles",
    name: "Los Angeles",
    state: "CA",
    domain: "data.lacity.org",
    datasetId: "4f5p-udkv",
    dateField: "issue_date",
    addressField: "location",
    violationField: "violation_code",
    violationDescField: "violation_description",
    fineAmountField: "fine_amount",
    centerLat: 34.0522,
    centerLon: -118.2437,
    requiresCoordinateFilter: false,
    color: "violet",
    shortDescription: "Analyze 24M+ parking citations from LADOT.",
    imagePath: "/images/cities/los-angeles.png",
  },
};

export type ParkingCityId = keyof typeof PARKING_CITIES;

export interface ParkingCitation {
  id: string;
  lat: number;
  lon: number;
  issueDate: string;
  violation: string;
  violationDesc: string;
  fineAmount: number;
  location: string;
  cityId?: ParkingCityId;
  // City-specific fields
  neighborhood?: string; // SF
  agency?: string; // LA
  meterIndicator?: string; // Oakland
}

interface ParkingSocrataResponse {
  ticket_num?: string;
  citation_number?: string;
  ticket_number?: string;
  ticket_iss?: string;
  citation_issued_datetime?: string;
  issue_date?: string;
  violation?: string;
  violation_code?: string;
  violatio_1?: string;
  violation_desc?: string;
  violation_description?: string;
  fine_amount?: string;
  location?: string;
  citation_location?: string;
  the_geom?: {
    type: string;
    coordinates: [number, number];
  };
  geocodelocation?: {
    type: string;
    coordinates: [number, number];
  };
  loc_lat?: string;
  loc_long?: string;
  analysis_neighborhood?: string;
  agency_desc?: string;
  meter_indi?: string;
  [key: string]: string | undefined | { type: string; coordinates: [number, number] };
}

export function getParkingCityConfig(cityId: ParkingCityId): ParkingCityConfig {
  const config = PARKING_CITIES[cityId];
  if (!config) {
    throw new Error(`Unknown parking city: ${cityId}`);
  }
  return config;
}

async function fetchFromSocrata(
  url: string,
  token: string | null | undefined,
  retryWithoutAuth = false
): Promise<{ response: Response; data: ParkingSocrataResponse[] }> {
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

  const data: ParkingSocrataResponse[] = await response.json();
  apiCache.set(url, data);
  return { response, data };
}

function transformOaklandCitation(record: ParkingSocrataResponse): ParkingCitation | null {
  const id = record.ticket_num || "";
  if (!id) return null;

  const geom = record.the_geom;
  if (!geom || !geom.coordinates || geom.coordinates.length !== 2) {
    return null;
  }

  const [lon, lat] = geom.coordinates;

  // Filter invalid coordinates
  if (!filterInvalidCoordinates(lon, lat)) {
    return null;
  }

  // Additional validation for Oakland's known invalid coordinates
  // Oakland should be around -122.3 to -122.1 longitude and 37.7 to 37.9 latitude
  // Filter out coordinates that are clearly outside Oakland's bounds
  if (lon < -123 || lon > -121 || lat < 37.5 || lat > 38.0) {
    return null;
  }

  return {
    id,
    lat,
    lon,
    issueDate: record.ticket_iss || "",
    violation: record.violation || "",
    violationDesc: record.violatio_1 || "",
    fineAmount: parseFloat(record.fine_amount || "0"),
    location: record.location || "",
    cityId: "oakland",
    meterIndicator: record.meter_indi,
  };
}

function transformSFCitation(record: ParkingSocrataResponse): ParkingCitation | null {
  const id = record.citation_number || "";
  if (!id) return null;

  const geom = record.the_geom;
  if (!geom || !geom.coordinates || geom.coordinates.length !== 2) {
    return null;
  }

  const [lon, lat] = geom.coordinates;

  if (!filterInvalidCoordinates(lon, lat)) {
    return null;
  }

  return {
    id,
    lat,
    lon,
    issueDate: record.citation_issued_datetime || "",
    violation: record.violation || "",
    violationDesc: record.violation_desc || "",
    fineAmount: parseFloat(record.fine_amount || "0"),
    location: record.citation_location || "",
    cityId: "sanfrancisco",
    neighborhood: record.analysis_neighborhood,
  };
}

function transformLACitation(record: ParkingSocrataResponse): ParkingCitation | null {
  const id = record.ticket_number || "";
  if (!id) return null;

  // Try geocodelocation first, then loc_lat/loc_long
  let lat: number;
  let lon: number;

  if (record.geocodelocation?.coordinates) {
    [lon, lat] = record.geocodelocation.coordinates;
  } else if (record.loc_lat && record.loc_long) {
    lat = parseFloat(record.loc_lat);
    lon = parseFloat(record.loc_long);
  } else {
    return null;
  }

  if (!filterInvalidCoordinates(lon, lat)) {
    return null;
  }

  return {
    id,
    lat,
    lon,
    issueDate: record.issue_date || "",
    violation: record.violation_code || "",
    violationDesc: record.violation_description || "",
    fineAmount: parseFloat(record.fine_amount || "0"),
    location: record.location || "",
    cityId: "losangeles",
    agency: record.agency_desc,
  };
}

function transformRecord(record: ParkingSocrataResponse, cityId: ParkingCityId): ParkingCitation | null {
  if (cityId === "oakland") {
    return transformOaklandCitation(record);
  } else if (cityId === "sanfrancisco") {
    return transformSFCitation(record);
  } else if (cityId === "losangeles") {
    return transformLACitation(record);
  }
  return null;
}

export async function fetchParkingCitations(options: {
  cityId: ParkingCityId;
  year?: number;
  limit?: number;
  offset?: number;
  radius?: number;
  centerLat?: number;
  centerLon?: number;
}): Promise<ParkingCitation[]> {
  const {
    cityId,
    year,
    limit = 5000,
    offset = 0,
    radius,
    centerLat,
    centerLon,
  } = options;

  const city = getParkingCityConfig(cityId);

  let whereClause = "";
  
  // Note: Socrata doesn't support longitude()/latitude() functions in WHERE clauses
  // Coordinate filtering is done client-side in the transform functions
  // For Oakland, invalid coordinates (like [165.99, -90]) are filtered out in transformOaklandCitation()

  if (year) {
    const yearCondition = `date_extract_y(${city.dateField})=${year}`;
    whereClause = yearCondition;
  }
  
  // For Oakland, also filter out records without geometry
  if (city.requiresCoordinateFilter && whereClause) {
    whereClause = `the_geom IS NOT NULL AND ${whereClause}`;
  } else if (city.requiresCoordinateFilter) {
    whereClause = "the_geom IS NOT NULL";
  }

  const url = new URL(`https://${city.domain}/resource/${city.datasetId}.json`);
  if (whereClause) {
    url.searchParams.set("$where", whereClause);
  }
  url.searchParams.set("$limit", limit.toString());
  url.searchParams.set("$offset", offset.toString());
  url.searchParams.set("$order", `${city.dateField} DESC`);

  const { data } = await fetchFromSocrata(url.toString(), API_TOKEN);

  return data
    .map((record) => transformRecord(record, cityId))
    .filter((record): record is ParkingCitation => record !== null)
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

export async function fetchAllParkingCitationsForYear(
  cityId: ParkingCityId,
  year: number
): Promise<ParkingCitation[]> {
  const allCitations: ParkingCitation[] = [];
  let offset = 0;
  const limit = 5000;
  let hasMore = true;

  while (hasMore) {
    const citations = await fetchParkingCitations({ cityId, year, limit, offset });
    if (citations.length < limit) {
      hasMore = false;
    }
    allCitations.push(...citations);
    offset += limit;
  }

  return allCitations;
}

export function clearParkingCache(): void {
  apiCache.clear();
}
