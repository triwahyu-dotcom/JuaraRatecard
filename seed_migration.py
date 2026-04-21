#!/usr/bin/env python3
"""
seed_migration.py
=================
Membaca data dari ratecard-db.json (format lama) dan mengkonversinya
menjadi SQL INSERT statements untuk tabel master_item dan rate_card_line
sesuai dengan skema relasional baru.

Cara pemakaian:
  python3 seed_migration.py > seed_items.sql
  -- Lalu jalankan seed_items.sql di SQL Editor Supabase SETELAH menjalankan supabase_migration.sql
"""

import json
import re
import sys
from pathlib import Path

# Path ke file sumber
DB_PATH = Path(__file__).parent / "knowledge-base" / "ratecard-db.json"

# ── Pemetaan category lama → subcategory baru ──────────────────────────────
# Key: category lama dari ratecard-db.json (lowercase)
# Value: (category_code_baru, subcategory_code_baru)
CATEGORY_MAP = {
    # Permit / Safety
    "permit":           ("CAT-02", "SUB-02-01"),
    "safety":           ("CAT-02", "SUB-02-03"),
    "security":         ("CAT-02", "SUB-02-03"),
    "medical":          ("CAT-02", "SUB-02-04"),
    "ambulance":        ("CAT-02", "SUB-02-04"),

    # Venue / Setup / System
    "perimeter":        ("CAT-03", "SUB-03-04"),
    "tenda":            ("CAT-03", "SUB-03-05"),
    "tent":             ("CAT-03", "SUB-03-05"),
    "flooring":         ("CAT-03", "SUB-03-06"),
    "electrical":       ("CAT-03", "SUB-03-07"),
    "genset":           ("CAT-03", "SUB-03-07"),
    "stage":            ("CAT-03", "SUB-03-07"),
    "rigging":          ("CAT-03", "SUB-03-07"),
    "sound system":     ("CAT-03", "SUB-03-07"),
    "led screen":       ("CAT-03", "SUB-03-07"),
    "led tv":           ("CAT-03", "SUB-03-07"),
    "projector":        ("CAT-03", "SUB-03-07"),
    "lighting support": ("CAT-03", "SUB-03-07"),
    "lighting":         ("CAT-03", "SUB-03-07"),
    "toilet":           ("CAT-03", "SUB-03-08"),
    "sanitary":         ("CAT-03", "SUB-03-08"),
    "rent table":       ("CAT-03", "SUB-03-03"),
    "rent chair":       ("CAT-03", "SUB-03-03"),

    # Decoration / Furniture
    "decoration":       ("CAT-05", "SUB-05-04"),
    "furniture":        ("CAT-03", "SUB-03-03"),
    "backdrop":         ("CAT-05", "SUB-05-02"),

    # Branding / Print
    "branding":         ("CAT-05", "SUB-05-01"),
    "print":            ("CAT-05", "SUB-05-03"),
    "signage":          ("CAT-05", "SUB-05-03"),
    "printing":         ("CAT-05", "SUB-05-03"),

    # Manpower / Crew
    "manpower":           ("CAT-06", "SUB-06-02"),
    "crew":               ("CAT-06", "SUB-06-02"),
    "project management": ("CAT-06", "SUB-06-01"),
    "security & safety":  ("CAT-06", "SUB-06-04"),
    "usher":              ("CAT-06", "SUB-06-02"),
    "logistics":          ("CAT-06", "SUB-06-03"),
    "safety and security management": ("CAT-06", "SUB-06-04"),
    "show management":    ("CAT-06", "SUB-06-02"),

    # Talent
    "talent":           ("CAT-07", "SUB-07-01"),
    "mc":               ("CAT-07", "SUB-07-01"),
    "entertainment":    ("CAT-07", "SUB-07-01"),
    "local talent":     ("CAT-07", "SUB-07-01"),

    # Transport
    "transport":        ("CAT-08", "SUB-08-01"),
    "transportation":   ("CAT-08", "SUB-08-01"),
    "vehicle":          ("CAT-08", "SUB-08-01"),
    "incl. supir":      ("CAT-08", "SUB-08-01"),
    "tanpa supir":      ("CAT-08", "SUB-08-01"),

    # Accommodation / Consumption
    "accommodation":    ("CAT-09", "SUB-09-01"),
    "hotel":            ("CAT-09", "SUB-09-01"),
    "catering":         ("CAT-09", "SUB-09-02"),
    "consumption":      ("CAT-09", "SUB-09-03"),
    "konsumsi":         ("CAT-09", "SUB-09-03"),
    "akomodasi":        ("CAT-09", "SUB-09-01"),
    "hotel team eo":    ("CAT-09", "SUB-09-01"),
    "hotel talent band national": ("CAT-09", "SUB-09-01"),
    "snack":            ("CAT-09", "SUB-09-03"),
    "meals":            ("CAT-09", "SUB-09-03"),
    "water":            ("CAT-09", "SUB-09-03"),
    "amenities":        ("CAT-09", "SUB-09-04"),

    # Documentation
    "documentation":    ("CAT-10", "SUB-10-01"),
    "photo":            ("CAT-10", "SUB-10-01"),
    "video":            ("CAT-10", "SUB-10-01"),
    "id card":          ("CAT-10", "SUB-10-02"),
    "accreditation":    ("CAT-10", "SUB-10-02"),

    # Multimedia / Creative
    "multimedia":       ("CAT-04", "SUB-04-02"),
    "creative":         ("CAT-04", "SUB-04-01"),
    "content":          ("CAT-04", "SUB-04-02"),
    "graphic":          ("CAT-04", "SUB-04-01"),
    "multimedia support": ("CAT-04", "SUB-04-02"),
    "special fx":       ("CAT-04", "SUB-04-02"),

    # Misc
    "survey":           ("CAT-11", "SUB-11-01"),
    "atk":              ("CAT-11", "SUB-11-02"),
    "miscellaneous":    ("CAT-11", "SUB-11-04"),
    "additional":       ("CAT-11", "SUB-11-04"),
}

