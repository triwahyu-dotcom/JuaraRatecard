/**
 * Juara Ratecard - New Calculation Engine
 * =========================================
 * Mendukung kalkulasi 4-parameter: qty × duration × frequency × unit_price
 * dan commercial layer: discount → management fee → tax base → PPN → Grand Total
 */

// ── Line Calculation ─────────────────────────────────────────────────────────

// Helper to check if a value is effectively numeric
function isValNumeric(val) {
  if (val === null || val === undefined || val === '') return false;
  const n = Number(val);
  return !isNaN(n) && isFinite(n);
}

/**
 * Hitung total HPP (biaya) sebuah baris quotation.
 * amount_cost = qty × duration_qty × frequency_qty × unit_cost
 */
export function calcLineCost(item) {
  if (item.is_complimentary || item.provided_by) return 0;
  if (!isValNumeric(item.unit_cost) || Number(item.unit_cost) <= 0) return 0;
  
  // If unit_sell is a text label, cost should also be 0 (usually)
  if (item.unit_sell && !isValNumeric(item.unit_sell)) return 0;

  const qty      = Number(item.qty)           || 0;
  const duration = Number(item.duration_qty)  || 1;
  const freq     = Number(item.frequency_qty) || 1;
  return qty * duration * freq * Number(item.unit_cost);
}

/**
 * Hitung total harga jual sebuah baris quotation.
 * amount_price = qty × duration_qty × frequency_qty × unit_price
 */
export function calcLineSell(item) {
  if (item.is_complimentary || item.provided_by) return 0;
  
  const priceInput = item.unit_sell;
  if (!isValNumeric(priceInput)) return 0;

  const price    = Number(priceInput);
  const qty      = Number(item.qty)           || 0;
  const duration = Number(item.duration_qty)  || 1;
  const freq     = Number(item.frequency_qty) || 1;
  return qty * duration * freq * price;
}

// ── Margin Calculation ───────────────────────────────────────────────────────

/**
 * Hitung margin % dari harga jual.
 * Margin = (Sell - Cost) / Sell × 100
 */
export function calcMarginPct(cost, sell) {
  if (!cost || !sell || sell === 0) return 0;
  return ((sell - cost) / sell) * 100;
}

/**
 * Hitung harga jual dari cost dan target margin %.
 */
export function calcSellFromMargin(cost, marginPct) {
  if (!cost || cost === 0) return 0;
  if (marginPct >= 100) return cost * 10; // safety ceiling
  return Math.round(cost / (1 - marginPct / 100));
}

// ── Tax Calculation ──────────────────────────────────────────────────────────

const PPH_RATES = {
  pph23_2: 0.02,
  pph21_25: 0.025,
  pph21_3: 0.03,
  pph42_10: 0.10,
};

/**
 * Hitung potongan PPh dari biaya vendor.
 */
export function calcVendorTax(lineCost, taxType) {
  if (!taxType || !lineCost) return 0;
  const rate = PPH_RATES[taxType] || 0;
  return Math.round(lineCost * rate);
}

/**
 * Hitung net biaya vendor setelah potongan PPh.
 */
export function calcNetVendorCost(lineCost, taxType) {
  return lineCost - calcVendorTax(lineCost, taxType);
}

// ── Section Totals ───────────────────────────────────────────────────────────

export function calcAllSectionSellTotals(items) {
  const totals = {};
  items.forEach(item => {
    const sec = item.section_code || item.section || '_';
    if (!totals[sec]) totals[sec] = 0;
    totals[sec] += calcLineSell(item);
  });
  return totals;
}

// ── Quotation Summary (Commercial Layer) ─────────────────────────────────────

/**
 * Hitung ringkasan finansial quotation lengkap.
 *
 * Flow:
 *   Subtotal (sum line items, non-optional)
 *   → Discount
 *   → After Discount
 *   → Management Fee (default 10%)
 *   → Tax Base (DPP) = After Discount + Management Fee
 *   → PPN (default 12%)
 *   → Grand Total = Tax Base + PPN
 *
 * @param {Array}  items              - quotation line items
 * @param {Object} opts
 * @param {string} opts.discount_type - 'pct' | 'fixed'
 * @param {number} opts.discount_value
 * @param {string} opts.mgmt_type    - 'pct' | 'fixed'
 * @param {number} opts.mgmt_value   - default 10
 * @param {number} opts.ppn_rate     - default 12
 * @returns {Object} summary financials
 */
