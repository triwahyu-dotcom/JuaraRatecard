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

// Update the entire zones array with validation for duplicates and empty names
export const updateZones = mutation({
  args: {
    id: v.id("quotations"),
    zones: v.any(),
  },
  handler: async (ctx, args) => {
    const { id, zones } = args;
    
    if (!Array.isArray(zones)) {
      throw new Error("Zones must be an array");
    }
    
    const cleanZones = zones.map((z: any) => ({
      ...z,
      name: typeof z.name === 'string' ? z.name.trim() : z.name,
    }));
    
    if (cleanZones.some((z: any) => !z.name)) {
      throw new Error("Zone names cannot be empty");
    }
    
    const lowerNames = cleanZones.map((z: any) => z.name.toLowerCase());
    const uniqueNames = new Set(lowerNames);
    if (uniqueNames.size !== lowerNames.length) {
      throw new Error("Duplicate zone names are not allowed");
    }
    
    const now = new Date().toISOString();
    await ctx.db.patch(id, {
      zones: cleanZones,
      updated_at: now,
    });
  },
});

// Rename a zone with validation and cascade the update to all associated items
export const renameZone = mutation({
  args: {
    id: v.id("quotations"),
    oldName: v.string(),
    newName: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, oldName } = args;
    const newName = args.newName.trim();
    
    if (!newName) {
      throw new Error("Zone name cannot be empty");
    }
    
    if (oldName === newName) {
      return { cascaded: 0 };
    }
    
    const quotation = await ctx.db.get(id);
    if (!quotation) throw new Error("Quotation not found");

    if (quotation.zones && Array.isArray(quotation.zones)) {
      const conflict = quotation.zones.find((z: any) =>
        z.name !== oldName && 
        z.name.toLowerCase() === newName.toLowerCase()
      );
      if (conflict) {
        throw new Error("Zone with this name already exists");
      }
    }

    const now = new Date().toISOString();
    const updates: any = { updated_at: now };
    let cascadedCount = 0;

    if (quotation.zones && Array.isArray(quotation.zones)) {
      updates.zones = quotation.zones.map((z: any) =>
        z.name === oldName ? { ...z, name: newName } : z
      );
    }

    if (quotation.items && Array.isArray(quotation.items)) {
      updates.items = quotation.items.map((item: any) => {
        if (item.zone_name === oldName) {
          cascadedCount++;
          return { ...item, zone_name: newName };
        }
        return item;
      });
    }

    await ctx.db.patch(id, updates);
    
    return { cascaded: cascadedCount };
  },
});

// Delete a zone and cascade update with optional reassignment
export const deleteZone = mutation({
  args: {
    id: v.id("quotations"),
    zoneName: v.string(),
    reassignTo: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    const { id, zoneName, reassignTo } = args;
    const quotation = await ctx.db.get(id);
    if (!quotation) throw new Error("Quotation not found");

    const now = new Date().toISOString();
    const updates: any = { updated_at: now };
    
    const targetZoneName = reassignTo ?? null;
    let cascadedCount = 0;
    
    if (quotation.zones && Array.isArray(quotation.zones)) {
      updates.zones = quotation.zones.filter((z: any) => z.name !== zoneName);
    }
    
    if (quotation.items && Array.isArray(quotation.items)) {
      updates.items = quotation.items.map((item: any) => {
        if (item.zone_name === zoneName) {
          cascadedCount++;
          return { ...item, zone_name: targetZoneName };
        }
        return item;
      });
    }
    
    await ctx.db.patch(id, updates);
    
    return { cascaded: cascadedCount };
  },
});

// Set zone for a specific item
export const setItemZone = mutation({
  args: {
    id: v.id("quotations"),
    itemKey: v.string(),
    zoneName: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const { id, itemKey, zoneName } = args;
    const quotation = await ctx.db.get(id);
    if (!quotation) throw new Error("Quotation not found");
    
    if (!quotation.items || !Array.isArray(quotation.items)) {
      return { updated: 0 };
    }
    
    let updatedCount = 0;
    const newItems = quotation.items.map((item: any) => {
      if (item._ratecard_key === itemKey) {
        updatedCount++;
        return { ...item, zone_name: zoneName };
      }
      return item;
    });
    
    const now = new Date().toISOString();
    await ctx.db.patch(id, {
      items: newItems,
      updated_at: now,
    });
    
    return { updated: updatedCount };
  },
});

// Bulk set zone for multiple items
export const bulkSetItemZone = mutation({
  args: {
    id: v.id("quotations"),
    itemKeys: v.array(v.string()),
    zoneName: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const { id, itemKeys, zoneName } = args;
    const quotation = await ctx.db.get(id);
    if (!quotation) throw new Error("Quotation not found");
    
    if (!quotation.items || !Array.isArray(quotation.items)) {
      return { updated: 0 };
    }
    
    const itemKeySet = new Set(itemKeys);
    let updatedCount = 0;
    const newItems = quotation.items.map((item: any) => {
      if (itemKeySet.has(item._ratecard_key)) {
        updatedCount++;
        return { ...item, zone_name: zoneName };
      }
      return item;
    });
    
    const now = new Date().toISOString();
    await ctx.db.patch(id, {
      items: newItems,
      updated_at: now,
    });
    
    return { updated: updatedCount };
  },
});
