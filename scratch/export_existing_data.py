import pandas as pd
import requests

SUPABASE_URL = "https://hhqhahtyfziynjaaqiad.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhocWhhaHR5ZnppeW5qYWFxaWFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1OTgxODgsImV4cCI6MjA4OTE3NDE4OH0.zsxVSxY7SEoeiEOmjPQrKwiFw-DxX1NTUUQQw_aVzCg"

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}"
}

def fetch_master_items():
    url = f"{SUPABASE_URL}/rest/v1/master_item?select=*,master_subcategory(*,master_category(*))"
    response = requests.get(url, headers=headers)
    return response.json() if response.status_code == 200 else []

def fetch_rate_lines():
    url = f"{SUPABASE_URL}/rest/v1/rate_card_line?select=*"
    response = requests.get(url, headers=headers)
    return response.json() if response.status_code == 200 else []

def main():
    items = fetch_master_items()
    lines = fetch_rate_lines()
    
    # Create price mapping {item_id: price}
    price_map = {l['item_id']: l.get('sell_price_default') or l.get('unit_sell') for l in lines}

    export_data = []
    for i in items:
        sub = i.get('master_subcategory') or {}
        cat = sub.get('master_category') or {}
        
        export_data.append({
            "SECTION": cat.get('name', ''),
            "SUB CATEGORY": sub.get('name', ''),
            "ITEM NAME": i.get('item_name', ''),
            "SPECIFICATION": i.get('remarks', i.get('specification', '')),
            "QTY UNIT": "unit", # Default
            "FREQ UNIT": "Day", 
            "PRICE": price_map.get(i['id'], 0)
        })

    if not export_data:
        print("No master items found to export.")
        return

    df = pd.DataFrame(export_data)
    output_path = "Juara_Ratecard_Existing_Data.xlsx"
    df.to_excel(output_path, index=False)
    print(f"Successfully exported {len(export_data)} items to {output_path}")

if __name__ == "__main__":
    main()
