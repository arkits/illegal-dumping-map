export const OAKLAND_DOMAIN = "data.oaklandca.gov";
export const DATASET_ID = "quth-gb8e";
export const EARTH_RADIUS_METERS = 6378137;
export const OAKLAND_CENTER_LAT = 37.804747;
export const OAKLAND_CENTER_LON = -122.272;

export function webMercatorToWGS84(x: number, y: number): [number, number] {
  const lonRad = x / EARTH_RADIUS_METERS;
  const latRad = 2 * Math.atan(Math.exp(y / EARTH_RADIUS_METERS)) - Math.PI / 2;

  return [radToDeg(latRad), radToDeg(lonRad)];
}

function radToDeg(rad: number): number {
  return rad * (180 / Math.PI);
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

function degToRad(deg: number): number {
  return deg * (Math.PI / 180);
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
}
