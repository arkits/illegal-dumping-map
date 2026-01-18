import { action } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * Clear all expired cache entries.
 * This should be run periodically (e.g., via scheduled action).
 */
export const clearExpired = action({
  args: {},
  handler: async (ctx): Promise<{ deleted: number }> => {
    const now = Date.now();
    
    // Query for expired entries directly
    const expiredEntriesQuery = await ctx.runQuery(internal.cache.getExpired, { now });

    // Delete expired entries directly
    for (const entryId of expiredEntriesQuery) {
      await ctx.runMutation(internal.cache.deleteEntry, { entryId });
    }

    return { deleted: expiredEntriesQuery.length };
  },
});
