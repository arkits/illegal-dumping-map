import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const requests = sqliteTable("requests", {
  id: text("id").primaryKey(),
  srx: real("srx"),
  sry: real("sry"),
  lat: real("lat"),
  lon: real("lon"),
  datetimeinit: text("datetimeinit"),
  status: text("status"),
  reqcategory: text("reqcategory"),
  description: text("description"),
  address: text("address"),
  neighborhood: text("neighborhood"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const cacheMetadata = sqliteTable("cache_metadata", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  expiresAt: text("expires_at"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const cacheRequests = sqliteTable("cache_requests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  cityId: text("city_id").notNull(),
  year: integer("year"),
  limitValue: integer("limit_value").notNull(),
  offsetValue: integer("offset_value").notNull(),
  radius: real("radius"),
  centerLat: real("center_lat"),
  centerLon: real("center_lon"),
  data: text("data").notNull(),
  expiresAt: integer("expires_at").notNull(),
  createdAt: integer("created_at").notNull(),
});

export const cacheStats = sqliteTable("cache_stats", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  cityId: text("city_id").notNull(),
  year: integer("year").notNull(),
  compareYear: integer("compare_year").notNull(),
  data: text("data").notNull(),
  expiresAt: integer("expires_at").notNull(),
  createdAt: integer("created_at").notNull(),
});

export const cacheWeekly = sqliteTable("cache_weekly", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  cityId: text("city_id").notNull(),
  yearsKey: text("years_key").notNull(),
  data: text("data").notNull(),
  expiresAt: integer("expires_at").notNull(),
  createdAt: integer("created_at").notNull(),
});

export const cacheParkingRequests = sqliteTable("cache_parking_requests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  cityId: text("city_id").notNull(),
  year: integer("year"),
  limitValue: integer("limit_value").notNull(),
  offsetValue: integer("offset_value").notNull(),
  radius: real("radius"),
  centerLat: real("center_lat"),
  centerLon: real("center_lon"),
  data: text("data").notNull(),
  expiresAt: integer("expires_at").notNull(),
  createdAt: integer("created_at").notNull(),
});

export const cacheParkingStats = sqliteTable("cache_parking_stats", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  cityId: text("city_id").notNull(),
  year: integer("year"),
  data: text("data").notNull(),
  expiresAt: integer("expires_at").notNull(),
  createdAt: integer("created_at").notNull(),
});

export const cacheParkingWeekly = sqliteTable("cache_parking_weekly", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  cityId: text("city_id").notNull(),
  yearsKey: text("years_key").notNull(),
  data: text("data").notNull(),
  expiresAt: integer("expires_at").notNull(),
  createdAt: integer("created_at").notNull(),
});
