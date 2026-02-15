import { sqlite } from "@/db";

export type CityId =
  | "oakland"
  | "sanfrancisco"
  | "losangeles"
  | "newyork"
  | "chicago"
  | "seattle"
  | "dallas"
  | "montgomery"
  | "kansascity";

export type ParkingCityId = "oakland" | "sanfrancisco" | "losangeles";

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

const PRUNE_INTERVAL_MS = 10 * 60 * 1000;
let lastPruneAt = 0;

const pruneStatements = [
  sqlite.prepare("DELETE FROM cache_requests WHERE expires_at < ?"),
  sqlite.prepare("DELETE FROM cache_stats WHERE expires_at < ?"),
  sqlite.prepare("DELETE FROM cache_weekly WHERE expires_at < ?"),
  sqlite.prepare("DELETE FROM cache_parking_requests WHERE expires_at < ?"),
  sqlite.prepare("DELETE FROM cache_parking_stats WHERE expires_at < ?"),
  sqlite.prepare("DELETE FROM cache_parking_weekly WHERE expires_at < ?"),
];

function pruneExpiredIfNeeded(now: number) {
  if (now - lastPruneAt < PRUNE_INTERVAL_MS) {
    return;
  }
  lastPruneAt = now;
  for (const stmt of pruneStatements) {
    stmt.run(now);
  }
}

const getRequestStmt = sqlite.prepare(`
  SELECT id, data, expires_at
  FROM cache_requests
  WHERE city_id = ?
    AND year IS ?
    AND limit_value = ?
    AND offset_value = ?
    AND radius IS ?
    AND center_lat IS ?
    AND center_lon IS ?
  LIMIT 1
`);

const getRequestIdStmt = sqlite.prepare(`
  SELECT id
  FROM cache_requests
  WHERE city_id = ?
    AND year IS ?
    AND limit_value = ?
    AND offset_value = ?
    AND radius IS ?
    AND center_lat IS ?
    AND center_lon IS ?
  LIMIT 1
`);