# Default fallback
DEFAULT_CATEGORY    = "CAT-11"
DEFAULT_SUBCATEGORY = "SUB-11-04"

def find_category(cat_str: str):
    """Map category lama ke kode baru."""
    if not cat_str:
        return DEFAULT_CATEGORY, DEFAULT_SUBCATEGORY
    cat_lower = cat_str.lower().strip()
    for key, val in CATEGORY_MAP.items():
        if key in cat_lower or cat_lower in key:
            return val
    return DEFAULT_CATEGORY, DEFAULT_SUBCATEGORY

def slugify(text: str) -> str:
    """Buat item_code dari item_name."""
    text = text.upper().strip()
    text = re.sub(r'[^A-Z0-9\s]', '', text)
    text = re.sub(r'\s+', '-', text)
    return text[:25]

def unit_code_from_str(unit_str: str) -> str:
    """Map unit string ke unit_code di master_unit."""
    mapping = {
        'pcs': 'pcs', 'set': 'set', 'lot': 'lot',
        'm2': 'm2', 'm1': 'm1', 'm': 'm', 'meter': 'm',
        'pax': 'pax', 'person': 'person', 'team': 'team',
        'unit': 'unit', 'trip': 'trip', 'day': 'day',
        'project': 'project', 'event': 'event', 'titik': 'titik',
        'ls': 'ls', 'room': 'room',
    }
    if not unit_str:
        return 'unit'
    return mapping.get(unit_str.lower().strip(), 'unit')

def sql_str(val) -> str:
    """Format nilai untuk SQL string."""
    if val is None:
        return 'NULL'
    val = str(val).replace("'", "''")
    return f"'{val}'"

