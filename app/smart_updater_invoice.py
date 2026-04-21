import json
import re
from collections import Counter

with open("invoice_results.json", "r", encoding="utf-8") as f:
    results = json.load(f)

db_path = "public/ratecard-db.json"
with open(db_path, "r", encoding="utf-8") as f:
    db = json.load(f)

def extract_price(row):
    prices = []
    for cell in row:
        cell = str(cell).replace(",", "").replace(".", "").replace("Rp", "").strip()
        if cell.endswith(".0"): cell = cell[:-2]
        
        if cell.isdigit():
             val = int(cell)
             if val >= 5000: # reasonable floor
                 prices.append(val)
    if not prices: return None
    if len(prices) >= 2:
        return prices[-2]
    return prices[0]

updates = 0
for item in db["ratecard_items"]:
    name = item["item_name"]
    if item.get("unit_price") is None and name in results:
        matches = results[name]
        extracted_prices = []
        for m in matches:
            p = extract_price(m["row"])
            if p:
                extracted_prices.append(p)
        
        if extracted_prices:
            # pick the most common price
            most_common = Counter(extracted_prices).most_common(1)[0][0]
            item["unit_price"] = most_common
            print(f"Updated '{name}' -> Rp {most_common:,}")
            updates += 1

with open(db_path, "w", encoding="utf-8") as f:
    json.dump(db, f, indent=2)

print(f"Updated {updates} items in DB!")
