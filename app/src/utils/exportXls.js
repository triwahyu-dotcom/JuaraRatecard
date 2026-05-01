import ExcelJS from 'exceljs';
import { calcLineSell, calcSummary, calcAllSectionSellTotals, getUniqueSections, getQuotationLines } from './calc';
import { fmtDate } from './fmt';

const COMPANY = 'PT Juara Berhasil Berkah Sejahtera';

const stripPrefix = (str) => {
  if (!str) return '';
  return str.replace(/^[A-Z]\d*\.\s*/i, '');
};

const fmtNum = (n) => {
  if (!n || n === 0) return '';
  return Math.round(n).toLocaleString('id-ID');
};

// Color palette matching PDF
const COLOR = {
  headerBg: '1a1a1a',      // dark header
  headerFg: 'FFFFFF',
  sectionBg: 'F5F5F5',     // light grey section row
  catBg: 'FAFAFA',         // lighter grey category row
  subBg: 'FFFFFF',
  summaryBg: '1a1a1a',
  summaryFg: 'FFFFFF',
  border: 'E8E8E8',
  textMuted: '888888',
  totalBg: '1a1a1a',
};

// Column definitions matching PDF columns: NO | ITEM/TASK | SPECIFICATION | QTY | UNIT | DUR | DUR UNIT | PRICE | AMOUNT
const COLS = [
  { key: 'no',    width: 8 },
  { key: 'item',  width: 38 },
  { key: 'spec',  width: 32 },
  { key: 'qty',   width: 8 },
  { key: 'unit',  width: 10 },
  { key: 'dur',   width: 8 },
  { key: 'dunit', width: 10 },
  { key: 'price', width: 18 },
  { key: 'amount',width: 18 },
];

function applyBorder(cell) {
  cell.border = {
    bottom: { style: 'thin', color: { argb: 'FFE8E8E8' } },
  };
}

function headerStyle(cell, bgHex = COLOR.headerBg, fgHex = COLOR.headerFg) {
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + bgHex } };
  cell.font = { bold: true, color: { argb: 'FF' + fgHex }, size: 8 };
  cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
}

function sectionRowStyle(ws, rowNum) {
  for (let c = 1; c <= 9; c++) {
    const cell = ws.getCell(rowNum, c);
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
    cell.font = { bold: true, size: 9 };
    cell.border = { bottom: { style: 'medium', color: { argb: 'FFCCCCCC' } } };
  }
}

function catRowStyle(ws, rowNum) {
  for (let c = 1; c <= 9; c++) {
    const cell = ws.getCell(rowNum, c);
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFAFAFA' } };
    cell.font = { bold: true, size: 8 };
    cell.border = { bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } } };
  }
}

function subRowStyle(ws, rowNum) {
  for (let c = 1; c <= 9; c++) {
    const cell = ws.getCell(rowNum, c);
    cell.font = { bold: true, italic: true, size: 8, color: { argb: 'FF444444' } };
    cell.border = { bottom: { style: 'thin', color: { argb: 'FFEEEEEE' } } };
  }
}

