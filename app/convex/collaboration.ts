import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Fetch comments for a quotation
export const getComments = query({
  args: { quotationId: v.id("quotations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("comments")
      .withIndex("by_quotation", (q) => q.eq("quotation_id", args.quotationId))
      .collect();
  },
});

// Add a comment
export const addComment = mutation({
  args: {
    quotationId: v.id("quotations"),
    userName: v.string(),
    text: v.string(),
    rowKey: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("comments", {
      quotation_id: args.quotationId,
      user_name: args.userName,
      text: args.text,
      row_key: args.rowKey,
      created_at: new Date().toISOString(),
    });
  },
});

// Create a revision snapshot
export const createRevision = mutation({
  args: {
    quotationId: v.id("quotations"),
    versionNo: v.number(),
    changeNote: v.string(),
    snapshot: v.any(),
    changedBy: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("revisions", {
      ...args,
      quotation_id: args.quotationId,
      version_no: args.versionNo,
      change_note: args.changeNote,
      created_at: new Date().toISOString(),
    });
  },
});

// List revisions
export const listRevisions = query({
  args: { quotationId: v.id("quotations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("revisions")
      .withIndex("by_quotation", (q) => q.eq("quotation_id", args.quotationId))
      .order("desc")
      .collect();
  },
});
