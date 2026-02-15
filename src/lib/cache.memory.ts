import type { CityId, ParkingCityId } from "./cache.sqlite";

type RequestCacheParams = {
  cityId: CityId;
  year?: number;
  limit: number;
  offset: number;
  radius?: number;
  centerLat?: number;
  centerLon?: number;
};

type ParkingRequestCacheParams = {
  cityId: ParkingCityId;
  year?: number;
  limit: number;
  offset: number;
  radius?: number;
  centerLat?: number;
  centerLon?: number;
};

type StatsCacheParams = {
  cityId: CityId;
  year: number;
  compareYear: number;
};

type ParkingStatsCacheParams = {
  cityId: ParkingCityId;
  year?: number;
};

type WeeklyCacheParams = {
  cityId: CityId;
  years: number[];
};

type ParkingWeeklyCacheParams = {
  cityId: ParkingCityId;
  years: number[];
};

type CacheEntry<T> = {
  data: T;
  expiresAt: number;
};

const requestStore = new Map<string, CacheEntry<unknown>>();
const statsStore = new Map<string, CacheEntry<unknown>>();
const weeklyStore = new Map<string, CacheEntry<unknown>>();
const parkingRequestStore = new Map<string, CacheEntry<unknown>>();
const parkingStatsStore = new Map<string, CacheEntry<unknown>>();
const parkingWeeklyStore = new Map<string, CacheEntry<unknown>>();

const normalizeYears = (years: number[]) => [...years].sort((a, b) => a - b).join(",");

const requestKey = (params: RequestCacheParams) =>
  `requests:${JSON.stringify([
    params.cityId,
    params.year ?? null,
    params.limit,
    params.offset,
    params.radius ?? null,
    params.centerLat ?? null,
    params.centerLon ?? null,
  ])}`;

const statsKey = (params: StatsCacheParams) =>
  `stats:${JSON.stringify([params.cityId, params.year, params.compareYear])}`;

const weeklyKey = (params: WeeklyCacheParams) =>
  `weekly:${JSON.stringify([params.cityId, normalizeYears(params.years)])}`;

const parkingRequestKey = (params: ParkingRequestCacheParams) =>
  `parking_requests:${JSON.stringify([
    params.cityId,
    params.year ?? null,
    params.limit,
    params.offset,
    params.radius ?? null,
    params.centerLat ?? null,
    params.centerLon ?? null,
  ])}`;

const parkingStatsKey = (params: ParkingStatsCacheParams) =>
  `parking_stats:${JSON.stringify([params.cityId, params.year ?? null])}`;

const parkingWeeklyKey = (params: ParkingWeeklyCacheParams) =>
  `parking_weekly:${JSON.stringify([params.cityId, normalizeYears(params.years)])}`;

const readEntry = <T>(store: Map<string, CacheEntry<unknown>>, key: string): T | null => {
  const entry = store.get(key);
  if (!entry) {
    return null;
  }
  if (entry.expiresAt < Date.now()) {
    store.delete(key);
    return null;
  }
  return entry.data as T;
};

const writeEntry = <T>(
  store: Map<string, CacheEntry<unknown>>,
  key: string,
  data: T,
  ttlMs: number
) => {
  store.set(key, { data, expiresAt: Date.now() + ttlMs });
};

export const getRequestsCached = <T>(params: RequestCacheParams): T | null =>
  readEntry<T>(requestStore, requestKey(params));

export const setRequestsCached = <T>(
  params: RequestCacheParams & { data: T; ttlMs?: number }
) => {
  writeEntry(requestStore, requestKey(params), params.data, params.ttlMs ?? 10 * 60 * 1000);
};

export const getStatsCached = <T>(params: StatsCacheParams): T | null =>
  readEntry<T>(statsStore, statsKey(params));

export const setStatsCached = <T>(params: StatsCacheParams & { data: T; ttlMs?: number }) => {
  writeEntry(statsStore, statsKey(params), params.data, params.ttlMs ?? 15 * 60 * 1000);
};

export const getWeeklyCached = <T>(params: WeeklyCacheParams): T | null =>
  readEntry<T>(weeklyStore, weeklyKey(params));

export const setWeeklyCached = <T>(params: WeeklyCacheParams & { data: T; ttlMs?: number }) => {
  writeEntry(weeklyStore, weeklyKey(params), params.data, params.ttlMs ?? 30 * 60 * 1000);
};

export const getParkingRequestsCached = <T>(params: ParkingRequestCacheParams): T | null =>
  readEntry<T>(parkingRequestStore, parkingRequestKey(params));

export const setParkingRequestsCached = <T>(
  params: ParkingRequestCacheParams & { data: T; ttlMs?: number }
) => {
  writeEntry(
    parkingRequestStore,
    parkingRequestKey(params),
    params.data,
    params.ttlMs ?? 10 * 60 * 1000
  );
};

export const getParkingStatsCached = <T>(params: ParkingStatsCacheParams): T | null =>
  readEntry<T>(parkingStatsStore, parkingStatsKey(params));

export const setParkingStatsCached = <T>(
  params: ParkingStatsCacheParams & { data: T; ttlMs?: number }
) => {
  writeEntry(
    parkingStatsStore,
    parkingStatsKey(params),
    params.data,
    params.ttlMs ?? 10 * 60 * 1000
  );
};

export const getParkingWeeklyCached = <T>(params: ParkingWeeklyCacheParams): T | null =>
  readEntry<T>(parkingWeeklyStore, parkingWeeklyKey(params));

export const setParkingWeeklyCached = <T>(
  params: ParkingWeeklyCacheParams & { data: T; ttlMs?: number }
) => {
  writeEntry(
    parkingWeeklyStore,
    parkingWeeklyKey(params),
    params.data,
    params.ttlMs ?? 30 * 60 * 1000
  );
};
