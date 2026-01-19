import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  cacheEntries: defineTable({
    // Composite key: type + cacheKey
    cacheKey: v.string(), // e.g., "socrata:url" or "requests:cityId:year:limit:offset"
    cacheType: v.union(
      v.literal("socrata_raw"),      // Raw Socrata API response
      v.literal("requests"),         // Processed DumpingRequest[]
      v.literal("stats"),            // Aggregated stats
      v.literal("weekly")            // Weekly trend data
    ),
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
    data: v.any(), // JSON-serializable cached data
    expiresAt: v.number(), // Unix timestamp
    createdAt: v.number(), // Unix timestamp
    metadata: v.optional(v.object({
      year: v.optional(v.number()),
      limit: v.optional(v.number()),
      offset: v.optional(v.number()),
    })),
  })
    .index("by_key_type", ["cacheKey", "cacheType"])
    .index("by_city_expires", ["cityId", "expiresAt"])
    .index("by_expires", ["expiresAt"]),
});
