import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Fetch all master items
export const listItems = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("master_items").collect();
  },
});

// Fetch all categories
export const listCategories = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("categories").collect();
  },
});

// Create master item
export const createItem = mutation({
  args: {
    item_name: v.string(),
    category: v.string(),
    sub_category: v.string(),
    unit: v.string(),
    unit_cost: v.number(),
    unit_sell: v.number(),
    remarks: v.optional(v.string()),
    vendor_name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("master_items", args);
  },
});

// Update master item
export const updateItem = mutation({
  args: {
    id: v.id("master_items"),
    updates: v.any(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, args.updates);
  },
});

// Remove master item
export const removeItem = mutation({
  args: { id: v.id("master_items") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Clear all master items (for replacement)
export const clearAll = mutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("master_items").collect();
    for (const item of all) {
      await ctx.db.delete(item._id);
    }
  },
});

// Seed data helper
export const seedItems = mutation({
  args: { items: v.array(v.any()) },
  handler: async (ctx, args) => {
    for (const item of args.items) {
      await ctx.db.insert("master_items", item);
    }
  },
});
// Fetch all bundles
export const listBundles = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("bundles").collect();
  },
});

// Create bundle
export const createBundle = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    items: v.array(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("bundles", args);
  },
});

// Create category
export const createCategory = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("categories")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();
    if (existing) return existing._id;
    return await ctx.db.insert("categories", { name: args.name });
  },
});
