import pandas as pd
import json

file_path = '/Users/yudiqitrick/Desktop/juara-ratecard/Juara_Ratecard_Existing_Data.xlsx'
output_path = '/Users/yudiqitrick/Desktop/juara-ratecard/app/public/master_data.json'

try:
    df = pd.read_excel(file_path)
    
    items = []
    for idx, row in df.iterrows():
        item = {
            "item_code": f"ITM-{idx:04d}",
            "category": row['SECTION'] if pd.notna(row['SECTION']) else "Other",
            "subcategory": row['SUB CATEGORY'] if pd.notna(row['SUB CATEGORY']) else "General",
            "item_name": row['ITEM NAME'] if pd.notna(row['ITEM NAME']) else "Untitled Item",
            "unit_price": int(row['PRICE']) if pd.notna(row['PRICE']) else None,
            "unit_cost": None,
            "default_unit": row['QTY UNIT'] if pd.notna(row['QTY UNIT']) else "unit",
            "item_type": "service",
            "is_component": False,
            "parent_code": None
        }
        items.append(item)
    
    master_data = {
        "items": items,
        "units": [], # Can populate later
        "zones": []
    }
    
    with open(output_path, 'w') as f:
        json.dump(master_data, f, indent=2)
    
    print(f"Successfully converted {len(items)} items to master_data.json")

except Exception as e:
    print(f"Error: {e}")
