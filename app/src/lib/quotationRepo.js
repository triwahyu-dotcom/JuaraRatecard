/**
 * Quotation Repository
 * ====================
 * Storage strategy:
 *   - localStorage: draft mode (always available, instant)
 *   - Supabase: permanent storage (write-through when configured)
 *
 * Table names (new schema):
 *   quotation       — header
 *   quotation_line  — line items
 */
import { supabase, isSupabaseEnabled } from './supabase';

const LS_KEY = 'juara_quotations';

// ── localStorage helpers ──────────────────────────────────────────────────────
function lsGetAll() {
  try {
    const data = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
    // Seed demo data on very first load
    if (data.length === 0 && !localStorage.getItem('juara_dummy_seeded')) {
      const dummy = [{
        id: 'dummy-1234',
        quotation_no: 'EST-2026/08-001',
        quotation_version: 1,
        quotation_date: '2026-08-01',
        client_id: null,
        client_name: 'PT Mencari Cinta Sejati',
        project_name: 'Konser Musik Indie 2026',
        event_name: 'Konser Musik Indie 2026',
        event_date_start: '2026-08-17',
        event_date_end: '2026-08-17',
        venue_name: 'Stadion Utama',
        city: 'Jakarta',
        signatory: 'Eka Marutha Yuswardana',
        discount_type: 'pct',
        discount_value: 0,
        discount_amount: 0,
        management_fee_type: 'pct',
        management_fee_value: 20,
        management_fee_amount: 0,
        ppn_rate: 12,
        ppn_amount: 0,
        tax_base: 0,
        subtotal: 0,
        grand_total: 0,
        notes: [
          'The offer price above valid as long as the term specified',
          'The Offer Price Included Rehearsal D-1',
        ],
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // embedded lines (localStorage mode)
        quotation_items: [
          { id: 'qi-1', section_code: 'PR-SS', section_name: 'Permit & Retribusi', item_name: 'Medical / Ambulance', variant_name: 'VVIP Mini ICU', zone_name: 'Outdoor Area', spec: 'Incld Mobil Ambulance & Peralatan', qty: 1, qty_unit: 'unit/day', duration_qty: 1, duration_unit: 'day', frequency_qty: 1, frequency_unit: 'event', unit_cost: null, unit_price: 3500000, is_complimentary: false, sort_order: 0 },
          { id: 'qi-2', section_code: 'VS-SS', section_name: 'Venue / Setup / System', item_name: 'Standard Baricade', variant_name: null, zone_name: 'Entrance Gate', spec: 'Barikade Hitam 1.2m', qty: 10, qty_unit: 'unit', duration_qty: 1, duration_unit: 'day', frequency_qty: 1, frequency_unit: 'event', unit_cost: null, unit_price: 35000, is_complimentary: false, sort_order: 1 },
          { id: 'qi-3', section_code: 'VS-SS', section_name: 'Venue / Setup / System', item_name: 'Genset 60 kVA', variant_name: 'Portable', zone_name: 'Backstage', spec: '12 hours, silent type', qty: 1, qty_unit: 'unit', duration_qty: 1, duration_unit: 'day', frequency_qty: 1, frequency_unit: 'event', unit_cost: null, unit_price: 3500000, is_complimentary: false, sort_order: 2 },
          { id: 'qi-4', section_code: 'VS-SS', section_name: 'Venue / Setup / System', item_name: 'Sound System 10000 Watt', variant_name: 'Standard', zone_name: 'Main Hall', spec: '', qty: 1, qty_unit: 'set', duration_qty: 1, duration_unit: 'day', frequency_qty: 1, frequency_unit: 'event', unit_cost: null, unit_price: 7500000, is_complimentary: false, sort_order: 3 },
        ],
      }];
      localStorage.setItem(LS_KEY, JSON.stringify(dummy));
      localStorage.setItem('juara_dummy_seeded', 'true');
      return dummy;
    }
    return data;
  } catch { return []; }
}

