import { query, mutation, internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get a cache entry by key and type.
 * Returns null if not found or expired.
 */
export const get = query({
  args: {
    cacheKey: v.string(),
    cacheType: v.union(
      v.literal("socrata_raw"),
      v.literal("requests"),
      v.literal("stats"),
      v.literal("weekly")
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const entry = await ctx.db
      .query("cacheEntries")
      .withIndex("by_key_type", (q) =>
        q.eq("cacheKey", args.cacheKey).eq("cacheType", args.cacheType)
      )
      .first();

    if (!entry) {
      return null;
    }

    // Check if expired - return null if expired (cleanup happens via clearExpired action)
    if (entry.expiresAt < now) {
      return null;
    }

    return entry.data;
  },
});

/**
 * Set a cache entry with TTL.
 */
export const set = mutation({
  args: {
    cacheKey: v.string(),
    cacheType: v.union(
      v.literal("socrata_raw"),
      v.literal("requests"),
      v.literal("stats"),
      v.literal("weekly")
    ),
    cityId: v.union(v.literal("oakland"), v.literal("sanfrancisco"), v.literal("losangeles")),
    data: v.any(),
    ttlMs: v.number(), // Time to live in milliseconds
    metadata: v.optional(v.object({
      year: v.optional(v.number()),
      limit: v.optional(v.number()),
      offset: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const expiresAt = now + args.ttlMs;

    // Check if entry already exists
    const existing = await ctx.db
      .query("cacheEntries")
      .withIndex("by_key_type", (q) =>
        q.eq("cacheKey", args.cacheKey).eq("cacheType", args.cacheType)
      )
      .first();

    if (existing) {
      // Update existing entry
      await ctx.db.patch(existing._id, {
        data: args.data,
        expiresAt,
        metadata: args.metadata,
      });
    } else {
      // Create new entry
      await ctx.db.insert("cacheEntries", {
        cacheKey: args.cacheKey,
        cacheType: args.cacheType,
        cityId: args.cityId,
        data: args.data,
        expiresAt,
        createdAt: now,
        metadata: args.metadata,
      });
    }
  },
});

/**
 * Invalidate cache entries by key and type, or by city.
 */
export const invalidate = mutation({
  args: {
    cacheKey: v.optional(v.string()),
    cacheType: v.optional(v.union(
      v.literal("socrata_raw"),
      v.literal("requests"),
      v.literal("stats"),
      v.literal("weekly")
    )),
    cityId: v.optional(v.union(v.literal("oakland"), v.literal("sanfrancisco"), v.literal("losangeles"))),
  },
  handler: async (ctx, args) => {
    if (args.cacheKey && args.cacheType) {
      // Delete specific entry
      const cacheKey = args.cacheKey;
      const cacheType = args.cacheType;
      const entry = await ctx.db
        .query("cacheEntries")
        .withIndex("by_key_type", (q) =>
          q.eq("cacheKey", cacheKey).eq("cacheType", cacheType)
        )
        .first();
      
      if (entry) {
        await ctx.db.delete(entry._id);
      }
    } else if (args.cityId) {
      // Delete all entries for a city
      const cityId = args.cityId;
      const entries = await ctx.db
        .query("cacheEntries")
        .withIndex("by_city_expires", (q) => q.eq("cityId", cityId))
        .collect();
      
      for (const entry of entries) {
        await ctx.db.delete(entry._id);
      }
    }
  },
});

/**
 * Internal query to get expired entry IDs.
 */
export const getExpired = internalQuery({
  args: {
    now: v.number(),
  },
  handler: async (ctx, args) => {
    const entries = await ctx.db
      .query("cacheEntries")
      .withIndex("by_expires")
      .filter((q) => q.lt(q.field("expiresAt"), args.now))
      .collect();

    return entries.map((e) => e._id);
  },
});

/**
 * Internal mutation to delete an entry by ID.
 */
export const deleteEntry = internalMutation({
  args: {
    entryId: v.id("cacheEntries"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.entryId);
  },
});
