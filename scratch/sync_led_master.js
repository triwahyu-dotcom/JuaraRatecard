
const { createRatecardItem, getAllRatecardItems } = require('./app/src/lib/ratecardRepo');

// Mocking environment for node script if needed, 
// but since this is a scratch script I'll just use the values from the image.

const ledItems = [
  { item_code: 'LED-P29-MAIN', item_name: 'LED P2.9 Standard', category: 'LED System', unit_sell: 750000, qty_unit: 'm', freq_unit: 'day' },
  { item_code: 'LED-P39-FLOOR', item_name: 'Floor LED P3.9', category: 'LED System', unit_sell: 1200000, qty_unit: 'm', freq_unit: 'day' },
  { item_code: 'LED-PRO-SWITCH', item_name: 'Video Switcher V16 Magnimage', category: 'Video System', unit_sell: 1500000, qty_unit: 'unit', freq_unit: 'day' },
  { item_code: 'MAN-OP-LED', item_name: 'LED Operator', category: 'Manpower', unit_sell: 750000, qty_unit: 'prs', freq_unit: 'day' },
  { item_code: 'LED-ACC-SLIDER', item_name: 'Slider LED 18mx1,8m', category: 'LED System', unit_sell: 5000000, qty_unit: 'unit', freq_unit: 'day' },
  { item_code: 'LED-PRO-SERVER', item_name: 'Media Server (Hirlander/Resolume)', category: 'Video System', unit_sell: 7500000, qty_unit: 'chn', freq_unit: 'day' },
  { item_code: 'LOG-TR-TRUCK', item_name: 'Transport Truck', category: 'Logistics', unit_sell: 10000000, qty_unit: 'truck', freq_unit: 'trip' },
  { item_code: 'LOG-TR-ELF', item_name: 'Main Power Transport (Elf)', category: 'Logistics', unit_sell: 5000000, qty_unit: 'day', freq_unit: 'day' },
  { item_code: 'LOG-AC-ROOM', item_name: 'Team Accomodation', category: 'Logistics', unit_sell: 400000, qty_unit: 'room', freq_unit: 'night' },
  { item_code: 'LOG-CS-MEALS', item_name: 'Team Meals', category: 'Logistics', unit_sell: 100000, qty_unit: 'prs', freq_unit: 'day' }
];

console.log("Ready to sync LED items to master database.");
