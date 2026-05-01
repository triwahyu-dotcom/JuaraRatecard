import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const log = mutation({
  args: {
    quotationId: v.id("quotations"),
    userName: v.string(),
    type: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("activities", {
      quotation_id: args.quotationId,
      user_name: args.userName,
      type: args.type,
      description: args.description,
      created_at: new Date().toISOString(),
    });
  },
});

export const listByQuotation = query({
  args: { quotationId: v.id("quotations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("activities")
      .withIndex("by_quotation", (q) => q.eq("quotation_id", args.quotationId))
      .order("desc")
      .take(50);
  },
});
