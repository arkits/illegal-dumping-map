import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

type CityId = "oakland" | "sanfrancisco" | "losangeles" | "newyork" | "chicago" | "seattle" | "dallas" | "montgomery" | "kansascity";

/**
 * Generate cache key for weekly data query.
 */
function generateCacheKey(params: {
  cityId: CityId;
  years: number[];
}): string {
  const yearsStr = params.years.sort((a, b) => a - b).join(",");
  return `weekly:${params.cityId}:${yearsStr}`;
}

/**
 * Get cached weekly data or return null if not cached.
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
    years: v.array(v.number()),
  },
  handler: async (ctx, args): Promise<any | null> => {
    const cacheKey = generateCacheKey({
      cityId: args.cityId,
      years: args.years,
    });

    return await ctx.runQuery(api.cache.get, {
      cacheKey,
      cacheType: "weekly",
    });
  },
});

/**
 * Cache weekly data.
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
    years: v.array(v.number()),
    data: v.any(),
    ttlMs: v.optional(v.number()), // Default: 30 minutes
  },
  handler: async (ctx, args): Promise<void> => {
    const cacheKey = generateCacheKey({
      cityId: args.cityId,
      years: args.years,
    });

    await ctx.runMutation(api.cache.set, {
      cacheKey,
      cacheType: "weekly",
      cityId: args.cityId,
      data: args.data,
      ttlMs: args.ttlMs ?? 30 * 60 * 1000, // 30 minutes default
    });
  },
});
