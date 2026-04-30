import * as xlsx from 'xlsx';
import { standardizeUnit } from './stringUtils';

/**
 * HEADER_MAPPING for Flat files
 */
export const HEADER_MAPPING = {
  section_name: 'Section',
  category: 'Category',
  item_name: 'Item Name',
  spec: 'Specification',
  qty: 'Qty',
  qty_unit: 'Unit',
  duration_qty: 'Freq',
  duration_unit: 'Dur Unit',
  unit_sell: 'Unit Price',
  unit_cost: 'Unit Cost',
  provided_by: 'Provided By',
  zone_name: 'Zone',
  variant_name: 'Variant',
  note: 'Notes'
};

const REVERSE_HEADER_MAPPING = Object.fromEntries(
  Object.entries(HEADER_MAPPING).map(([k, v]) => [v.toLowerCase(), k])
);

export function exportToExcelSync(items, fileName = 'quotation_draft.xlsx') {
  const data = items.map(item => {
    const row = {};
    Object.keys(HEADER_MAPPING).forEach(key => {
      row[HEADER_MAPPING[key]] = item[key] ?? '';
    });
    return row;
  });
  if (data.length === 0) {
    const emptyRow = {};
    Object.values(HEADER_MAPPING).forEach(val => emptyRow[val] = '');
    data.push(emptyRow);
  }
  const worksheet = xlsx.utils.json_to_sheet(data);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Items');
  xlsx.writeFile(workbook, fileName);
}

