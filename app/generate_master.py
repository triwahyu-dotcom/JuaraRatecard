import pandas as pd
import json
import os
import re

excel_path = '/Users/yudiqitrick/Desktop/juara-ratecard/knowledge-base/Ratecard_Consolidated_2026_REVISED.xlsx'
output_path = '/Users/yudiqitrick/Desktop/juara-ratecard/app/public/master_data.json'

print(f"Reading Excel from {excel_path}...")
df = pd.read_excel(excel_path, sheet_name='Ratecard', skiprows=1)

# Rename columns to match our structure
df.columns = ['NO', 'SECTION', 'SUB_CATEGORY', 'ITEM_NAME', 'QTY_UNIT', 'FREQ_UNIT', 'HPP', 'QUOT', 'REMARKS']

# Filter only rows with a numeric ID in 'NO' column
df = df[pd.to_numeric(df['NO'], errors='coerce').notnull()]

def clean_subcategory(sub):
    if not sub: return ""
    sub = str(sub).strip()
    # Remove prefixes like "A1. ", "B12. ", etc.
    return re.sub(r'^[A-Z]\d+\.\s*', '', sub)

items = []
for _, row in df.iterrows():
    section = str(row['SECTION']).strip() if pd.notnull(row['SECTION']) else ''
    if not section or section.lower() == 'nan':
        continue
        
    items.append({
        'item_code': f'ITM-{len(items)+1:04d}',
        'category': section,
        'subcategory': clean_subcategory(row['SUB_CATEGORY']),
        'item_name': str(row['ITEM_NAME']).strip(),
        'unit_price': float(row['QUOT']) if pd.notnull(row['QUOT']) else 0,
        'unit_cost': float(row['HPP']) if pd.notnull(row['HPP']) else 0,
        'default_unit': str(row['QTY_UNIT']).strip() if pd.notnull(row['QTY_UNIT']) else 'unit',
        'item_type': 'service',
        'is_component': False,
        'parent_code': None,
        'remarks': str(row['REMARKS']).strip() if pd.notnull(row['REMARKS']) else ''
    })

print(f"Total items found: {len(items)}")

with open(output_path, 'w', encoding='utf-8') as f:
    json.dump({'items': items}, f, indent=2)

print(f"Successfully saved to {output_path}")
