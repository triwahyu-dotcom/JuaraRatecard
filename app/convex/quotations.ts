import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Fetch all quotations
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("quotations").order("desc").collect();
  },
});

// Fetch a single quotation
export const get = query({
  args: { id: v.id("quotations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create a new quotation
export const create = mutation({
  args: {
    title: v.string(),
    quot_number: v.string(),
    client_name: v.optional(v.string()),
    event_date: v.optional(v.string()),
    venue: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    const id = await ctx.db.insert("quotations", {
      ...args,
      status: "draft",
      total_cost: 0,
      total_sell: 0,
      margin: 0,
      items: [],
      created_at: now,
      updated_at: now,
    });
    return id;
  },
});

// Update quotation data (including items)
export const update = mutation({
  args: {
    id: v.id("quotations"),
    updates: v.any(), // Flexible for now
  },
  handler: async (ctx, args) => {
    const { id, updates } = args;
    const now = new Date().toISOString();
    await ctx.db.patch(id, {
      ...updates,
      updated_at: now,
    });
  },
});

// Delete quotation
export const remove = mutation({
  args: { id: v.id("quotations") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