export async function importFromExcelSync(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = xlsx.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rowsAOA = xlsx.utils.sheet_to_json(worksheet, { header: 1, defval: null });

        const headerRowIdx = findHeaderRow(rowsAOA);
        if (headerRowIdx !== -1 && headerRowIdx < 5) {
            return resolve(parseFlatFormat(rowsAOA, headerRowIdx));
        }

        const items = parseContextAware(rowsAOA);
        resolve(items);
      } catch (err) {
        console.error('[excelSync] Import Error:', err);
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

function findHeaderRow(aoa) {
  for (let i = 0; i < Math.min(aoa.length, 30); i++) {
    const row = aoa[i];
    if (!row) continue;
    const matchCount = row.filter(cell => cell && REVERSE_HEADER_MAPPING[String(cell).trim().toLowerCase()]).length;
    if (matchCount >= 3) return i;
  }
  return -1;
}

function parseFlatFormat(aoa, headerRowIdx) {
  const headers = aoa[headerRowIdx].map(h => String(h || '').trim().toLowerCase());
  const items = [];
  for (let i = headerRowIdx + 1; i < aoa.length; i++) {
    const row = aoa[i];
    if (!row || row.every(c => c === null || c === '')) continue;
    const item = { _ratecard_key: `imp-${Date.now()}-${i}`, sort_order: i };
    headers.forEach((header, colIdx) => {
      const prop = REVERSE_HEADER_MAPPING[header];
      if (prop) {
        let val = row[colIdx];
        if (['qty', 'duration_qty', 'unit_sell', 'unit_cost', 'freq'].includes(prop)) val = Number(val) || 0;
        item[prop] = val;
      }
    });
    if (item.item_name) items.push(item);
  }
  return { items, metadata: { event_name: '', event_date: '', event_venue: '', client_name: '' } };
}

function parseContextAware(aoa) {
  // 0. METADATA EXTRACTION (Event, Date, Venue, Client)
  const metadata = { event_name: '', event_date: '', event_venue: '', client_name: '' };
  for (let i = 0; i < Math.min(aoa.length, 15); i++) {
    const row = aoa[i];
    if (!row) continue;
    const line = row.map(c => String(c||'').trim()).join(' ');
    
    if (/^event/i.test(line))   metadata.event_name  = line.replace(/^event\s*:?\s*/i, '').trim();
    if (/^date/i.test(line))    metadata.event_date  = line.replace(/^date\s*:?\s*/i, '').trim();
    if (/^venue/i.test(line))   metadata.event_venue = line.replace(/^venue\s*:?\s*/i, '').trim();
    if (/^quot to/i.test(line)) metadata.client_name = line.replace(/^quot to\s*:?\s*/i, '').trim();
  }

  // 1. DYNAMIC COLUMN DETECTION
  let colMap = { id: 1, item_start: 2, spec: 6, qty: 7, qty_unit: 8, freq: 9, freq_unit: 10, amount: 12, nego: -1, dur: -1 };
  
  for (let i = 0; i < Math.min(aoa.length, 50); i++) {
      const row = aoa[i];
      if (!row) continue;
      const rowStr = row.map(c => String(c||'').toUpperCase()).join('|');
      if (rowStr.includes('ITEM') || rowStr.includes('QTY') || rowStr.includes('PRICE') || rowStr.includes('AMOUNT')) {
          row.forEach((cell, idx) => {
              const c = String(cell || '').toUpperCase().trim();
              if (c.startsWith('NO')) colMap.id = idx;
              if (c.includes('ITEM') || c.includes('TASK')) colMap.item_start = idx;
              if (c.includes('SPEC')) colMap.spec = idx;
              if (c === 'QTY') colMap.qty = idx;
              if (c === 'FREQ' || c === 'FRQ') colMap.freq = idx;
              if (c === 'DUR') colMap.dur = idx;
              if (c.includes('AMOUNT') || (c.includes('TOTAL') && idx > 10)) colMap.amount = idx;
              if (c.includes('NEGO')) colMap.nego = idx;
          });
          row.forEach((cell, idx) => {
              const c = String(cell || '').toUpperCase().trim();
              if (c === 'UNIT') {
                  if (idx > colMap.qty && idx < colMap.qty + 3) colMap.qty_unit = idx;
                  else if (colMap.freq !== -1 && idx > colMap.freq && idx < colMap.freq + 3) colMap.freq_unit = idx;
                  else if (colMap.dur !== -1 && idx > colMap.dur && idx < colMap.dur + 3) colMap.dur_unit = idx;
              }
          });
          break;
      }
  }

  const items = [];
  let curSecCode = '';
  let curSecName = '';
  let curCat = '';
  let curSubCat = '';
  let isSet2 = false;

  for (let i = 0; i < aoa.length; i++) {
    const row = aoa[i];
    if (!row || row.length === 0) continue;

    const val = (idx) => (idx === -1 || row[idx] === null || row[idx] === undefined) ? '' : String(row[idx]).trim();
    const cId = val(colMap.id);
    
    // SECTION HEADER DETECTION
    const isMainSection = cId.length === 1 && /^[A-Z]$/.test(cId);
    if (isMainSection) {
        if (cId === 'A' && curSecCode !== '' && curSecCode !== 'A') isSet2 = true;
        curSecCode = cId;
        curSecName = val(colMap.item_start) || val(colMap.item_start + 1) || `Section ${cId}`;
        curCat = ''; curSubCat = '';
        continue;
    }

    // ITEM NAME DETECTION (Priority: Rightmost column in B-E)
    let itemName = '';
    let foundCol = -1;
    const specStart = colMap.spec !== -1 ? colMap.spec : colMap.qty;
    for (let j = specStart - 1; j >= colMap.item_start; j--) {
        const cellText = val(j);
        if (cellText && cellText.length > 1 && !cellText.includes('...')) {
            itemName = cellText;
            foundCol = j;
            break;
        }
    }

    // GATHER DATA
    const amountRaw = row[colMap.amount];
    const negoRaw = colMap.nego !== -1 ? row[colMap.nego] : null;
    const qtyRaw = row[colMap.qty];
    
    const hasQty = qtyRaw !== null && qtyRaw !== undefined && qtyRaw !== '';
    const hasAmount = amountRaw !== null && amountRaw !== undefined && amountRaw !== '';
    const hasNego = negoRaw !== null && negoRaw !== undefined && negoRaw !== '';

    // CATEGORY DETECTION (If no numeric data and looks like a header)
    if (!hasQty && !hasAmount && !hasNego) {
        if (itemName) {
            if (foundCol === colMap.item_start) {
                curCat = itemName;
                curSubCat = '';
            } else {
                curSubCat = itemName;
            }
        }
        continue;
    }

    // SKIP IF STILL NO NAME OR LOOKS LIKE HEADER
    const upperName = itemName.toUpperCase();
    if (!itemName || upperName.includes('TOTAL') || upperName.includes('ITEM / TASK') || upperName.includes('ITEM/TASK')) continue;

    // NUMERIC PROCESSING
    const qty  = Number(qtyRaw) || 0;
    const freq = Number(row[colMap.freq]) || 1;
    const dur  = colMap.dur !== -1 ? (Number(row[colMap.dur]) || 1) : 1;
    
    // Nego logic: Use nego price if available, otherwise use amount / (qty * freq * dur)
    let unitSell = 0;
    if (hasNego && (Number(negoRaw) > 0 || negoRaw === 0 || negoRaw === '0')) {
        unitSell = Number(negoRaw);
    } else if (hasAmount && (Number(amountRaw) > 0 || amountRaw === 0 || amountRaw === '0')) {
        const totalAmount = Number(amountRaw);
        unitSell = totalAmount / (Math.max(1, qty) * freq * dur);
    } else {
        unitSell = (amountRaw || negoRaw || 'TBD');
    }

    items.push({
      _ratecard_key: `imp-${Date.now()}-${i}`,
      section_code: (isSet2 ? '2' : '1') + curSecCode,
      section_name: curSecName,
      category: curCat || curSecName,
      sub_category: curSubCat,
      item_name: itemName,
      spec: val(colMap.spec),
      qty: qty,
      qty_unit: standardizeUnit(val(colMap.qty_unit) || 'unit'),
      duration_qty: freq,
      duration_unit: standardizeUnit(val(colMap.freq_unit) || 'day'),
      frequency_qty: dur,
      frequency_unit: standardizeUnit(val(colMap.dur_unit) || 'project'),
      unit_sell: unitSell,
      unit_cost: 0,
      sort_order: items.length,
      item_no: cId 
    });
  }

  return { items, metadata };
}
