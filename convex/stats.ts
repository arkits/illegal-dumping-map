import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

type CityId = "oakland" | "sanfrancisco" | "losangeles" | "newyork" | "chicago" | "seattle" | "dallas" | "montgomery" | "kansascity";

/**
 * Generate cache key for stats query.
 */
function generateCacheKey(params: {
  cityId: CityId;
  year: number;
  compareYear: number;
}): string {
  return `stats:${params.cityId}:${params.year}:${params.compareYear}`;
}

/**
 * Get cached stats or return null if not cached.
 */
export const getCached = query({
  args: {
    cityId: v.union(
      v.literal("oakland"),
      v.literal("sanfrancisco"),
      v.literal("losangeles"),
      v.literal("newyork"),
      v.literal("chicago"),
      v.literal("seattle"),
      v.literal("dallas"),
      v.literal("montgomery"),
      v.literal("kansascity")
    ),
    year: v.number(),
    compareYear: v.number(),
  },
  handler: async (ctx, args): Promise<any | null> => {
    const cacheKey = generateCacheKey({
      cityId: args.cityId,
      year: args.year,
      compareYear: args.compareYear,
    });

    return await ctx.runQuery(api.cache.get, {
      cacheKey,
      cacheType: "stats",
    });
  },
});

/**
 * Cache stats data.
 */
export const setCached = mutation({
  args: {
    cityId: v.union(
      v.literal("oakland"),
      v.literal("sanfrancisco"),
      v.literal("losangeles"),
      v.literal("newyork"),
      v.literal("chicago"),
      v.literal("seattle"),
      v.literal("dallas"),
      v.literal("montgomery"),
      v.literal("kansascity")
    ),
    year: v.number(),
    compareYear: v.number(),
    data: v.any(),
    ttlMs: v.optional(v.number()), // Default: 15 minutes
  },
  handler: async (ctx, args): Promise<void> => {
    const cacheKey = generateCacheKey({
      cityId: args.cityId,
      year: args.year,
      compareYear: args.compareYear,
    });

    await ctx.runMutation(api.cache.set, {
      cacheKey,
      cacheType: "stats",
      cityId: args.cityId,
      data: args.data,
      ttlMs: args.ttlMs ?? 15 * 60 * 1000, // 15 minutes default
      metadata: {
        year: args.year,
      },
    });
  },
});