export function getQuotationLines(quotation) {
  if (!quotation) return [];
  return quotation.items || quotation.quotation_items || quotation.quotation_line || quotation.lines || [];
}

export function calcSummary(items, opts = {}) {
  let {
    discount_type  = 'amt',
    discount_value = 0,
    mgmt_type      = 'pct',
    mgmt_value     = 10,
    ppn_rate       = 12,
  } = opts;

  // Normalize rates: Ensure we use decimals (0.12) for calculations
  // If > 1, assume it's a percentage (12) and convert to decimal (0.12)
  const ppnDecimal = ppn_rate > 1 ? ppn_rate / 100 : ppn_rate;
  const mgmtDecimal = mgmt_value > 1 ? mgmt_value / 100 : mgmt_value;

  // 1. Subtotal: hanya non-optional lines
  const subtotal  = (items || [])
    .filter(i => !i.is_optional)
    .reduce((sum, i) => sum + calcLineSell(i), 0);

  // 2. Total HPP (internal CE)
  const totalHPP  = (items || [])
    .filter(i => !i.is_optional)
    .reduce((sum, i) => sum + calcLineCost(i), 0);

  // 3. Discount
  let discountAmount = 0;
  if (discount_type === 'pct') {
    discountAmount = Math.round(subtotal * (discount_value / 100));
  } else {
    discountAmount = Number(discount_value) || 0;
  }

  // 4. After discount
  const afterDiscount = subtotal - discountAmount;

  // 5. Management Fee (dihitung dari after discount)
  let mgmtFeeAmount = 0;
  if (mgmt_type === 'pct') {
    mgmtFeeAmount = Math.round(afterDiscount * mgmtDecimal);
  } else {
    mgmtFeeAmount = Number(mgmt_value) || 0;
  }

  // 6. Tax Base (DPP)
  const taxBase = afterDiscount + mgmtFeeAmount;

  // 7. PPN
  const ppnAmount = Math.round(taxBase * ppnDecimal);

  // 8. Grand Total
  const grandTotal = taxBase + ppnAmount;

  // 9. Vendor Taxes (PPh)
  const vendorTaxTotal = (items || [])
    .filter(i => !i.is_optional)
    .reduce((sum, i) => sum + calcVendorTax(calcLineCost(i), i.vendor_tax_type), 0);

  // 10. Gross Margin
  const grossProfit  = subtotal - totalHPP;
  const grossMarginPct = subtotal > 0 ? (grossProfit / subtotal) * 100 : 0;

  // 11. Net Profit (takeaway after vendor tax withholding)
  const netProfit = grossProfit - vendorTaxTotal;
  const netMarginPct = subtotal > 0 ? (netProfit / subtotal) * 100 : 0;

  return {
    subtotal,
    totalHPP,
    discountAmount,
    afterDiscount,
    mgmtFeeAmount,
    taxBase,
    ppnAmount,
    grandTotal,
    grossProfit,
    grossMarginPct,
    vendorTaxTotal,
    netProfit,
    netMarginPct,
  };
}

// ── Unique Sections ───────────────────────────────────────────────────────────

import { getCategoryOrder } from './constants'

export function getUniqueSections(items) {
  const seen = new Set();
  const sections = [];
  items.forEach(item => {
    const code = item.section_code || item.section || '_';
    let name = item.section_name || '';
    if (name.toLowerCase().includes('miscellaneous')) name = 'Other';
    if (!seen.has(code)) {
      seen.add(code);
      sections.push({ code, name });
    }
  });
  
  // Sort by master order defined in constants.js
  return sections.sort((a, b) => {
    const orderA = getCategoryOrder(a.name || a.code);
    const orderB = getCategoryOrder(b.name || b.code);
    return orderA - orderB;
  });
}
