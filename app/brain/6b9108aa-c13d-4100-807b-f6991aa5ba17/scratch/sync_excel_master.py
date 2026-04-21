import pandas as pd
import json
import os

EXCEL_PATH = '/Users/yudiqitrick/Desktop/juara-ratecard/knowledge-base/master_data_juara_ratecard_quotation_full.xlsx'
OLD_JSON_PATH = '/Users/yudiqitrick/Desktop/juara-ratecard/knowledge-base/ratecard-db.json'
OUTPUT_PATH = '/Users/yudiqitrick/Desktop/juara-ratecard/knowledge-base/master_data.json'

def sync():
    # 1. Load Old Data for prices
    with open(OLD_JSON_PATH, 'r') as f:
        old_data = json.load(f)
    
    price_lookup = {}
    for item in old_data.get('ratecard_items', []):
        name = item.get('item_name', '').strip().lower()
        if name:
            price_lookup[name] = {
                "unit_price": item.get('unit_price'),
                "unit_cost": item.get('unit_cost'),
                "old_category": item.get('category')
            }

    # 2. Load Excel
    xl = pd.ExcelFile(EXCEL_PATH)
    
    items_df = pd.read_excel(xl, 'Master Items')
    variants_df = pd.read_excel(xl, 'Master Variant')
    zones_df = pd.read_excel(xl, 'Master Zone')
    units_df = pd.read_excel(xl, 'Master Unit')

    # 3. Process Units & Zones
    units = units_df.where(pd.notnull(units_df), None).to_dict(orient='records')
    zones = zones_df.where(pd.notnull(zones_df), None).to_dict(orient='records')

    # 4. Map Variants by Item Code
    variants_by_code = {}
    for _, v in variants_df.iterrows():
        code = v['Item Code']
        if code not in variants_by_code:
            variants_by_code[code] = []
        variants_by_code[code].append({
            "name": v['Variant Name'],
            "unit": v['Default Unit'],
            "type": v['Item Type']
        })

    # 5. Process Items
    new_items = []
    matched_names = set()

    for _, row in items_df.iterrows():
        code = row['Item Code']
        name = row['Final Item']
        clean_name = name.strip().lower() if name else ""
        
        item_variants = variants_by_code.get(code, [])
        
        # Try to find price
        price_info = price_lookup.get(clean_name, {})
        if clean_name:
            matched_names.add(clean_name)

        new_items.append({
            "item_code": code,
            "category": row['Master Category'],
            "subcategory": row['Sub Category'],
            "item_name": name,
            "default_unit": row['Default Unit'],
            "item_type": row['Item Type'],
            "unit_price": price_info.get('unit_price'),
            "unit_cost": price_info.get('unit_cost'),
            "variants": item_variants
        })

    # 6. Handle Miscellaneous (items in old JSON but not in new Excel)
    misc_items = []
    for name, info in price_lookup.items():
        if name not in matched_names:
            misc_items.append({
                "item_code": f"MISC-{len(misc_items)+1:03d}",
                "category": "Miscellaneous",
                "subcategory": info.get('old_category', 'Legacy'),
                "item_name": name.title(),
                "default_unit": "unit",
                "item_type": "legacy",
                "unit_price": info.get('unit_price'),
                "unit_cost": info.get('unit_cost'),
                "variants": []
            })
    
    all_items = new_items + misc_items

    # 7. Final Output
    final_data = {
        "metadata": {
            "source": "Excel Migration Phase 2",
            "date": "2026-04-14"
        },
        "items": all_items,
        "zones": zones,
        "units": units
    }

    with open(OUTPUT_PATH, 'w') as f:
        json.dump(final_data, f, indent=2)
    
    print(f"Sync complete. Generated {len(all_items)} items ({len(new_items)} from Excel, {len(misc_items)} Miscellaneous).")

if __name__ == "__main__":
    sync()
