import pandas as pd
import json
import re

def seed():
    excel_path = 'knowledge-base/Ratecard_Consolidated_2026_REVISED.xlsx'
    df = pd.read_excel(excel_path, sheet_name='Ratecard', skiprows=2)
    
    items = []
    current_section = "General"
    current_subcategory = "General"
    
    for _, row in df.iterrows():
        no_val = str(row['NO']).strip() if pd.notna(row['NO']) else ""
        item_name = str(row['ITEM NAME']).strip() if pd.notna(row['ITEM NAME']) else None
        
        # Determine if it's a header or an item
        # Header rows typically have ITEM NAME as NaN
        if not item_name:
            if not no_val:
                continue
                
            # Regex for Section: A. , B. , etc.
            if re.match(r'^[A-Z]\.\s', no_val):
                current_section = no_val
                current_subcategory = "General"
                print(f"Switching to Section: {current_section}")
                continue
            
            # Regex for Sub-category: A1. , B2. , etc.
            if re.match(r'^[A-Z]\d+\.\s', no_val):
                current_subcategory = no_val
                print(f"  Switching to Sub-category: {current_subcategory}")
                continue
                
        # If it's an item (has item_name)
        if item_name:
            unit_cost = row['HPP (Rp)'] if pd.notna(row['HPP (Rp)']) else 0
            unit_sell = row['QUOT (Rp)'] if pd.notna(row['QUOT (Rp)']) else 0
            
            if isinstance(unit_cost, str):
                unit_cost = float(unit_cost.replace(',', '').replace('Rp', '').strip())
            if isinstance(unit_sell, str):
                unit_sell = float(unit_sell.replace(',', '').replace('Rp', '').strip())
                
            items.append({
                "category": current_section,
                "sub_category": current_subcategory,
                "item_name": item_name,
                "unit": str(row['QTY UNIT']) if pd.notna(row['QTY UNIT']) else "unit",
                "unit_cost": float(unit_cost),
                "unit_sell": float(unit_sell),
                "remarks": str(row['REMARKS']) if pd.notna(row['REMARKS']) else ""
            })

    with open('app/seed_data.json', 'w') as f:
        json.dump({"items": items}, f, indent=2)
    
    print(f"Successfully processed {len(items)} items.")

if __name__ == "__main__":
    seed()
