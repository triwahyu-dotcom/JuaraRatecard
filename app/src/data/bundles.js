export const ITEM_BUNDLES = [
  {
    id: "pkg-fb-area",
    name: "[PKG] F&B Area Standard",
    description: "Standard setup for F&B area including tent, tables, chairs, and power.",
    items: [
      { item_code: "VS-TS-001", quantity: 1, duration: 3, dur_unit: "day", note: "Tent 12x24 for F&B" },
      { item_code: "VS-CM-003", quantity: 24, duration: 3, dur_unit: "day", note: "IBM Tables with cover" },
      { item_code: "VS-CM-004", quantity: 48, duration: 3, dur_unit: "day", note: "Futura Chairs with cover" },
      { item_code: "PR-EQ-012", quantity: 1, duration: 3, dur_unit: "day", note: "80KVA Power" },
      { item_code: "PR-EQ-011", quantity: 4, duration: 3, dur_unit: "day", note: "Misty Fan cooling" }
    ]
  },
  {
    id: "pkg-reg-area",
    name: "[PKG] Registration / Redemption Area",
    description: "Setup for participant registration or voucher redemption.",
    items: [
      { item_code: "PR-BO-005", quantity: 2, duration: 3, dur_unit: "day", note: "R8 Ticket Booth" },
      { item_code: "VS-CM-001", quantity: 10, duration: 3, dur_unit: "day", note: "Queue lines" },
      { item_code: "VS-SR-003", quantity: 2, duration: 3, dur_unit: "day", note: "AC Portable" },
      { item_code: "SP-SG-005", quantity: 4, duration: 3, dur_unit: "day", note: "Standing Signage A3" },
      { item_code: "SU-TC-001", quantity: 1, duration: 1, dur_unit: "event", note: "Dedicated Internet" }
    ]
  },
  {
    id: "pkg-vip-lounge",
    name: "[PKG] VIP Lounge Hospitality",
    description: "Premium setup for VIP guests holding room.",
    items: [
      { item_code: "VS-VH-002", quantity: 4, duration: 3, dur_unit: "day", note: "VIP Sofa" },
      { item_code: "VS-VH-003", quantity: 2, duration: 3, dur_unit: "day", note: "Coffee Table" },
      { item_code: "VS-SR-003", quantity: 2, duration: 3, dur_unit: "day", note: "AC Portable" },
      { item_code: "VS-VH-004", quantity: 2, duration: 3, dur_unit: "day", note: "Flowers / Centerpiece" },
      { item_code: "VS-VH-008", quantity: 1, duration: 3, dur_unit: "day", note: "Amenities & Refreshments" }
    ]
  },
  {
    id: "pkg-medical-vvip",
    name: "[PKG] Medical VVIP Team",
    description: "Full ICU Standard medical team for high priority events.",
    items: [
      { item_code: "PR-ME-001", name: "Ambulance ICU", quantity: 1, duration: 1, dur_unit: "day", note: "VVIP Mini ICU Unit" },
      { item_code: "PR-ME-002", name: "Specialist Doctor", quantity: 1, duration: 1, dur_unit: "day", note: "Emergency Specialist" },
      { item_code: "PR-ME-002", name: "ICU Nurse", quantity: 2, duration: 1, dur_unit: "day", note: "Certified RN" },
      { item_code: "VS-SR-001", quantity: 1, duration: 1, dur_unit: "day", note: "Full Medic Tools Set" }
    ]
  }
];
