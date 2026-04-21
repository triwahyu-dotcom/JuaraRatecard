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

/**
 * Exports quotation items to a flat Excel table.
 */
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

/**
 * Parses an Excel file into quotation item objects.
 * Supports both Flat (header-based) and Hierarchical (column-based) formats.
 */
export async function importFromExcelSync(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = xlsx.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // 1. Check if it's a Flat file by looking at headers in the first 5 rows
        const rowsAOA = xlsx.utils.sheet_to_json(worksheet, { header: 1, defval: null });
        
        // Detect Hierarchical (GAPEMPI) Format explicitly first
        let isHierarchical = false;
        for (let i = 0; i < Math.min(rowsAOA.length, 10); i++) {
          const row = rowsAOA[i];
          if (!row) continue;
          const col1 = String(row[1] || '').trim().toUpperCase();
          const col2 = String(row[2] || '').trim().toUpperCase();
          if (col1 === 'NO' && col2.includes('ITEM')) {
            isHierarchical = true;
            break;
          }
        }

        if (isHierarchical) {
          console.log('[excelSync] Hierarchical format explicitly detected.');
          resolve(parseHierarchicalFormat(rowsAOA));
        } else {
          const headerRowIdx = findHeaderRow(rowsAOA);
          if (headerRowIdx !== -1) {
            console.log('[excelSync] Flat format detected at row', headerRowIdx);
            resolve(parseFlatFormat(rowsAOA, headerRowIdx));
          } else {
            console.log('[excelSync] Fallback to Hierarchical format');
            resolve(parseHierarchicalFormat(rowsAOA));
          }
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

function findHeaderRow(aoa) {
  for (let i = 0; i < Math.min(aoa.length, 20); i++) {
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

    const item = {
      _ratecard_key: `imported-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 5)}`,
      sort_order: i
    };

    headers.forEach((header, colIdx) => {
      const prop = REVERSE_HEADER_MAPPING[header];
      if (prop) {
        let val = row[colIdx];
        if (['qty', 'duration_qty', 'unit_sell', 'unit_cost', 'freq'].includes(prop)) val = Number(val) || 0;
        if (prop === 'qty_unit' || prop === 'duration_unit') val = standardizeUnit(val);
        item[prop] = val;
      }
    });

    if (item.item_name) items.push(item);
  }
  return items;
}

/**
 * Specialized parser for indented GAPEMPI-style files.
 */
function parseHierarchicalFormat(aoa) {
  // 1. First, let's try to detect column indices by looking for typical headers
  const colMap = detectHierarchicalColumns(aoa);
  console.log('[excelSync] Detected Column Map:', colMap);

  let curSection = { code: 'A', name: '' };
  let curCategory = '';
  let curSubCategory = '';
  const items = [];

  for (let i = 0; i < aoa.length; i++) {
    const row = aoa[i];
    if (!row) continue;

    const col1 = String(row[colMap.id] || '').trim(); 
    const col2 = String(row[colMap.sec_name || colMap.id + 1] || '').trim();
    const col3 = String(row[colMap.cat_name || colMap.id + 2] || '').trim();
    const col4 = String(row[colMap.item_name - 1] || '').trim();
    const col5 = String(row[colMap.item_name] || '').trim();
    
    const specCell = row[colMap.spec];
    const qtyCell = row[colMap.qty];
    const qtyUnitCell = row[colMap.qty_unit];
    const freqCell = row[colMap.freq];
    const freqUnitCell = row[colMap.freq_unit];
    const priceCell = row[colMap.price];
    
    // Ignore rows with "TOTAL"
    const rowText = row.join(' ').toUpperCase();
    if (rowText.includes('TOTAL') || rowText.includes('SUBTOTAL') || rowText.includes('REKAPITULASI')) continue;

    // Detect Section (e.g. "A" in Col 1)
    if (col1 && /^[A-Z]$/.test(col1) && col1.length === 1) {
        curSection = { code: col1, name: col2 || col3 || '' };
        curCategory = '';
        curSubCategory = '';
        if (!col2 && !col3 && !col4 && !col5) continue;
    }

    const hasNumericData = (val) => {
      if (val === null || val === undefined || val === '') return false;
      const n = Number(String(val).replace(/[^0-9.-]+/g, ""));
      return !isNaN(n) && String(val).match(/\d/);
    };

    const isItemRow = hasNumericData(qtyCell) || hasNumericData(priceCell);

    if (!isItemRow) {
      if (col2 && !col1) {
        curCategory = col2;
        curSubCategory = '';
      } else if (col3 && !col2) {
        curSubCategory = col3;
      } else if (col4 && !col3) {
        curSubCategory = col4;
      }
    } else {
      const parseNum = (val) => {
        if (!val) return 0;
        const clean = String(val).replace(/[^0-9.-]+/g, "");
        return Number(clean) || 0;
      };

      const item = {
        _ratecard_key: `imported-${Date.now()}-${i}`,
        section_code: curSection.code,
        section_name: curSection.name,
        category: curCategory,
        sub_category: curSubCategory,
        item_name: col5 || col4 || col3 || col2,
        spec: String(specCell || '').trim(),
        qty: parseNum(qtyCell),
        qty_unit: standardizeUnit(qtyUnitCell),
        duration_qty: parseNum(freqCell) || 1,
        duration_unit: standardizeUnit(freqUnitCell || 'day'),
        unit_sell: parseNum(priceCell),
        unit_cost: 0,
        sort_order: i
      };

      if (item.item_name && !['ITEM / TASK', 'ITEM', 'TASK'].includes(item.item_name.toUpperCase())) {
        items.push(item);
      }
    }
  }

  return items;
}

/**
 * Heuristic to find column indices for Hierarchical format
 */
function detectHierarchicalColumns(aoa) {
  const defaults = { id: 1, spec: 6, qty: 7, qty_unit: 8, freq: 9, freq_unit: 10, price: 11, item_name: 5 };
  
  for (let i = 0; i < Math.min(aoa.length, 15); i++) {
    const row = aoa[i];
    if (!row) continue;
    
    // Look for a row that has headers
    const rowStr = row.join('|').toUpperCase();
    if (rowStr.includes('ITEM') || rowStr.includes('QTY') || rowStr.includes('PRICE') || rowStr.includes('UNIT')) {
      const map = { ...defaults };
      row.forEach((cell, idx) => {
        if (!cell) return;
        const c = String(cell).toUpperCase();
        if (c === 'NO') map.id = idx;
        if (c.includes('ITEM') || c.includes('TASK') || c.includes('DESCRIPTION')) map.item_name = idx;
        if (c.includes('SPEC')) map.spec = idx;
        if (c === 'QTY') map.qty = idx;
        if (c === 'UNIT') {
          // Usually first Unit is for Qty, second is for Freq
          if (idx > map.qty && idx < map.qty + 3) map.qty_unit = idx;
          else if (idx > map.freq) map.freq_unit = idx;
        }
        if (c.includes('FREQ') || c.includes('DUR')) map.freq = idx;
        if (c.includes('PRICE') || c.includes('HARGA') || (c.includes('UNIT') && idx > 10)) map.price = idx;
      });
      return map;
    }
  }
  return defaults;
}
