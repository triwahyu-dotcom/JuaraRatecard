const fs = require('fs');

const data = JSON.parse(fs.readFileSync('debug_output.json', 'utf8'));

let curSection = { code: 'A', name: '' };
let curCategory = '';
let curSubCategory = '';
const items = [];

for (let i = 0; i < data.length; i++) {
  const row = data[i];
  if (!row) continue;

  const col1 = String(row[1] || '').trim(); // B
  const col2 = String(row[2] || '').trim(); // C
  const col3 = String(row[3] || '').trim(); // D
  const col4 = String(row[4] || '').trim(); // E
  const col5 = String(row[5] || '').trim(); // F
  
  const specCell = row[6]; // G
  const qtyCell = row[7]; // H
  const qtyUnitCell = row[8]; // I
  const freqCell = row[9]; // J
  const freqUnitCell = row[10]; // K
  const priceCell = row[11]; // L
  
  // Ignore rows with "TOTAL"
  const rowText = row.join(' ').toUpperCase();
  if (rowText.includes('TOTAL') || rowText.includes('SUBTOTAL')) continue;

  // Detect Section (e.g. "A" in Col 1)
  if (col1 && /^[A-Z]$/.test(col1) && col1.length === 1) {
      curSection = { code: col1, name: col2 || col3 || '' };
      // Reset sub-levels
      curCategory = '';
      curSubCategory = '';
      if (!col2 && !col3 && !col4 && !col5) continue; // Pure header row
  }

  const hasNumericData = (val) => val !== null && val !== undefined && val !== '' && !isNaN(Number(val));
  // Many rows have 0 qty. So checking !== undefined is important.
  const isItemRow = hasNumericData(qtyCell) || hasNumericData(priceCell);

  if (!isItemRow) {
    // If no Qty/Price, it's a Heading row (Category or SubCategory)
    if (col2 && !col1) {
      curCategory = col2;
      curSubCategory = '';
    } else if (col3) {
      curSubCategory = col3;
    } else if (col4) {
      curSubCategory = col4;
    } else if (col5 && !col4) {
      curSubCategory = col5;
    }
  } else {
    // It IS an Item Row
    const item = {
      _ratecard_key: `imported-${Date.now()}-${i}`,
      section_code: curSection.code,
      section_name: curSection.name,
      category: curCategory,
      sub_category: curSubCategory,
      item_name: col5 || col4 || col3 || col2, // Fallback chain
      spec: String(specCell || '').trim(),
      qty: hasNumericData(qtyCell) ? Number(qtyCell) : 0,
      qty_unit: String(qtyUnitCell || '').trim(),
      duration_qty: hasNumericData(freqCell) ? Number(freqCell) : 1,
      duration_unit: String(freqUnitCell || '').trim(),
      unit_sell: hasNumericData(priceCell) ? Number(priceCell) : 0,
      unit_cost: 0,
      sort_order: i
    };

    if (item.item_name && !['ITEM / TASK', 'ITEM', 'TASK'].includes(item.item_name.toUpperCase())) {
      items.push(item);
    }
  }
}
console.log('Items found:', items.length);
if (items.length > 0) console.log(items.slice(0, 3));