export async function exportQuotationToXls(quotation) {
  const rawItems = getQuotationLines(quotation);
  const items = rawItems.filter(i => {
    const name = (i.item_name || '').toLowerCase();
    return !['item / task', 'item/task', 'item', 'task'].includes(name);
  });

  const eventData = quotation;
  const sections = getUniqueSections(items);
  const sectionTotals = calcAllSectionSellTotals(items);

  const opts = {
    discount_type:  eventData.discount_type  || 'amt',
    discount_value: eventData.discount_value ?? 0,
    mgmt_type:      'pct',
    mgmt_value:     Math.round((eventData.mgmt_fee_rate || 0.10) * 100),
    ppn_rate:       Math.round((eventData.ppn_rate || 0.12) * 100),
  };
  const { subtotal, discountAmount, mgmtFeeAmount, taxBase, ppnAmount, grandTotal } = calcSummary(items, opts);

  const wb = new ExcelJS.Workbook();
  wb.creator = COMPANY;

  // ── SHEET 1: SUMMARY ──────────────────────────────────────────────
  const sumSheet = wb.addWorksheet('Summary', { pageSetup: { paperSize: 9 } });
  COLS.forEach((col, i) => { sumSheet.getColumn(i + 1).width = col.width; });

  let r = 1;

  // Info header block
  const infoRows = [
    ['CLIENT',      eventData.client_name || ''],
    ['EVENT TITLE', eventData.title || ''],
    ['DATE',        fmtDate(eventData.event_date)],
    ['VENUE',       eventData.venue || ''],
    ['CITY',        eventData.city || ''],
    ['NUMBER',      eventData.quot_number || ''],
  ];
  infoRows.forEach(([label, val]) => {
    sumSheet.getCell(r, 1).value = label;
    sumSheet.getCell(r, 1).font = { bold: true, size: 8, color: { argb: 'FF555555' } };
    sumSheet.getCell(r, 2).value = val;
    sumSheet.getCell(r, 2).font = { size: 8 };
    sumSheet.mergeCells(r, 2, r, 9);
    r++;
  });

  r++; // blank row

  // Title
  sumSheet.getCell(r, 1).value = 'SUMMARY QUOTATION';
  sumSheet.getCell(r, 1).font = { bold: true, size: 14 };
  sumSheet.getCell(r, 1).alignment = { horizontal: 'center' };
  sumSheet.mergeCells(r, 1, r, 9);
  r++;

  // Column headers
  const sumHeaders = ['NO', 'ITEM / TASK', 'SPECIFICATION', 'QTY', 'UNIT', 'DUR', 'DUR UNIT', 'PRICE', 'AMOUNT'];
  sumHeaders.forEach((h, i) => {
    const cell = sumSheet.getCell(r, i + 1);
    cell.value = h;
    headerStyle(cell);
  });
  sumSheet.getRow(r).height = 20;
  r++;

  // "A SUMMARY" block header
  sumSheet.getCell(r, 1).value = 'A';
  sumSheet.getCell(r, 2).value = 'SUMMARY';
  sumSheet.mergeCells(r, 2, r, 9);
  sectionRowStyle(sumSheet, r);
  sumSheet.getRow(r).height = 16;
  r++;

  // Section rows
  sections.forEach((s, i) => {
    const total = sectionTotals[s.code] || 0;
    const letter = String.fromCharCode(65 + i);
    sumSheet.getCell(r, 1).value = letter;
    sumSheet.getCell(r, 1).alignment = { horizontal: 'center' };
    sumSheet.getCell(r, 2).value = stripPrefix(s.name) || `Section ${s.code}`;
    sumSheet.getCell(r, 2).font = { bold: true, size: 9 };
    sumSheet.mergeCells(r, 2, r, 7);
    sumSheet.getCell(r, 8).value = total;
    sumSheet.getCell(r, 8).numFmt = '#,##0';
    sumSheet.getCell(r, 8).alignment = { horizontal: 'right' };
    sumSheet.getCell(r, 9).value = total;
    sumSheet.getCell(r, 9).numFmt = '#,##0';
    sumSheet.getCell(r, 9).alignment = { horizontal: 'right' };
    for (let c = 1; c <= 9; c++) applyBorder(sumSheet.getCell(r, c));
    r++;
  });

  r++; // blank

  // Financial summary
  const finRows = [
    ['Subtotal', subtotal],
    ...(discountAmount > 0 ? [[opts.discount_type === 'pct' ? `Diskon (${opts.discount_value}%)` : 'Diskon', -discountAmount]] : []),
    ...(mgmtFeeAmount > 0 ? [[`Management Fee (${opts.mgmt_value}%)`, mgmtFeeAmount]] : []),
    ['Tax Base (DPP)', taxBase],
    [`PPN ${opts.ppn_rate}%`, ppnAmount],
  ];

  finRows.forEach(([label, val]) => {
    sumSheet.mergeCells(r, 1, r, 7);
    sumSheet.getCell(r, 8).value = label;
    sumSheet.getCell(r, 8).font = { bold: true, size: 9, color: { argb: 'FF555555' } };
    sumSheet.getCell(r, 8).alignment = { horizontal: 'right' };
    sumSheet.getCell(r, 9).value = val;
    sumSheet.getCell(r, 9).numFmt = '#,##0';
    sumSheet.getCell(r, 9).alignment = { horizontal: 'right' };
    sumSheet.getCell(r, 9).border = { bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } } };
    r++;
  });

  // Grand Total row
  sumSheet.mergeCells(r, 1, r, 7);
  sumSheet.getCell(r, 8).value = 'GRAND TOTAL';
  sumSheet.getCell(r, 9).value = grandTotal;
  for (let c = 8; c <= 9; c++) {
    const cell = sumSheet.getCell(r, c);
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1a1a1a' } };
    cell.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
    cell.alignment = { horizontal: c === 8 ? 'right' : 'right' };
  }
  sumSheet.getCell(r, 9).numFmt = '#,##0';
  r += 3;

  // Signatory
  sumSheet.getCell(r, 1).value = `${eventData.city || 'Jakarta'}, ${fmtDate(eventData.event_date)}`;
  r++;
  sumSheet.getCell(r, 1).value = 'Submitted by,';
  r += 4;
  sumSheet.getCell(r, 1).value = eventData.signatory || '';
  sumSheet.getCell(r, 1).font = { bold: true, underline: true };
  r++;
  sumSheet.getCell(r, 1).value = COMPANY;

  // ── SHEET 2: QUOTATION DETAIL ─────────────────────────────────────
  const detSheet = wb.addWorksheet('Quotation Detail', { pageSetup: { paperSize: 9 } });
  COLS.forEach((col, i) => { detSheet.getColumn(i + 1).width = col.width; });

  let dr = 1;

  // Info header block
  infoRows.forEach(([label, val]) => {
    detSheet.getCell(dr, 1).value = label;
    detSheet.getCell(dr, 1).font = { bold: true, size: 8, color: { argb: 'FF555555' } };
    detSheet.getCell(dr, 2).value = val;
    detSheet.getCell(dr, 2).font = { size: 8 };
    detSheet.mergeCells(dr, 2, dr, 9);
    dr++;
  });
  dr++;

  // Title
  detSheet.getCell(dr, 1).value = 'QUOTATION';
  detSheet.getCell(dr, 1).font = { bold: true, size: 14 };
  detSheet.getCell(dr, 1).alignment = { horizontal: 'center' };
  detSheet.mergeCells(dr, 1, dr, 9);
  dr++;

  // Column headers
  const detHeaders = ['NO', 'ITEM / TASK', 'SPECIFICATION', 'QTY', 'UNIT', 'DUR', 'DUR UNIT', 'PRICE', 'AMOUNT'];
  detHeaders.forEach((h, i) => {
    const cell = detSheet.getCell(dr, i + 1);
    cell.value = h;
    headerStyle(cell);
  });
  detSheet.getRow(dr).height = 20;
  dr++;

  // Build rows matching PDF detail page logic
  const sectionTotalRows = []; // track section total row numbers for Subtotal SUM

  sections.forEach((sec, secIdx) => {
    const secItems = items.filter(i => (i.section_code || i.section || '_') === sec.code);
    if (secItems.length === 0) return;

    const secLetter = String.fromCharCode(65 + secIdx);
    const secName = stripPrefix(sec.name || `Section ${sec.code}`).replace(/^Set \d+ - /i, '');
    const secNameNorm = secName.toLowerCase().trim();

    // Section header row
    detSheet.getCell(dr, 1).value = secLetter;
    detSheet.getCell(dr, 1).alignment = { horizontal: 'right' };
    detSheet.getCell(dr, 2).value = secName.toUpperCase();
    detSheet.mergeCells(dr, 2, dr, 9);
    sectionRowStyle(detSheet, dr);
    detSheet.getRow(dr).height = 16;
    dr++;

    const itemRowsInSection = [];
    const categories = [...new Set(secItems.map(i => i.category).filter(Boolean))];

    // Detect redundant category: all categories have same stripped name as section
    const isRedundant = categories.length > 0 &&
      categories.every(c => stripPrefix(c).toLowerCase().trim() === secNameNorm);

    if (isRedundant) {
      // SKIP category level — use sub_categories as A.1/A.2, items as A.1.1
      const allCatItems = secItems.filter(i => i.category); // all items under these cats
      const subCategories = [...new Set(allCatItems.map(i => i.sub_category).filter(Boolean))];
      const noSubItems = allCatItems.filter(i => !i.sub_category);
      let l1 = 1;

      subCategories.forEach(sub => {
        const code = `${secLetter}.${l1}`;
        const subItems = allCatItems.filter(i => i.sub_category === sub);

        // Sub-category becomes the A.1 level header
        detSheet.getCell(dr, 1).value = code;
        detSheet.getCell(dr, 1).alignment = { horizontal: 'right' };
        detSheet.getCell(dr, 2).value = stripPrefix(sub).toUpperCase();
        detSheet.mergeCells(dr, 2, dr, 9);
        catRowStyle(detSheet, dr);
        detSheet.getRow(dr).height = 15;
        dr++;

        subItems.forEach((item, idx) => {
          writeItemRow(detSheet, dr, item, `${code}.${idx + 1}`, 1);
          itemRowsInSection.push(dr);
          dr++;
        });
        l1++;
      });

      noSubItems.forEach(item => {
        writeItemRow(detSheet, dr, item, `${secLetter}.${l1++}`, 0);
        itemRowsInSection.push(dr);
        dr++;
      });

      // Items with no category at all
      secItems.filter(i => !i.category).forEach((item, idx) => {
        writeItemRow(detSheet, dr, item, `${secLetter}.${l1++}`, 0);
        itemRowsInSection.push(dr);
        dr++;
      });

    } else if (categories.length > 0) {
      // Normal: Category → Sub-category → Items
      categories.forEach((cat, catIdx) => {
        const catCode = `${secLetter}.${catIdx + 1}`;
        const catItems = secItems.filter(i => i.category === cat);

        detSheet.getCell(dr, 1).value = catCode;
        detSheet.getCell(dr, 1).alignment = { horizontal: 'right' };
        detSheet.getCell(dr, 2).value = stripPrefix(cat).toUpperCase();
        detSheet.mergeCells(dr, 2, dr, 9);
        catRowStyle(detSheet, dr);
        detSheet.getRow(dr).height = 15;
        dr++;

        const subCategories = [...new Set(catItems.map(i => i.sub_category).filter(Boolean))];
        const noSubItems = catItems.filter(i => !i.sub_category);
        let l2 = 1;

        subCategories.forEach(sub => {
          const subCode = `${catCode}.${l2++}`;
          const subItems = catItems.filter(i => i.sub_category === sub);

          detSheet.getCell(dr, 1).value = subCode;
          detSheet.getCell(dr, 1).alignment = { horizontal: 'right' };
          detSheet.getCell(dr, 2).value = stripPrefix(sub);
          detSheet.mergeCells(dr, 2, dr, 9);
          subRowStyle(detSheet, dr);
          dr++;

          subItems.forEach((item, itemIdx) => {
            writeItemRow(detSheet, dr, item, `${subCode}.${itemIdx + 1}`, 2);
            itemRowsInSection.push(dr);
            dr++;
          });
        });

        noSubItems.forEach(item => {
          writeItemRow(detSheet, dr, item, `${catCode}.${l2++}`, 1);
          itemRowsInSection.push(dr);
          dr++;
        });
      });

      secItems.filter(i => !i.category).forEach((item, idx) => {
        writeItemRow(detSheet, dr, item, `${secLetter}.${idx + 1}`, 0);
        itemRowsInSection.push(dr);
        dr++;
      });

    } else {
      secItems.forEach((item, idx) => {
        writeItemRow(detSheet, dr, item, `${secLetter}.${idx + 1}`, 0);
        itemRowsInSection.push(dr);
        dr++;
      });
    }

    // Section total row — SUM formula
    detSheet.mergeCells(dr, 1, dr, 7);
    detSheet.getCell(dr, 8).value = 'Section Total';
    detSheet.getCell(dr, 8).font = { bold: true, size: 9 };
    detSheet.getCell(dr, 8).alignment = { horizontal: 'right' };

    if (itemRowsInSection.length > 0) {
      const sumParts = itemRowsInSection.map(r => `I${r}`).join(',');
      detSheet.getCell(dr, 9).value = { formula: `SUM(${sumParts})` };
    } else {
      detSheet.getCell(dr, 9).value = 0;
    }
    detSheet.getCell(dr, 9).numFmt = '#,##0';
    detSheet.getCell(dr, 9).font = { bold: true };
    detSheet.getCell(dr, 9).alignment = { horizontal: 'right' };
    detSheet.getCell(dr, 9).border = { top: { style: 'medium', color: { argb: 'FF1a1a1a' } }, bottom: { style: 'medium', color: { argb: 'FF1a1a1a' } } };
    sectionTotalRows.push(dr);
    dr += 2;
  });

  // ── Financial summary with FORMULAS ──────────────────────────────
  const mgmtDecimal = (eventData.mgmt_fee_rate || 0.10);
  const ppnDecimal = (eventData.ppn_rate || 0.12);

  // Subtotal = SUM of all section totals
  detSheet.mergeCells(dr, 1, dr, 7);
  detSheet.getCell(dr, 8).value = 'Subtotal';
  detSheet.getCell(dr, 8).font = { bold: true, size: 9, color: { argb: 'FF555555' } };
  detSheet.getCell(dr, 8).alignment = { horizontal: 'right' };
  const subtotalFormula = sectionTotalRows.map(r => `I${r}`).join(',');
  detSheet.getCell(dr, 9).value = { formula: `SUM(${subtotalFormula})` };
  detSheet.getCell(dr, 9).numFmt = '#,##0';
  detSheet.getCell(dr, 9).alignment = { horizontal: 'right' };
  detSheet.getCell(dr, 9).border = { bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } } };
  const subtotalRow = dr;
  dr++;

  // Discount (if any) — static value
  let afterDiscountRef = `I${subtotalRow}`;
  if (discountAmount > 0) {
    detSheet.mergeCells(dr, 1, dr, 7);
    detSheet.getCell(dr, 8).value = opts.discount_type === 'pct' ? `Diskon (${opts.discount_value}%)` : 'Diskon';
    detSheet.getCell(dr, 8).font = { bold: true, size: 9, color: { argb: 'FF555555' } };
    detSheet.getCell(dr, 8).alignment = { horizontal: 'right' };
    detSheet.getCell(dr, 9).value = -discountAmount;
    detSheet.getCell(dr, 9).numFmt = '#,##0';
    detSheet.getCell(dr, 9).alignment = { horizontal: 'right' };
    detSheet.getCell(dr, 9).border = { bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } } };
    afterDiscountRef = `I${subtotalRow}+I${dr}`;
    dr++;
  }

  // Management Fee = (Subtotal - Discount) × rate
  detSheet.mergeCells(dr, 1, dr, 7);
  detSheet.getCell(dr, 8).value = `Management Fee (${Math.round(mgmtDecimal * 100)}%)`;
  detSheet.getCell(dr, 8).font = { bold: true, size: 9, color: { argb: 'FF555555' } };
  detSheet.getCell(dr, 8).alignment = { horizontal: 'right' };
  detSheet.getCell(dr, 9).value = { formula: `(${afterDiscountRef})*${mgmtDecimal}` };
  detSheet.getCell(dr, 9).numFmt = '#,##0';
  detSheet.getCell(dr, 9).alignment = { horizontal: 'right' };
  detSheet.getCell(dr, 9).border = { bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } } };
  const mgmtRow = dr;
  dr++;

  // Tax Base (DPP) = (Subtotal - Discount) + Mgmt Fee
  detSheet.mergeCells(dr, 1, dr, 7);
  detSheet.getCell(dr, 8).value = 'Tax Base (DPP)';
  detSheet.getCell(dr, 8).font = { bold: true, size: 9, color: { argb: 'FF555555' } };
  detSheet.getCell(dr, 8).alignment = { horizontal: 'right' };
  detSheet.getCell(dr, 9).value = { formula: `(${afterDiscountRef})+I${mgmtRow}` };
  detSheet.getCell(dr, 9).numFmt = '#,##0';
  detSheet.getCell(dr, 9).alignment = { horizontal: 'right' };
  detSheet.getCell(dr, 9).border = { bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } } };
  const dppRow = dr;
  dr++;

  // PPN = DPP × rate
  detSheet.mergeCells(dr, 1, dr, 7);
  detSheet.getCell(dr, 8).value = `PPN ${Math.round(ppnDecimal * 100)}%`;
  detSheet.getCell(dr, 8).font = { bold: true, size: 9, color: { argb: 'FF555555' } };
  detSheet.getCell(dr, 8).alignment = { horizontal: 'right' };
  detSheet.getCell(dr, 9).value = { formula: `I${dppRow}*${ppnDecimal}` };
  detSheet.getCell(dr, 9).numFmt = '#,##0';
  detSheet.getCell(dr, 9).alignment = { horizontal: 'right' };
  detSheet.getCell(dr, 9).border = { bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } } };
  const ppnRow = dr;
  dr++;

  // Grand Total = DPP + PPN
  detSheet.mergeCells(dr, 1, dr, 7);
  detSheet.getCell(dr, 8).value = 'GRAND TOTAL';
  detSheet.getCell(dr, 9).value = { formula: `I${dppRow}+I${ppnRow}` };
  detSheet.getCell(dr, 9).numFmt = '#,##0';
  for (let c = 8; c <= 9; c++) {
    const cell = detSheet.getCell(dr, c);
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1a1a1a' } };
    cell.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
    cell.alignment = { horizontal: 'right' };
  }
  dr += 3;

  // Notes
  const defaultNotes = [
    'Offering Validations:',
    'The offer price above valid as long as the term specified',
    'The Offer Price Included Rehearsal D-1',
  ];
  const notes = eventData.notes?.length ? eventData.notes : defaultNotes;
  detSheet.getCell(dr, 1).value = 'NOTE :';
  detSheet.getCell(dr, 1).font = { bold: true, size: 8 };
  dr++;
  notes.forEach(n => {
    detSheet.getCell(dr, 1).value = `• ${n}`;
    detSheet.getCell(dr, 1).font = { size: 8 };
    detSheet.mergeCells(dr, 1, dr, 9);
    dr++;
  });
  dr += 2;

  // Signatory
  detSheet.getCell(dr, 1).value = `${eventData.city || 'Jakarta'}, ${fmtDate(eventData.event_date)}`;
  dr++;
  detSheet.getCell(dr, 1).value = 'Submitted by,';
  dr += 4;
  detSheet.getCell(dr, 1).value = eventData.signatory || '';
  detSheet.getCell(dr, 1).font = { bold: true, underline: true };
  dr++;
  detSheet.getCell(dr, 1).value = COMPANY;

  // ── WRITE FILE ────────────────────────────────────────────────────
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeTitle = (eventData.title || 'quotation').replace(/[^a-zA-Z0-9]/g, '_');
  a.href = url;
  a.download = `${eventData.quot_number || 'draft'}_${safeTitle}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function writeItemRow(ws, rowNum, item, num, depth) {
  const durQty  = item.duration_qty  ?? item.freq ?? 1;
  const durUnit = item.duration_unit ?? item.freq_unit ?? 'day';
  const priceInput = item.unit_sell ?? item.unit_price;
  const isNumericPrice = priceInput !== null && priceInput !== undefined && priceInput !== '' && !isNaN(Number(priceInput));
  const isProvided = !!item.provided_by;

  ws.getCell(rowNum, 1).value = num;
  ws.getCell(rowNum, 1).alignment = { horizontal: 'right' };
  ws.getCell(rowNum, 1).font = { size: 8, color: { argb: 'FF888888' } };

  const indent = depth * 2;
  ws.getCell(rowNum, 2).value = (item.item_name || '—');
  ws.getCell(rowNum, 2).alignment = { indent, wrapText: true, vertical: 'top' };
  ws.getCell(rowNum, 2).font = { size: 9 };

  ws.getCell(rowNum, 3).value = item.spec || item.specification || '';
  ws.getCell(rowNum, 3).alignment = { wrapText: true, vertical: 'top' };
  ws.getCell(rowNum, 3).font = { size: 8, color: { argb: 'FF666666' } };

  ws.getCell(rowNum, 4).value = item.qty || 0;
  ws.getCell(rowNum, 4).alignment = { horizontal: 'right' };
  ws.getCell(rowNum, 4).font = { bold: true, size: 9 };

  ws.getCell(rowNum, 5).value = item.qty_unit || '';
  ws.getCell(rowNum, 5).alignment = { horizontal: 'center' };
  ws.getCell(rowNum, 5).font = { size: 8, color: { argb: 'FF777777' } };

  ws.getCell(rowNum, 6).value = durQty;
  ws.getCell(rowNum, 6).alignment = { horizontal: 'right' };
  ws.getCell(rowNum, 6).font = { size: 9 };

  ws.getCell(rowNum, 7).value = durUnit;
  ws.getCell(rowNum, 7).alignment = { horizontal: 'center' };
  ws.getCell(rowNum, 7).font = { size: 8, color: { argb: 'FF777777' } };

  // PRICE column
  if (isProvided) {
    ws.getCell(rowNum, 8).value = `Provided by ${item.provided_by}`;
  } else if (isNumericPrice) {
    ws.getCell(rowNum, 8).value = Number(priceInput);
    ws.getCell(rowNum, 8).numFmt = '#,##0';
  } else {
    ws.getCell(rowNum, 8).value = priceInput || '';
  }
  ws.getCell(rowNum, 8).alignment = { horizontal: 'right' };
  ws.getCell(rowNum, 8).font = { size: 9 };

  // AMOUNT column — FORMULA: =QTY * DUR * PRICE
  if (isProvided) {
    ws.getCell(rowNum, 9).value = `Provided by ${item.provided_by}`;
  } else if (isNumericPrice) {
    ws.getCell(rowNum, 9).value = { formula: `D${rowNum}*F${rowNum}*H${rowNum}` };
    ws.getCell(rowNum, 9).numFmt = '#,##0';
  } else {
    ws.getCell(rowNum, 9).value = '';
  }
  ws.getCell(rowNum, 9).alignment = { horizontal: 'right' };
  ws.getCell(rowNum, 9).font = { bold: true, size: 9 };

  for (let c = 1; c <= 9; c++) {
    applyBorder(ws.getCell(rowNum, c));
  }
}
