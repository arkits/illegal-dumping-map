interface CityConfig {
  id: string;
  route: string;
  name: string;
  domain: string;
  datasetId: string;
  filterField: string;
  filterValue: string;
  dateField: string;
  addressField: string;
  descriptionField: string;
  centerLat: number;
  centerLon: number;
  requiresCoordinateConversion: boolean;
  color: string;
  availableYears?: number[];
}

export const CITIES: Record<string, CityConfig> = {
  oakland: {
    id: "oakland",
    route: "/oakland",
    name: "Oakland",
    domain: "data.oaklandca.gov",
    datasetId: "quth-gb8e",
    filterField: "REQCATEGORY",
    filterValue: "ILLDUMP",
    dateField: "DATETIMEINIT",
    addressField: "probaddress",
    descriptionField: "description",
    centerLat: 37.804747,
    centerLon: -122.272,
    requiresCoordinateConversion: true,
    color: "blue",
  },
  sanfrancisco: {
    id: "sanfrancisco",
    route: "/san-francisco",
    name: "San Francisco",
    domain: "data.sfgov.org",
    datasetId: "vw6y-z8j6",
    filterField: "service_details",
    filterValue: "trash_dumping",
    dateField: "requested_datetime",
    addressField: "address",
    descriptionField: "service_subtype",
    centerLat: 37.7749,
    centerLon: -122.4194,
    requiresCoordinateConversion: false,
    color: "red",
  },
  losangeles: {
    id: "losangeles",
    route: "/los-angeles",
    name: "Los Angeles",
    domain: "data.lacity.org",
    datasetId: "b7dx-7gc3",
    filterField: "requesttype",
    filterValue: "Illegal Dumping Pickup",
    dateField: "createddate",
    addressField: "address",
    descriptionField: "requesttype",
    centerLat: 34.0522,
    centerLon: -118.2437,
    requiresCoordinateConversion: false,
    color: "purple",
    availableYears: [2024],
  },
};

export type CityId = keyof typeof CITIES;

export function getCityConfig(cityId: CityId): CityConfig {
  const config = CITIES[cityId];
  if (!config) {
    throw new Error(`Unknown city: ${cityId}`);
  }
  return config;
}

export function getDefaultYearForCity(cityId: CityId): number {
  const city = getCityConfig(cityId);
  const currentYear = new Date().getFullYear();
  if (city.availableYears && city.availableYears.length > 0) {
    return city.availableYears[0];
  }
  return currentYear;
}

export const OAKLAND_DOMAIN = "data.oaklandca.gov";
export const DATASET_ID = "quth-gb8e";
export const EARTH_RADIUS_METERS = 6378137;
export const OAKLAND_CENTER_LAT = 37.804747;
export const OAKLAND_CENTER_LON = -122.272;
export const SF_CENTER_LAT = 37.7749;
export const SF_CENTER_LON = -122.4194;

export function webMercatorToWGS84(x: number, y: number): [number, number] {
  const lonRad = x / EARTH_RADIUS_METERS;
  const latRad = 2 * Math.atan(Math.exp(y / EARTH_RADIUS_METERS)) - Math.PI / 2;

  return [radToDeg(latRad), radToDeg(lonRad)];
}

function radToDeg(rad: number): number {
  return rad * (180 / Math.PI);
}

export function degToRad(deg: number): number {
  return deg * (Math.PI / 180);
}

export function distBetweenLatLon(
  coord1: [number, number],
  coord2: [number, number]
): number {
  const lat1Rad = degToRad(coord1[0]);
  const lon1Rad = degToRad(coord1[1]);
  const lat2Rad = degToRad(coord2[0]);
  const lon2Rad = degToRad(coord2[1]);

  const dlat = lat2Rad - lat1Rad;
  const dlon = lon2Rad - lon1Rad;

  const a =
    Math.sin(dlat / 2) ** 2 +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dlon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return (EARTH_RADIUS_METERS * c) / 1000;
}

export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export interface DumpingRequest {
  id: string;
  lat: number;
  lon: number;
  datetimeinit: string;
  status: string;
  description: string;
  address: string;
  cityId?: CityId;
}

export function isWGS84(x: number, y: number): boolean {
  return x >= -180 && x <= 180 && y >= -90 && y <= 90;
}

export function isValidWebMercator(x: number): boolean {
  return x < 0 && x >= -18000000;
}

export function filterInvalidCoordinates(x: number, y: number): boolean {
  if (x === 0 && y === 0) return false;
  if (!isWGS84(x, y) && !isValidWebMercator(x)) return false;
  return true;
}
