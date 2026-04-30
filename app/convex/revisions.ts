import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    quotationId: v.id("quotations"),
    note: v.string(),
    snapshot: v.any(),
    changedBy: v.string(),
  },
  handler: async (ctx, args) => {
    // Get existing revisions to determine version number
    const existing = await ctx.db
      .query("revisions")
      .withIndex("by_quotation", (q) => q.eq("quotation_id", args.quotationId))
      .collect();

    const versionNo = existing.length + 1;

    const revisionId = await ctx.db.insert("revisions", {
      quotation_id: args.quotationId,
      version_no: versionNo,
      change_note: args.note,
      snapshot: args.snapshot,
      changed_by: args.changedBy,
      created_at: new Date().toISOString(),
    });

    return revisionId;
  },
});

export const list = query({
  args: { quotationId: v.id("quotations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("revisions")
      .withIndex("by_quotation", (q) => q.eq("quotation_id", args.quotationId))
      .order("desc")
      .collect();
  },
});
