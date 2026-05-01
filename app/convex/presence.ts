import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Update user presence (Heartbeat)
export const update = mutation({
  args: {
    userName: v.string(),
    quotationId: v.union(v.id("quotations"), v.null(), v.any()), // Use union to allow null
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("presence")
      .filter((q) => q.eq(q.field("user_name"), args.userName))
      .unique();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        quotation_id: args.quotationId,
        last_seen: now,
      });
    } else {
      await ctx.db.insert("presence", {
        user_name: args.userName,
        quotation_id: args.quotationId,
        last_seen: now,
      });
    }

    // Cleanup old presence (older than 30 seconds)
    const staleThreshold = now - 30000;
    const stale = await ctx.db
      .query("presence")
      .filter((q) => q.lt(q.field("last_seen"), staleThreshold))
      .collect();

    for (const s of stale) {
      await ctx.db.delete(s._id);
    }
  },
});

// List users on a specific quotation
export const listByQuotation = query({
  args: { quotationId: v.union(v.id("quotations"), v.null(), v.any()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("presence")
      .filter((q) => q.eq(q.field("quotation_id"), args.quotationId))
      .collect();
  },
});

// List all active users (for dashboard)
export const listAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("presence").collect();
  },
});
