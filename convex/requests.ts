import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

type CityId = "oakland" | "sanfrancisco" | "losangeles";

/**
 * Generate cache key for requests query.
 */
function generateCacheKey(params: {
  cityId: CityId;
  year?: number;
  limit: number;
  offset: number;
  radius?: number;
  centerLat?: number;
  centerLon?: number;
}): string {
  const parts = [
    "requests",
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
 * Get cached requests or return null if not cached.
 */
export const getCached = query({
  args: {
    cityId: v.union(v.literal("oakland"), v.literal("sanfrancisco"), v.literal("losangeles")),
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
      cacheType: "requests",
    });
  },
});

/**
 * Cache requests data.
 */
export const setCached = mutation({
  args: {
    cityId: v.union(v.literal("oakland"), v.literal("sanfrancisco"), v.literal("losangeles")),
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
      cacheType: "requests",
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
