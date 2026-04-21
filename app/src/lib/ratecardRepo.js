/**
 * Juara Ratecard - Data Repository Layer
 * ========================================
 * Mendukung mode ganda:
 *   1. localStorage DRAFT  — penyimpanan sementara (selalu aktif)
 *   2. Supabase REMOTE     — penyimpanan permanen (bila env dikonfigurasi)
 *
 * Strategi:
 *  - READ : cek localStorage terlebih dahulu, fallback ke Supabase
 *  - WRITE: tulis ke localStorage sekaligus ke Supabase (write-through)
 *  - SYNC : bisa force-sync dari Supabase ke localStorage
 */

import { supabase, isSupabaseEnabled } from './supabase.js';

const LS_KEYS = {
  categories:    'juara_master_categories',
  subcategories: 'juara_master_subcategories',
  units:         'juara_master_units',
  zones:         'juara_master_zones',
  vendors:       'juara_master_vendors',
  clients:       'juara_master_clients',
  items:         'juara_master_items',
  ratecards:     'juara_ratecards',
  ratecard_lines:'juara_ratecard_lines',
  quotations:    'juara_quotations',
  full_master:   'juara_full_master_data', // New standardized master data
};

// ── Local Storage Helpers ─────────────────────────────────────────────────────
function lsGet(key) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : null;
  } catch { return null; }
}
function lsSet(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
}
function lsDel(key) {
  try { localStorage.removeItem(key); } catch {}
}

