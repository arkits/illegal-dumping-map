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