const insertRequestStmt = sqlite.prepare(`
  INSERT INTO cache_requests (
    city_id,
    year,
    limit_value,
    offset_value,
    radius,
    center_lat,
    center_lon,
    data,
    expires_at,
    created_at
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const updateRequestStmt = sqlite.prepare(`
  UPDATE cache_requests
  SET data = ?, expires_at = ?
  WHERE id = ?
`);

const deleteRequestStmt = sqlite.prepare("DELETE FROM cache_requests WHERE id = ?");

const getStatsStmt = sqlite.prepare(`
  SELECT id, data, expires_at
  FROM cache_stats
  WHERE city_id = ? AND year = ? AND compare_year = ?
  LIMIT 1
`);

const getStatsIdStmt = sqlite.prepare(`
  SELECT id
  FROM cache_stats
  WHERE city_id = ? AND year = ? AND compare_year = ?
  LIMIT 1
`);

const insertStatsStmt = sqlite.prepare(`
  INSERT INTO cache_stats (
    city_id,
    year,
    compare_year,
    data,
    expires_at,
    created_at
  )
  VALUES (?, ?, ?, ?, ?, ?)
`);

const updateStatsStmt = sqlite.prepare(`
  UPDATE cache_stats
  SET data = ?, expires_at = ?
  WHERE id = ?
`);

const deleteStatsStmt = sqlite.prepare("DELETE FROM cache_stats WHERE id = ?");

const getWeeklyStmt = sqlite.prepare(`
  SELECT id, data, expires_at
  FROM cache_weekly
  WHERE city_id = ? AND years_key = ?
  LIMIT 1
`);

const getWeeklyIdStmt = sqlite.prepare(`
  SELECT id
  FROM cache_weekly
  WHERE city_id = ? AND years_key = ?
  LIMIT 1
`);

const insertWeeklyStmt = sqlite.prepare(`
  INSERT INTO cache_weekly (
    city_id,
    years_key,
    data,
    expires_at,
    created_at
  )
  VALUES (?, ?, ?, ?, ?)
`);

const updateWeeklyStmt = sqlite.prepare(`
  UPDATE cache_weekly
  SET data = ?, expires_at = ?
  WHERE id = ?
`);

const deleteWeeklyStmt = sqlite.prepare("DELETE FROM cache_weekly WHERE id = ?");

const getParkingRequestStmt = sqlite.prepare(`
  SELECT id, data, expires_at
  FROM cache_parking_requests
  WHERE city_id = ?
    AND year IS ?
    AND limit_value = ?
    AND offset_value = ?
    AND radius IS ?
    AND center_lat IS ?
    AND center_lon IS ?
  LIMIT 1
`);

const getParkingRequestIdStmt = sqlite.prepare(`
  SELECT id
  FROM cache_parking_requests
  WHERE city_id = ?
    AND year IS ?
    AND limit_value = ?
    AND offset_value = ?
    AND radius IS ?
    AND center_lat IS ?
    AND center_lon IS ?
  LIMIT 1
`);

const insertParkingRequestStmt = sqlite.prepare(`
  INSERT INTO cache_parking_requests (
    city_id,
    year,
    limit_value,
    offset_value,
    radius,
    center_lat,
    center_lon,
    data,
    expires_at,
    created_at
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const updateParkingRequestStmt = sqlite.prepare(`
  UPDATE cache_parking_requests
  SET data = ?, expires_at = ?
  WHERE id = ?
`);

const deleteParkingRequestStmt = sqlite.prepare("DELETE FROM cache_parking_requests WHERE id = ?");

const getParkingStatsStmt = sqlite.prepare(`
  SELECT id, data, expires_at
  FROM cache_parking_stats
  WHERE city_id = ? AND year IS ?
  LIMIT 1
`);

const getParkingStatsIdStmt = sqlite.prepare(`
  SELECT id
  FROM cache_parking_stats
  WHERE city_id = ? AND year IS ?
  LIMIT 1
`);

const insertParkingStatsStmt = sqlite.prepare(`
  INSERT INTO cache_parking_stats (
    city_id,
    year,
    data,
    expires_at,
    created_at
  )
  VALUES (?, ?, ?, ?, ?)
`);

const updateParkingStatsStmt = sqlite.prepare(`
  UPDATE cache_parking_stats
  SET data = ?, expires_at = ?
  WHERE id = ?
`);

const deleteParkingStatsStmt = sqlite.prepare("DELETE FROM cache_parking_stats WHERE id = ?");

const getParkingWeeklyStmt = sqlite.prepare(`
  SELECT id, data, expires_at
  FROM cache_parking_weekly
  WHERE city_id = ? AND years_key = ?
  LIMIT 1
`);

const getParkingWeeklyIdStmt = sqlite.prepare(`
  SELECT id
  FROM cache_parking_weekly
  WHERE city_id = ? AND years_key = ?
  LIMIT 1
`);

const insertParkingWeeklyStmt = sqlite.prepare(`
  INSERT INTO cache_parking_weekly (
    city_id,
    years_key,
    data,
    expires_at,
    created_at
  )
  VALUES (?, ?, ?, ?, ?)
`);

const updateParkingWeeklyStmt = sqlite.prepare(`
  UPDATE cache_parking_weekly
  SET data = ?, expires_at = ?
  WHERE id = ?
`);

const deleteParkingWeeklyStmt = sqlite.prepare("DELETE FROM cache_parking_weekly WHERE id = ?");

function normalizeYears(years: number[]): string {
  return [...years].sort((a, b) => a - b).join(",");
}

export function getRequestsCached<T>(params: RequestCacheParams): T | null {
  const now = Date.now();
  pruneExpiredIfNeeded(now);

  const row = getRequestStmt.get(
    params.cityId,
    params.year ?? null,
    params.limit,
    params.offset,
    params.radius ?? null,
    params.centerLat ?? null,
    params.centerLon ?? null
  ) as { id: number; data: string; expires_at: number } | undefined;

  if (!row) {
    return null;
  }

  if (row.expires_at < now) {
    deleteRequestStmt.run(row.id);
    return null;
  }

  return JSON.parse(row.data) as T;
}

export function setRequestsCached<T>(params: RequestCacheParams & { data: T; ttlMs?: number }) {
  const now = Date.now();
  pruneExpiredIfNeeded(now);
  const expiresAt = now + (params.ttlMs ?? 10 * 60 * 1000);
  const payload = JSON.stringify(params.data);

  const existing = getRequestIdStmt.get(
    params.cityId,
    params.year ?? null,
    params.limit,
    params.offset,
    params.radius ?? null,
    params.centerLat ?? null,
    params.centerLon ?? null
  ) as { id: number } | undefined;

  if (existing) {
    updateRequestStmt.run(payload, expiresAt, existing.id);
  } else {
    insertRequestStmt.run(
      params.cityId,
      params.year ?? null,
      params.limit,
      params.offset,
      params.radius ?? null,
      params.centerLat ?? null,
      params.centerLon ?? null,
      payload,
      expiresAt,
      now
    );
  }
}

export function getStatsCached<T>(params: StatsCacheParams): T | null {
  const now = Date.now();
  pruneExpiredIfNeeded(now);

  const row = getStatsStmt.get(params.cityId, params.year, params.compareYear) as
    | { id: number; data: string; expires_at: number }
    | undefined;

  if (!row) {
    return null;
  }

  if (row.expires_at < now) {
    deleteStatsStmt.run(row.id);
    return null;
  }

  return JSON.parse(row.data) as T;
}

export function setStatsCached<T>(params: StatsCacheParams & { data: T; ttlMs?: number }) {
  const now = Date.now();
  pruneExpiredIfNeeded(now);
  const expiresAt = now + (params.ttlMs ?? 15 * 60 * 1000);
  const payload = JSON.stringify(params.data);

  const existing = getStatsIdStmt.get(params.cityId, params.year, params.compareYear) as
    | { id: number }
    | undefined;

  if (existing) {
    updateStatsStmt.run(payload, expiresAt, existing.id);
  } else {
    insertStatsStmt.run(
      params.cityId,
      params.year,
      params.compareYear,
      payload,
      expiresAt,
      now
    );
  }
}

export function getWeeklyCached<T>(params: WeeklyCacheParams): T | null {
  const now = Date.now();
  pruneExpiredIfNeeded(now);
  const yearsKey = normalizeYears(params.years);

  const row = getWeeklyStmt.get(params.cityId, yearsKey) as
    | { id: number; data: string; expires_at: number }
    | undefined;

  if (!row) {
    return null;
  }

  if (row.expires_at < now) {
    deleteWeeklyStmt.run(row.id);
    return null;
  }

  return JSON.parse(row.data) as T;
}

export function setWeeklyCached<T>(params: WeeklyCacheParams & { data: T; ttlMs?: number }) {
  const now = Date.now();
  pruneExpiredIfNeeded(now);
  const yearsKey = normalizeYears(params.years);
  const expiresAt = now + (params.ttlMs ?? 30 * 60 * 1000);
  const payload = JSON.stringify(params.data);

  const existing = getWeeklyIdStmt.get(params.cityId, yearsKey) as { id: number } | undefined;

  if (existing) {
    updateWeeklyStmt.run(payload, expiresAt, existing.id);
  } else {
    insertWeeklyStmt.run(params.cityId, yearsKey, payload, expiresAt, now);
  }
}

export function getParkingRequestsCached<T>(params: ParkingRequestCacheParams): T | null {
  const now = Date.now();
  pruneExpiredIfNeeded(now);

  const row = getParkingRequestStmt.get(
    params.cityId,
    params.year ?? null,
    params.limit,
    params.offset,
    params.radius ?? null,
    params.centerLat ?? null,
    params.centerLon ?? null
  ) as { id: number; data: string; expires_at: number } | undefined;

  if (!row) {
    return null;
  }

  if (row.expires_at < now) {
    deleteParkingRequestStmt.run(row.id);
    return null;
  }

  return JSON.parse(row.data) as T;
}

export function setParkingRequestsCached<T>(
  params: ParkingRequestCacheParams & { data: T; ttlMs?: number }
) {
  const now = Date.now();
  pruneExpiredIfNeeded(now);
  const expiresAt = now + (params.ttlMs ?? 10 * 60 * 1000);
  const payload = JSON.stringify(params.data);

  const existing = getParkingRequestIdStmt.get(
    params.cityId,
    params.year ?? null,
    params.limit,
    params.offset,
    params.radius ?? null,
    params.centerLat ?? null,
    params.centerLon ?? null
  ) as { id: number } | undefined;

  if (existing) {
    updateParkingRequestStmt.run(payload, expiresAt, existing.id);
  } else {
    insertParkingRequestStmt.run(
      params.cityId,
      params.year ?? null,
      params.limit,
      params.offset,
      params.radius ?? null,
      params.centerLat ?? null,
      params.centerLon ?? null,
      payload,
      expiresAt,
      now
    );
  }
}

export function getParkingStatsCached<T>(params: ParkingStatsCacheParams): T | null {
  const now = Date.now();
  pruneExpiredIfNeeded(now);

  const row = getParkingStatsStmt.get(params.cityId, params.year ?? null) as
    | { id: number; data: string; expires_at: number }
    | undefined;

  if (!row) {
    return null;
  }

  if (row.expires_at < now) {
    deleteParkingStatsStmt.run(row.id);
    return null;
  }

  return JSON.parse(row.data) as T;
}

export function setParkingStatsCached<T>(
  params: ParkingStatsCacheParams & { data: T; ttlMs?: number }
) {
  const now = Date.now();
  pruneExpiredIfNeeded(now);
  const expiresAt = now + (params.ttlMs ?? 10 * 60 * 1000);
  const payload = JSON.stringify(params.data);

  const existing = getParkingStatsIdStmt.get(params.cityId, params.year ?? null) as
    | { id: number }
    | undefined;

  if (existing) {
    updateParkingStatsStmt.run(payload, expiresAt, existing.id);
  } else {
    insertParkingStatsStmt.run(params.cityId, params.year ?? null, payload, expiresAt, now);
  }
}

export function getParkingWeeklyCached<T>(params: ParkingWeeklyCacheParams): T | null {
  const now = Date.now();
  pruneExpiredIfNeeded(now);
  const yearsKey = normalizeYears(params.years);

  const row = getParkingWeeklyStmt.get(params.cityId, yearsKey) as
    | { id: number; data: string; expires_at: number }
    | undefined;

  if (!row) {
    return null;
  }

  if (row.expires_at < now) {
    deleteParkingWeeklyStmt.run(row.id);
    return null;
  }

  return JSON.parse(row.data) as T;
}

export function setParkingWeeklyCached<T>(
  params: ParkingWeeklyCacheParams & { data: T; ttlMs?: number }
) {
  const now = Date.now();
  pruneExpiredIfNeeded(now);
  const yearsKey = normalizeYears(params.years);
  const expiresAt = now + (params.ttlMs ?? 30 * 60 * 1000);
  const payload = JSON.stringify(params.data);

  const existing = getParkingWeeklyIdStmt.get(params.cityId, yearsKey) as
    | { id: number }
    | undefined;

  if (existing) {
    updateParkingWeeklyStmt.run(payload, expiresAt, existing.id);
  } else {
    insertParkingWeeklyStmt.run(params.cityId, yearsKey, payload, expiresAt, now);
  }
}