// ── Generic Remote Fetch ──────────────────────────────────────────────────────
async function remoteSelect(table, options = {}) {
  if (!isSupabaseEnabled) return null;
  try {
    let q = supabase.from(table).select(options.select || '*');
    if (options.filter) options.filter(q);
    if (options.order)  q = q.order(options.order.col, { ascending: options.order.asc ?? true });
    const { data, error } = await q;
    if (error) throw error;
    return data;
  } catch (e) {
    console.warn(`[repo] remoteSelect ${table} failed:`, e.message);
    return null;
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// MASTER DATA
// ══════════════════════════════════════════════════════════════════════════════

export async function getCategories() {
  const cached = lsGet(LS_KEYS.categories);
  if (cached) return cached;
  const remote = await remoteSelect('master_category', { order: { col: 'sort_order' } });
  if (remote) lsSet(LS_KEYS.categories, remote);
  return remote ?? [];
}

export async function getSubcategories(categoryId = null) {
  const cached = lsGet(LS_KEYS.subcategories) ?? [];
  const list = cached.length ? cached : (await remoteSelect('master_subcategory', { order: { col: 'sort_order' } }) ?? []);
  if (!cached.length && list.length) lsSet(LS_KEYS.subcategories, list);
  return categoryId ? list.filter(s => s.category_id === categoryId) : list;
}

export async function getUnits() {
  const cached = lsGet(LS_KEYS.units);
  if (cached) return cached;
  const remote = await remoteSelect('master_unit', { order: { col: 'unit_code' } });
  if (remote) lsSet(LS_KEYS.units, remote);
  return remote ?? [];
}

export async function getZones() {
  const cached = lsGet(LS_KEYS.zones);
  if (cached) return cached;
  const remote = await remoteSelect('master_zone', { order: { col: 'zone_code' } });
  if (remote) lsSet(LS_KEYS.zones, remote);
  return remote ?? [];
}

export async function getVendors() {
  const cached = lsGet(LS_KEYS.vendors);
  if (cached) return cached;
  const remote = await remoteSelect('master_vendor', { order: { col: 'vendor_name' } });
  if (remote) lsSet(LS_KEYS.vendors, remote);
  return remote ?? [];
}

export async function getClients() {
  const cached = lsGet(LS_KEYS.clients);
  if (cached) return cached;
  const remote = await remoteSelect('master_client', { order: { col: 'client_name' } });
  if (remote) lsSet(LS_KEYS.clients, remote);
  return remote ?? [];
}

// ── Master Items ──────────────────────────────────────────────────────────────
export async function getMasterItems(subcategoryId = null) {
  let cached = lsGet(LS_KEYS.items) ?? [];
  if (!cached.length) {
    const remote = await remoteSelect('master_item', {
      select: `*, master_subcategory(id, code, name, category_id, master_category(id, code, name))`,
      order:  { col: 'item_name' },
    });
    if (remote) {
      cached = remote;
      lsSet(LS_KEYS.items, cached);
    }
  }
  return subcategoryId ? cached.filter(i => i.subcategory_id === subcategoryId) : cached;
}

export async function createMasterItem(payload) {
  const items  = await getMasterItems();
  const newItem = { ...payload, id: crypto.randomUUID(), created_at: new Date().toISOString() };
  items.push(newItem);
  lsSet(LS_KEYS.items, items);

  // Sync with master categories/subcategories if they don't exist
  if (payload.category) {
    const cats = await getCategories();
    if (!cats.some(c => c.name === payload.category)) {
      const newCat = { id: crypto.randomUUID(), name: payload.category, code: payload.section || payload.category.toUpperCase().slice(0,3), sort_order: cats.length };
      lsSet(LS_KEYS.categories, [...cats, newCat]);
      if (isSupabaseEnabled) await supabase.from('master_category').insert(newCat);
    }
  }

  if (isSupabaseEnabled) {
    const { error } = await supabase.from('master_item').insert(payload);
    if (error) console.warn('[repo] createMasterItem remote error:', error.message);
  }
  return newItem;
}

export async function ensureCategoryExists(catName, sectionCode = 'A') {
  const cats = await getCategories();
  if (cats.some(c => c.name === catName || c.code === catName)) return;

  const newCat = {
    id: crypto.randomUUID(),
    name: catName,
    code: sectionCode || catName.toUpperCase().slice(0, 3),
    sort_order: cats.length
  };
  
  const updated = [...cats, newCat];
  lsSet(LS_KEYS.categories, updated);
  
  if (isSupabaseEnabled) {
    await supabase.from('master_category').insert(newCat);
  }
}

export async function updateMasterItem(id, updates) {
  const items = await getMasterItems();
  const idx   = items.findIndex(i => i.id === id);
  if (idx < 0) throw new Error('master_item not found');
  items[idx] = { ...items[idx], ...updates, updated_at: new Date().toISOString() };
  lsSet(LS_KEYS.items, items);

  if (isSupabaseEnabled) {
    const { error } = await supabase.from('master_item').update(updates).eq('id', id);
    if (error) console.warn('[repo] updateMasterItem remote error:', error.message);
  }
  return items[idx];
}

export async function deleteMasterItem(id) {
  const items = await getMasterItems();
  lsSet(LS_KEYS.items, items.filter(i => i.id !== id));

  if (isSupabaseEnabled) {
    const { error } = await supabase.from('master_item').delete().eq('id', id);
    if (error) console.warn('[repo] deleteMasterItem remote error:', error.message);
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// RATE CARD
// ══════════════════════════════════════════════════════════════════════════════

export async function getRateCards() {
  const cached = lsGet(LS_KEYS.ratecards);
  if (cached) return cached;
  const remote = await remoteSelect('rate_card', { order: { col: 'effective_date', asc: false } });
  if (remote) lsSet(LS_KEYS.ratecards, remote);
  return remote ?? [];
}

export async function getActiveRateCard() {
  const cards = await getRateCards();
  return cards.find(c => c.status === 'active') ?? cards[0] ?? null;
}

export async function getRateCardLines(rateCardId) {
  if (!rateCardId) return [];
  const cached = lsGet(LS_KEYS.ratecard_lines) ?? [];
  if (cached.length) return cached.filter(l => l.rate_card_id === rateCardId);

  const remote = await remoteSelect('rate_card_line', {
    select: `*, master_item(id, item_code, item_name, item_type), master_subcategory(id, code, name), master_category(id, code, name), master_unit(id, unit_code, unit_name)`,
    filter: q => q.eq('rate_card_id', rateCardId),
    order:  { col: 'id' },
  });
  if (remote) {
    const all = [...cached.filter(l => l.rate_card_id !== rateCardId), ...remote];
    lsSet(LS_KEYS.ratecard_lines, all);
    return remote;
  }
  return [];
}

// ── Search Rate Card Lines (for Quotation Builder picker) ─────────────────────
export async function searchRateCardLines(rateCardId, query = '') {
  const lines = await getRateCardLines(rateCardId);
  if (!query.trim()) return lines;
  const q = query.toLowerCase();
  return lines.filter(l =>
    l.master_item?.item_name?.toLowerCase().includes(q) ||
    l.master_subcategory?.name?.toLowerCase().includes(q) ||
    l.master_category?.name?.toLowerCase().includes(q)
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// QUOTATION (localStorage draft + write-through to Supabase)
// ══════════════════════════════════════════════════════════════════════════════

function getAllQuotations() {
  return lsGet(LS_KEYS.quotations) ?? [];
}
function saveAllQuotations(list) {
  lsSet(LS_KEYS.quotations, list);
}

export function getQuotationsLocal() {
  return getAllQuotations();
}

export async function getQuotation(id) {
  const local = getAllQuotations().find(q => q.id === id);
  if (local) return local;
  if (!isSupabaseEnabled) return null;
  const { data } = await supabase
    .from('quotation')
    .select('*, quotation_line(*)')
    .eq('id', id)
    .single();
  return data ?? null;
}

export async function createQuotation(payload) {
  const quotations = getAllQuotations();
  const now = new Date().toISOString();
  const newQ = {
    id:                 crypto.randomUUID(),
    quotation_version:  1,
    status:             'draft',
    quotation_date:     now.split('T')[0],
    subtotal:           0,
    discount_type:      'pct',
    discount_value:     0,
    discount_amount:    0,
    management_fee_type: 'pct',
    management_fee_value: 10,
    management_fee_amount: 0,
    ppn_rate:           12,
    ppn_amount:         0,
    tax_base:           0,
    grand_total:        0,
    lines:              [],
    ...payload,
    created_at: now,
    updated_at: now,
  };
  quotations.unshift(newQ);
  saveAllQuotations(quotations);

  if (isSupabaseEnabled) {
    const { lines, ...header } = newQ;
    const { error } = await supabase.from('quotation').insert(header);
    if (error) console.warn('[repo] createQuotation remote error:', error.message);
  }
  return newQ;
}

export async function updateQuotation(id, updates) {
  const quotations = getAllQuotations();
  const idx = quotations.findIndex(q => q.id === id);
  if (idx < 0) throw new Error('Quotation not found');
  quotations[idx] = { ...quotations[idx], ...updates, updated_at: new Date().toISOString() };
  saveAllQuotations(quotations);

  if (isSupabaseEnabled) {
    const { lines, ...header } = updates;
    const { error } = await supabase.from('quotation').update(header).eq('id', id);
    if (error) console.warn('[repo] updateQuotation remote error:', error.message);
  }
  return quotations[idx];
}

export async function deleteQuotation(id) {
  const quotations = getAllQuotations();
  saveAllQuotations(quotations.filter(q => q.id !== id));

  if (isSupabaseEnabled) {
    const { error } = await supabase.from('quotation').delete().eq('id', id);
    if (error) console.warn('[repo] deleteQuotation remote error:', error.message);
  }
}

// ── Quotation Lines ───────────────────────────────────────────────────────────
export async function getQuotationLines(quotationId) {
  const q = getAllQuotations().find(q => q.id === quotationId);
  if (q?.lines) return q.lines;
  if (!isSupabaseEnabled) return [];
  const { data } = await supabase
    .from('quotation_line')
    .select('*')
    .eq('quotation_id', quotationId)
    .order('sort_order');
  return data ?? [];
}

export async function upsertQuotationLines(quotationId, lines) {
  const quotations = getAllQuotations();
  const idx = quotations.findIndex(q => q.id === quotationId);
  if (idx < 0) throw new Error('Quotation not found');
  quotations[idx].lines = lines;
  quotations[idx].updated_at = new Date().toISOString();
  saveAllQuotations(quotations);

  if (isSupabaseEnabled) {
    // Delete all existing lines then re-insert
    await supabase.from('quotation_line').delete().eq('quotation_id', quotationId);
    if (lines.length) {
      const { error } = await supabase.from('quotation_line').insert(
        lines.map((l, i) => ({
          quotation_id: quotationId,
          sort_order: i,
          ...l,
          id: l.id ?? crypto.randomUUID(),
        }))
      );
      if (error) console.warn('[repo] upsertQuotationLines remote error:', error.message);
    }
  }
  return lines;
}

// ── Sync helpers ──────────────────────────────────────────────────────────────

/**
 * Force-sync semua master data dari Supabase ke localStorage.
 * Panggil setelah login atau saat pertama buka app.
 */
export async function syncMasterDataFromRemote() {
  if (!isSupabaseEnabled) return;
  const results = await Promise.allSettled([
    remoteSelect('master_category',    { order: { col: 'sort_order' } }),
    remoteSelect('master_subcategory', { order: { col: 'sort_order' } }),
    remoteSelect('master_unit',        { order: { col: 'unit_code'  } }),
    remoteSelect('master_zone',        { order: { col: 'zone_code'  } }),
    remoteSelect('master_vendor',      { order: { col: 'vendor_name'} }),
    remoteSelect('master_client',      { order: { col: 'client_name'} }),
    remoteSelect('master_item',        { order: { col: 'item_name'  } }),
    remoteSelect('rate_card',          { order: { col: 'effective_date', asc: false } }),
  ]);

  const keys = [
    LS_KEYS.categories, LS_KEYS.subcategories, LS_KEYS.units,
    LS_KEYS.zones, LS_KEYS.vendors, LS_KEYS.clients,
    LS_KEYS.items, LS_KEYS.ratecards,
  ];

  results.forEach((r, i) => {
    if (r.status === 'fulfilled' && r.value) {
      lsSet(keys[i], r.value);
    }
  });

  console.log('[repo] Master data synced from Supabase.');
}

/**
 * Bersihkan semua cache localStorage.
 */
export function clearLocalCache() {
  Object.values(LS_KEYS).forEach(lsDel);
}

// ── BACKWARD COMPAT (Legacy Ratecard Manager page) ───────────────────────────
// Agar Ratecard.jsx tidak pecah saat migrasi bertahap

const LEGACY_LS_KEY = 'juara_ratecard_items';

export async function getAllRatecardItems() {
  // 1. Check new master data first
  let fullMaster = lsGet(LS_KEYS.full_master);
  
  if (!fullMaster) {
    try {
      const res = await fetch('/master_data.json');
      fullMaster = await res.json();
      lsSet(LS_KEYS.full_master, fullMaster);
    } catch (e) {
      console.error('[repo] Failed to load master_data.json:', e);
    }
  }

  if (fullMaster?.items?.length) {
    // Map to UI format: Category > Subcategory > Item
    return fullMaster.items.map(i => ({
      ...i,
      id:           i.item_code || crypto.randomUUID(),
      section:      i.category || 'Miscellaneous',
      section_name: i.category || 'Miscellaneous',
      category:     i.subcategory || 'General',
      item_name:    i.item_name,
      description:  i.item_type || '',
      qty_default:  i.qty_default || 1,
      qty_unit:     i.qty_unit || 'unit',
      freq_default: i.freq_default || 1,
      freq_unit:    i.freq_unit || 'day',
      unit_cost:    i.unit_cost || null,
      unit_sell:    i.unit_price || null,
      sort_order:   0,
      _is_new_schema: true,
    }));
  }

  // Fallback to legacy if something went wrong
  const legacy = lsGet(LEGACY_LS_KEY);
  if (legacy) {
    return legacy.map(i => ({
      ...i,
      qty_default: i.qty_default || 1,
      freq_default: i.freq_default || 1,
      qty_unit: i.qty_unit || 'unit',
      freq_unit: i.freq_unit || 'day'
    }));
  }
  
  return [];
}

export async function getMasterUnits() {
  const full = lsGet(LS_KEYS.full_master);
  return full?.units || [];
}

export async function getMasterZones() {
  const full = lsGet(LS_KEYS.full_master);
  return full?.zones || [];
}

export async function createRatecardItem(item) {
  const items  = lsGet(LEGACY_LS_KEY) ?? [];
  const newItem = { ...item, id: crypto.randomUUID(), sort_order: items.length };
  items.push(newItem);
  lsSet(LEGACY_LS_KEY, items);
  return newItem;
}

export async function updateRatecardItem(id, updates) {
  const items = lsGet(LEGACY_LS_KEY) ?? [];
  const idx   = items.findIndex(i => i.id === id);
  if (idx >= 0) { items[idx] = { ...items[idx], ...updates }; lsSet(LEGACY_LS_KEY, items); }
}

export async function deleteRatecardItem(id) {
  const items = lsGet(LEGACY_LS_KEY) ?? [];
  lsSet(LEGACY_LS_KEY, items.filter(i => i.id !== id));
}

export async function renameSection(oldCode, newCode, newName) {
  const items = lsGet(LEGACY_LS_KEY) ?? [];
  items.forEach(i => {
    if (i.section === oldCode) { i.section = newCode ?? oldCode; i.section_name = newName ?? i.section_name; }
  });
  lsSet(LEGACY_LS_KEY, items);
}

export async function resetToDefault() {
  lsDel(LEGACY_LS_KEY);
  return getAllRatecardItems();
}

export async function exportRatecardJSON() {
  return getAllRatecardItems();
}
