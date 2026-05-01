import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Master Data
  master_items: defineTable({
    item_name: v.string(),
    category: v.string(),
    sub_category: v.string(),
    unit: v.string(),
    unit_cost: v.number(),
    unit_sell: v.number(),
    vendor_name: v.optional(v.string()),
    remarks: v.optional(v.string()),
  }).index("by_category", ["category"]),

  categories: defineTable({
    name: v.string(),
  }).index("by_name", ["name"]),

  subcategories: defineTable({
    name: v.string(),
    category_id: v.string(),
  }),

  vendors: defineTable({
    name: v.string(),
    contact: v.optional(v.string()),
  }),

  clients: defineTable({
    name: v.string(),
    company: v.optional(v.string()),
    email: v.optional(v.string()),
  }),

  // Main Quotations
  quotations: defineTable({
    quot_number: v.string(),
    title: v.string(),
    client_name: v.optional(v.string()),
    event_date: v.optional(v.string()),
    venue: v.optional(v.string()),
    city: v.optional(v.string()),
    signatory: v.optional(v.string()),
    status: v.string(), // draft, sent, approved, rejected
    total_cost: v.number(),
    total_sell: v.number(),
    margin: v.number(),
    
    // Financial settings
    discount_type: v.optional(v.string()),
    discount_value: v.optional(v.number()),
    ppn_rate: v.optional(v.number()),
    mgmt_fee_rate: v.optional(v.number()),
    
    // Terms & Conditions
    notes: v.optional(v.array(v.string())),

    // Embedded items for instant real-time sync
    items: v.array(v.any()), 
    updated_at: v.string(),
    created_at: v.string(),
  }).index("by_status", ["status"]),

  // Collaboration
  comments: defineTable({
    quotation_id: v.id("quotations"),
    user_name: v.string(),
    text: v.string(),
    row_key: v.optional(v.string()), // if attached to a specific row
    created_at: v.string(),
  }).index("by_quotation", ["quotation_id"]),

  revisions: defineTable({
    quotation_id: v.id("quotations"),
    version_no: v.number(),
    change_note: v.string(),
    snapshot: v.any(),
    changed_by: v.string(),
    created_at: v.string(),
  }).index("by_quotation", ["quotation_id"]),
  
  // Bundles
  bundles: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    items: v.array(v.any()),
  }),
});
