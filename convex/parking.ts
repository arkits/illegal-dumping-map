import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

type ParkingCityId = "oakland" | "sanfrancisco" | "losangeles";

/**
 * Generate cache key for parking citations query.
 */
function generateCacheKey(params: {
  cityId: ParkingCityId;
  year?: number;
  limit: number;
  offset: number;
  radius?: number;
  centerLat?: number;
  centerLon?: number;
}): string {
  const parts = [
    "parking_citations",
    params.cityId,
    params.year ?? "all",
    params.limit,
    params.offset,
    params.radius ?? "none",
    params.centerLat ?? "none",
    params.centerLon ?? "none",
  ];
  return parts.join(":");
}

/**
 * Get cached parking citations or return null if not cached.
 */
export const getCached = query({
  args: {
    cityId: v.union(
      v.literal("oakland"),
      v.literal("sanfrancisco"),
      v.literal("losangeles")
    ),
    year: v.optional(v.number()),
    limit: v.number(),
    offset: v.number(),
    radius: v.optional(v.number()),
    centerLat: v.optional(v.number()),
    centerLon: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<any | null> => {
    const cacheKey = generateCacheKey({
      cityId: args.cityId,
      year: args.year,
      limit: args.limit,
      offset: args.offset,
      radius: args.radius,
      centerLat: args.centerLat,
      centerLon: args.centerLon,
    });

    return await ctx.runQuery(api.cache.get, {
      cacheKey,
      cacheType: "parking_citations",
    });
  },
});

/**
 * Cache parking citations data.
 */
export const setCached = mutation({
  args: {
    cityId: v.union(
      v.literal("oakland"),
      v.literal("sanfrancisco"),
      v.literal("losangeles")
    ),
    year: v.optional(v.number()),
    limit: v.number(),
    offset: v.number(),
    radius: v.optional(v.number()),
    centerLat: v.optional(v.number()),
    centerLon: v.optional(v.number()),
    data: v.any(),
    ttlMs: v.optional(v.number()), // Default: 10 minutes
  },
  handler: async (ctx, args): Promise<void> => {
    const cacheKey = generateCacheKey({
      cityId: args.cityId,
      year: args.year,
      limit: args.limit,
      offset: args.offset,
      radius: args.radius,
      centerLat: args.centerLat,
      centerLon: args.centerLon,
    });

    await ctx.runMutation(api.cache.set, {
      cacheKey,
      cacheType: "parking_citations",
      cityId: args.cityId,
      data: args.data,
      ttlMs: args.ttlMs ?? 10 * 60 * 1000, // 10 minutes default
      metadata: {
        year: args.year,
        limit: args.limit,
        offset: args.offset,
      },
    });
  },
});

/**
 * Get cached parking stats or return null if not cached.
 */
export const getStatsCached = query({
  args: {
    cityId: v.union(
      v.literal("oakland"),
      v.literal("sanfrancisco"),
      v.literal("losangeles")
    ),
    year: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<any | null> => {
    const cacheKey = `parking_stats:${args.cityId}:${args.year ?? "all"}`;

    return await ctx.runQuery(api.cache.get, {
      cacheKey,
      cacheType: "parking_stats",
    });
  },
});

/**
 * Cache parking stats data.
 */
export const setStatsCached = mutation({
  args: {
    cityId: v.union(
      v.literal("oakland"),
      v.literal("sanfrancisco"),
      v.literal("losangeles")
    ),
    year: v.optional(v.number()),
    data: v.any(),
    ttlMs: v.optional(v.number()), // Default: 10 minutes
  },
  handler: async (ctx, args): Promise<void> => {
    const cacheKey = `parking_stats:${args.cityId}:${args.year ?? "all"}`;

    await ctx.runMutation(api.cache.set, {
      cacheKey,
      cacheType: "parking_stats",
      cityId: args.cityId,
      data: args.data,
      ttlMs: args.ttlMs ?? 10 * 60 * 1000, // 10 minutes default
      metadata: {
        year: args.year,
      },
    });
  },
});

/**
 * Get cached parking weekly data or return null if not cached.
 */
export const getWeeklyCached = query({
  args: {
    cityId: v.union(
      v.literal("oakland"),
      v.literal("sanfrancisco"),
      v.literal("losangeles")
    ),
    years: v.array(v.number()),
  },
  handler: async (ctx, args): Promise<any | null> => {
    const cacheKey = `parking_weekly:${args.cityId}:${args.years.join(",")}`;

    return await ctx.runQuery(api.cache.get, {
      cacheKey,
      cacheType: "parking_weekly",
    });
  },
});

/**
 * Cache parking weekly data.
 */
export const setWeeklyCached = mutation({
  args: {
    cityId: v.union(
      v.literal("oakland"),
      v.literal("sanfrancisco"),
      v.literal("losangeles")
    ),
    years: v.array(v.number()),
    data: v.any(),
    ttlMs: v.optional(v.number()), // Default: 30 minutes
  },
  handler: async (ctx, args): Promise<void> => {
    const cacheKey = `parking_weekly:${args.cityId}:${args.years.join(",")}`;

    await ctx.runMutation(api.cache.set, {
      cacheKey,
      cacheType: "parking_weekly",
      cityId: args.cityId,
      data: args.data,
      ttlMs: args.ttlMs ?? 30 * 60 * 1000, // 30 minutes default
      metadata: {
        year: args.years[0], // Store first year as metadata
      },
    });
  },
});
