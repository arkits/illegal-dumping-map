export interface CityConfig {
  id: string;
  route: string;
  name: string;
  state: string;
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
  shortDescription?: string;
  imagePath?: string;
}

export const CITIES: Record<string, CityConfig> = {
  oakland: {
    id: "oakland",
    route: "/oakland",
    name: "Oakland",
    state: "CA",
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
    shortDescription: "Explore ~370,000+ illegal dumping records with detailed location information.",
    imagePath: "/images/cities/oakland.png",
  },
  sanfrancisco: {
    id: "sanfrancisco",
    route: "/san-francisco",
    name: "San Francisco",
    state: "CA",
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
    shortDescription: "Visualize 2,600+ trash dumping incidents filtered from SF 311 data.",
    imagePath: "/images/cities/san-francisco.png",
  },
  losangeles: {
    id: "losangeles",
    route: "/los-angeles",
    name: "Los Angeles",
    state: "CA",
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
    shortDescription: "Analyze ~114,000+ MyLA311 service requests from 2024.",
    imagePath: "/images/cities/los-angeles.png",
  },
  newyork: {
    id: "newyork",
    route: "/new-york",
    name: "New York City",
    state: "NY",
    domain: "data.cityofnewyork.us",
    datasetId: "erm2-nwe9",
    filterField: "complaint_type",
    filterValue: "Illegal Dumping",
    dateField: "created_date",
    addressField: "incident_address",
    descriptionField: "descriptor",
    centerLat: 40.7128,
    centerLon: -74.006,
    requiresCoordinateConversion: false,
    color: "orange",
    shortDescription: "Explore 150,000+ illegal dumping records from NYC 311.",
    imagePath: "/images/cities/new-york.png",
  },
  chicago: {
    id: "chicago",
    route: "/chicago",
    name: "Chicago",
    state: "IL",
    domain: "data.cityofchicago.org",
    datasetId: "v6vf-nfxy",
    filterField: "sr_type",
    filterValue: "Fly Dumping Complaint",
    dateField: "created_date",
    addressField: "street_address",
    descriptionField: "sr_type",
    centerLat: 41.8781,
    centerLon: -87.6298,
    requiresCoordinateConversion: false,
    color: "green",
    shortDescription: "View 83,000+ Fly Dumping Complaint records from Chicago 311.",
    imagePath: "/images/cities/chicago.png",
  },
  seattle: {
    id: "seattle",
    route: "/seattle",
    name: "Seattle",
    state: "WA",
    domain: "data.seattle.gov",
    datasetId: "bpvk-ju3y",
    filterField: "",
    filterValue: "",
    dateField: "createddate",
    addressField: "location",
    descriptionField: "descriptionoftheillegaldumping",
    centerLat: 47.6062,
    centerLon: -122.3321,
    requiresCoordinateConversion: false,
    color: "teal",
    shortDescription: "Analyze 272,000+ records from Seattle's illegal dumping dataset.",
    imagePath: "/images/cities/seattle.png",
  },
  dallas: {
    id: "dallas",
    route: "/dallas",
    name: "Dallas",
    state: "TX",
    domain: "www.dallasopendata.com",
    datasetId: "gc4d-8a49",
    filterField: "service_request_type",
    filterValue: "Illegal Dumping Sign - CCS",
    dateField: "created_date",
    addressField: "address",
    descriptionField: "service_request_type",
    centerLat: 32.7767,
    centerLon: -96.797,
    requiresCoordinateConversion: false,
    color: "cyan",
    shortDescription: "Explore 311 data on illegal dumping signs and incidents.",
  },
  montgomery: {
    id: "montgomery",
    route: "/montgomery-county-md",
    name: "Montgomery County",
    state: "MD",
    domain: "data.montgomerycountymd.gov",
    datasetId: "d985-d2ak",
    filterField: "",
    filterValue: "",
    dateField: "opendate",
    addressField: "",
    descriptionField: "casedesc",
    centerLat: 39.0545,
    centerLon: -77.0538,
    requiresCoordinateConversion: false,
    color: "fuchsia",
    shortDescription: "Analyze illegal dumping reports in Montgomery County.",
  },
  kansascity: {
    id: "kansascity",
    route: "/kansas-city",
    name: "Kansas City",
    state: "MO",
    domain: "data.kcmo.org",
    datasetId: "7at3-sxhp",
    filterField: "request_type",
    filterValue: "Trash / Recycling-Dumping-Private Property",
    dateField: "creation_date",
    addressField: "street_address",
    descriptionField: "request_type",
    centerLat: 39.0997,
    centerLon: -94.5785,
    requiresCoordinateConversion: false,
    color: "emerald",
    shortDescription: "Visualize 311 service requests for trash and dumping.",
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
