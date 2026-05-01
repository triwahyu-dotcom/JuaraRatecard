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

// --- ZONE/ACTIVITY SYSTEM MUTATIONS ---

// Update the entire zones array (for add, reorder, change color)
export const updateZones = mutation({
  args: {
    id: v.id("quotations"),
    zones: v.any(), // Array of { id, name, order, color, note }
  },
  handler: async (ctx, args) => {
    const { id, zones } = args;
    const now = new Date().toISOString();
    await ctx.db.patch(id, {
      zones,
      updated_at: now,
    });
  },
});

// Rename a zone and cascade the update to all associated items
export const renameZone = mutation({
  args: {
    id: v.id("quotations"),
    oldName: v.string(),
    newName: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, oldName, newName } = args;
    const quotation = await ctx.db.get(id);
    if (!quotation) throw new Error("Quotation not found");

    const now = new Date().toISOString();
    const updates: any = { updated_at: now };

    // 1. Update zone name in the zones array
    if (quotation.zones && Array.isArray(quotation.zones)) {
      updates.zones = quotation.zones.map((z: any) =>
        z.name === oldName ? { ...z, name: newName } : z
      );
    }

    // 2. Cascade update to all items
    if (quotation.items && Array.isArray(quotation.items)) {
      updates.items = quotation.items.map((item: any) =>
        item.zone_name === oldName ? { ...item, zone_name: newName } : item
      );
    }

    await ctx.db.patch(id, updates);
  },
});

// Delete a zone and cascade update (orphan) all associated items
export const deleteZone = mutation({
  args: {
    id: v.id("quotations"),
    zoneName: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, zoneName } = args;
    const quotation = await ctx.db.get(id);
    if (!quotation) throw new Error("Quotation not found");

    const now = new Date().toISOString();
    const updates: any = { updated_at: now };

    // 1. Remove zone from the zones array
    if (quotation.zones && Array.isArray(quotation.zones)) {
      updates.zones = quotation.zones.filter((z: any) => z.name !== zoneName);
    }

    // 2. Cascade update to orphan items (set zone_name to null)
    if (quotation.items && Array.isArray(quotation.items)) {
      updates.items = quotation.items.map((item: any) =>
        item.zone_name === zoneName ? { ...item, zone_name: null } : item
      );
    }

    await ctx.db.patch(id, updates);
  },
});
