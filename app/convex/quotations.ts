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
    title: v.optional(v.string()),
    quot_number: v.optional(v.string()),
    client_name: v.optional(v.string()),
    event_date: v.optional(v.string()),
    venue: v.optional(v.string()),
    city: v.optional(v.string()),
    signatory: v.optional(v.string()),
    status: v.optional(v.string()),
    items: v.optional(v.any()),
    total_cost: v.optional(v.number()),
    total_sell: v.optional(v.number()),
    margin: v.optional(v.number()),
    discount_type: v.optional(v.string()),
    discount_value: v.optional(v.number()),
    ppn_rate: v.optional(v.number()),
    mgmt_fee_rate: v.optional(v.number()),
    notes: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    const { items, status, total_cost, total_sell, margin, title, quot_number, ...baseArgs } = args;
    const id = await ctx.db.insert("quotations", {
      ...baseArgs,
      title: title || "New Quotation",
      quot_number: quot_number || `QUOT-${Date.now().toString().slice(-6)}`,
      status: status || "draft",
      total_cost: total_cost || 0,
      total_sell: total_sell || 0,
      margin: margin || 0,
      items: items || [],
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
