const XLSX = require('xlsx');
const fs = require('fs');

// Mocking the bundles data structure from src/data/bundles.js
const ITEM_BUNDLES = [
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
  },
  {
    id: "pkg-main-led-system",
    name: "[PKG] Main LED System P2.9",
    description: "Complete LED P2.9 System including Main, Inner, Curve, Wing panels, Video Switcher, Media Server, and Logistics.",
    items: [
      { item_code: "LED-P29-MAIN", quantity: 48, duration: 2, dur_unit: "day", note: "Main LED 12x4m" },
      { item_code: "LED-P29-INNER", quantity: 20, duration: 2, dur_unit: "day", note: "Flat Inner LED 5x4m" },
      { item_code: "LED-P29-CURVE", quantity: 12, duration: 2, dur_unit: "day", note: "Curve LED 3x4m 9deg" },
      { item_code: "LED-P29-WING", quantity: 16, duration: 2, dur_unit: "day", note: "Flat Wing LED 4x4m" },
      { item_code: "LED-ACC-CABLE", quantity: 4, duration: 2, dur_unit: "day", note: "Cabling and Fiber Optic" },
      { item_code: "LED-PRO-SWITCH", quantity: 1, duration: 2, dur_unit: "day", note: "Video Switcher V16 Magnimage (FOH)" },
      { item_code: "MAN-OP-LED", quantity: 1, duration: 2, dur_unit: "day", note: "LED Operator" },
      { item_code: "LED-ACC-SLIDER", quantity: 1, duration: 2, dur_unit: "day", note: "Slider LED 18mx1,8m" },
      { item_code: "LED-PRO-SERVER", quantity: 8, duration: 2, dur_unit: "day", note: "Hirlander/Resolume Media Server" },
      { item_code: "LOG-TR-TRUCK", quantity: 4, duration: 2, dur_unit: "trip", note: "Transport Truck" },
      { item_code: "LOG-TR-ELF", quantity: 1, duration: 5, dur_unit: "day", note: "Main Power Transport (Elf)" },
      { item_code: "LOG-AC-ROOM", quantity: 8, duration: 5, dur_unit: "night", note: "Team Accomodation" },
      { item_code: "LOG-CS-MEALS", quantity: 16, duration: 5, dur_unit: "day", note: "Team Meals" }
    ]
  }
];

const exportData = [];
ITEM_BUNDLES.forEach(bundle => {
  bundle.items.forEach(item => {
    exportData.push({
      'PAKET ID': bundle.id,
      'NAMA PAKET': bundle.name,
      'DESKRIPSI PAKET': bundle.description,
      'ITEM CODE': item.item_code,
      'ITEM NAME': item.name || '',
      'QTY': item.quantity,
      'DURATION': item.duration,
      'UNIT': item.dur_unit,
      'NOTE': item.note || ''
    });
  });
});

const ws = XLSX.utils.json_to_sheet(exportData);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Paket_Item");
const fileName = "Paket_Item_Export.xlsx";
XLSX.writeFile(wb, fileName);
console.log(`Successfully exported bundles to ${fileName}`);