def sql_num(val) -> str:
    """Format nilai untuk SQL number."""
    if val is None or val == '':
        return 'NULL'
    try:
        return str(float(val))
    except (ValueError, TypeError):
        return 'NULL'

def main():
    with open(DB_PATH, 'r', encoding='utf-8') as f:
        db = json.load(f)

    items = db.get('ratecard_items', [])
    if not items:
        print("-- ERROR: No ratecard_items found in JSON", file=sys.stderr)
        return

    seen_codes = {}  # Deduplicate item codes

    print("-- ============================================================")
    print("-- JUARA RATECARD - Seed Data Migration")
    print(f"-- Generated from: {DB_PATH.name}")
    print(f"-- Total items: {len(items)}")
    print("-- Run AFTER supabase_migration.sql")
    print("-- ============================================================")
    print()
    print("DO $$")
    print("DECLARE")
    print("  v_subcategory_id INT;")
    print("  v_unit_id        INT;")
    print("  v_item_id        INT;")
    print("  v_ratecard_id    INT;")
    print("BEGIN")
    print()
    print("  -- Ambil ID rate card 2026")
    print("  SELECT id INTO v_ratecard_id FROM rate_card WHERE rate_card_no = 'RC-2026-001';")
    print()

    for idx, item in enumerate(items, 1):
        item_name    = item.get('item_name', '').strip()
        category_str = item.get('category', '')
        description  = item.get('description', '')
        qty_default  = item.get('qty_default', 1)
        qty_unit     = item.get('qty_unit', 'unit')
        freq_default = item.get('freq_default', 1)
        freq_unit    = item.get('freq_unit', 'day')
        unit_price   = item.get('unit_price')
        coa_code     = item.get('coa_code', '')
        provided_by  = item.get('provided_by', 'JUARA')

        if not item_name:
            continue

        cat_code, sub_code = find_category(category_str)
        unit_code  = unit_code_from_str(qty_unit)

        # Generate unique item_code
        base_code  = slugify(item_name)
        count      = seen_codes.get(base_code, 0)
        item_code  = f"{base_code}-{count+1:02d}" if count > 0 else base_code
        seen_codes[base_code] = count + 1

        remarks = description if description else None

        print(f"  -- [{idx}] {item_name}")
        print(f"  SELECT id INTO v_subcategory_id FROM master_subcategory WHERE code = {sql_str(sub_code)};")
        print(f"  SELECT id INTO v_unit_id        FROM master_unit        WHERE unit_code = {sql_str(unit_code)};")
        print()
        print(f"  INSERT INTO master_item (subcategory_id, item_code, item_name, item_type, default_unit_id, is_custom_allowed, remarks)")
        print(f"  VALUES (v_subcategory_id, {sql_str(item_code)}, {sql_str(item_name)}, {sql_str('service')}, v_unit_id, TRUE, {sql_str(remarks)})")
        print(f"  ON CONFLICT (item_code) DO UPDATE SET item_name = EXCLUDED.item_name")
        print(f"  RETURNING id INTO v_item_id;")
        print()

        if unit_price is not None:
            sell_price = unit_price
            base_cost  = round(unit_price / 1.25, 0)  # default: assume 20% margin
            print(f"  INSERT INTO rate_card_line (rate_card_id, item_id, unit_id, qty_default, qty_unit, freq_default, freq_unit, base_cost, sell_price_default, markup_type, markup_value, is_active)")
            print(f"  VALUES (v_ratecard_id, v_item_id, v_unit_id, {sql_num(qty_default)}, {sql_str(qty_unit)}, {sql_num(freq_default)}, {sql_str(freq_unit)}, {sql_num(base_cost)}, {sql_num(sell_price)}, 'pct_margin', 20, TRUE)")
            print(f"  ON CONFLICT DO NOTHING;")
            print()

    print("END $$;")
    print()
    print("-- Migration selesai.")
    print(f"-- Total items diproskes: {len(items)}")

if __name__ == '__main__':
    main()