function lsSave(data) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function getAllQuotations() {
  let remote = [];
  if (isSupabaseEnabled) {
    const { data, error } = await supabase
      .from('quotation')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) remote = data;
  }
  const local = lsGetAll();
  
  // Merge remote and local, avoiding duplicates by ID
  const combined = [...remote];
  const remoteIds = new Set(remote.map(q => q.id));
  
  local.forEach(l => {
    if (!remoteIds.has(l.id)) {
      combined.push(l);
    }
  });

  return combined.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export async function getQuotation(id) {
  if (isSupabaseEnabled) {
    try {
      const { data, error } = await supabase
        .from('quotation')
        .select('*, quotation_line(*)')
        .eq('id', id)
        .maybeSingle(); // mapping to null if not found instead of error
      if (!error && data) return data;
      if (error && error.code !== 'PGRST116') {
         console.warn('[quotationRepo] supabase fetch error:', error.message);
      }
    } catch (e) {
      console.warn('[quotationRepo] supabase catch error:', e);
    }
  }
  // Robust Fallback
  const found = lsGetAll().find(q => q.id === id);
  return found || null;
}

export async function createQuotation(quotation) {
  const now = new Date().toISOString();
  const { quotation_items, ...rest } = quotation;
  const newQ = {
    ...rest,
    id: crypto.randomUUID(),
    status: quotation.status || 'draft',
    created_at: now,
    updated_at: now,
    quotation_items: quotation_items || [],
  };

  if (isSupabaseEnabled) {
    const { quotation_items: _items, ...qData } = newQ;
    // Map to new schema fields
    const dbData = {
      ...qData,
      client_name: qData.client || qData.client_name,
      event_title: qData.event_title || qData.project_name,
      event_date: qData.event_date || qData.event_date_start
    };
    
    // Remote fields to remove if not in schema
    delete dbData.client;
    delete dbData.project_name;
    delete dbData.event_date_start;

    const { data, error } = await supabase.from('quotation').insert([dbData]).select().single();
    
    if (error) {
      console.warn('[quotationRepo] create error:', error.message);
      // Removed alert to support local-only workflow
    }
    if (data && quotation_items?.length) {
      const lines = quotation_items.map((item, i) => ({
        id: crypto.randomUUID(),
        quotation_id: data.id,
        sort_order: i,
        section_code: item.section_code,
        section_name: item.section_name,
        category: item.category,
        sub_category: item.sub_category,
        item_name: item.item_name,
        specification: item.spec,
        qty: item.qty,
        qty_unit: item.qty_unit,
        duration_qty: item.duration_qty,
        duration_unit: item.duration_unit,
        unit_price: item.unit_sell || item.unit_price,
        unit_cost: item.unit_cost || 0
      }));
      const { error: lError } = await supabase.from('quotation_line').insert(lines);
      if (lError) console.warn('[quotationRepo] lines insert error:', lError.message);
    }
    if (data) return data;
  }

  const all = lsGetAll();
  all.unshift(newQ);
  lsSave(all);
  return newQ;
}

export async function updateQuotation(id, updates) {
  const now = new Date().toISOString();
  const { quotation_items, ...rest } = updates;

  if (isSupabaseEnabled) {
    const { data, error } = await supabase
      .from('quotation')
      .update({ ...rest, updated_at: now })
      .eq('id', id)
      .select()
      .single();
    if (error) console.warn('[quotationRepo] update error:', error.message);
    // Sync lines if provided
    if (quotation_items !== undefined && data) {
      await supabase.from('quotation_line').delete().eq('quotation_id', id);
      if (quotation_items.length) {
        await supabase.from('quotation_line').insert(
          quotation_items.map((item, i) => ({
            ...item,
            id: item.id || crypto.randomUUID(),
            quotation_id: id,
            sort_order: i,
          }))
        );
      }
    }
    if (data) return data;
  }

  const all = lsGetAll();
  const idx = all.findIndex(q => q.id === id);
  if (idx < 0) throw new Error('Quotation not found');
  all[idx] = { ...all[idx], ...updates, updated_at: now };
  lsSave(all);
  return all[idx];
}

export async function deleteQuotation(id) {
  if (isSupabaseEnabled) {
    try {
      await supabase.from('quotation_line').delete().eq('quotation_id', id);
      const { error } = await supabase.from('quotation').delete().eq('id', id);
      if (error) console.warn('[quotationRepo] delete error:', error.message);
    } catch (e) {
      console.warn('[quotationRepo] Supabase delete exception:', e);
    }
  }
  // Always clean up local storage regardless of Supabase result
  lsSave(lsGetAll().filter(q => q.id !== id));
}

export async function duplicateQuotation(id) {
  const original = await getQuotation(id);
  if (!original) throw new Error('Not found');
  return createQuotation({
    ...original,
    quotation_no: (original.quotation_no || '') + ' (copy)',
    quotation_version: 1,
    status: 'draft',
  });
}
