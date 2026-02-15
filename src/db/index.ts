import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import * as schema from "./schema";

const rawPath =
  process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "illegal-dumping.db");
let dbPath = rawPath;
if (rawPath !== ":memory:") {
  dbPath = path.isAbsolute(rawPath) ? rawPath : path.join(process.cwd(), rawPath);
}

if (dbPath !== ":memory:") {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

export const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS requests (
    id TEXT PRIMARY KEY,
    srx REAL,
    sry REAL,
    lat REAL,
    lon REAL,
    datetimeinit TEXT,
    status TEXT,
    reqcategory TEXT,
    description TEXT,
    address TEXT,
    neighborhood TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS cache_metadata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    expires_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS cache_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    city_id TEXT NOT NULL,
    year INTEGER,
    limit_value INTEGER NOT NULL,
    offset_value INTEGER NOT NULL,
    radius REAL,
    center_lat REAL,
    center_lon REAL,
    data TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS cache_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    city_id TEXT NOT NULL,
    year INTEGER NOT NULL,
    compare_year INTEGER NOT NULL,
    data TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS cache_weekly (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    city_id TEXT NOT NULL,
    years_key TEXT NOT NULL,
    data TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS cache_parking_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    city_id TEXT NOT NULL,
    year INTEGER,
    limit_value INTEGER NOT NULL,
    offset_value INTEGER NOT NULL,
    radius REAL,
    center_lat REAL,
    center_lon REAL,
    data TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS cache_parking_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    city_id TEXT NOT NULL,
    year INTEGER,
    data TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS cache_parking_weekly (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    city_id TEXT NOT NULL,
    years_key TEXT NOT NULL,
    data TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_cache_requests_lookup
    ON cache_requests(city_id, year, limit_value, offset_value, radius, center_lat, center_lon);
  CREATE INDEX IF NOT EXISTS idx_cache_requests_expires ON cache_requests(expires_at);

  CREATE INDEX IF NOT EXISTS idx_cache_stats_lookup
    ON cache_stats(city_id, year, compare_year);
  CREATE INDEX IF NOT EXISTS idx_cache_stats_expires ON cache_stats(expires_at);

  CREATE INDEX IF NOT EXISTS idx_cache_weekly_lookup
    ON cache_weekly(city_id, years_key);
  CREATE INDEX IF NOT EXISTS idx_cache_weekly_expires ON cache_weekly(expires_at);

  CREATE INDEX IF NOT EXISTS idx_cache_parking_requests_lookup
    ON cache_parking_requests(city_id, year, limit_value, offset_value, radius, center_lat, center_lon);
  CREATE INDEX IF NOT EXISTS idx_cache_parking_requests_expires ON cache_parking_requests(expires_at);

  CREATE INDEX IF NOT EXISTS idx_cache_parking_stats_lookup
    ON cache_parking_stats(city_id, year);
  CREATE INDEX IF NOT EXISTS idx_cache_parking_stats_expires ON cache_parking_stats(expires_at);

  CREATE INDEX IF NOT EXISTS idx_cache_parking_weekly_lookup
    ON cache_parking_weekly(city_id, years_key);
  CREATE INDEX IF NOT EXISTS idx_cache_parking_weekly_expires ON cache_parking_weekly(expires_at);
`);

export const db = drizzle(sqlite, { schema });
