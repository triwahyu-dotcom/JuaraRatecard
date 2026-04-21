import json
import os
import re
from collections import Counter

# Set up paths
base_dir = os.path.dirname(__file__)
db_paths = [
    os.path.join(base_dir, "public/ratecard-db.json"),
    os.path.join(os.path.dirname(base_dir), "knowledge-base/ratecard-db.json")
]
local_results_path = os.path.join(base_dir, "invoice_results.json")
notebooklm_results_path = os.path.join(base_dir, "notebooklm_results.json")

# Load Local Search Results
local_results = {}
if os.path.exists(local_results_path):
    with open(local_results_path, "r", encoding="utf-8") as f:
        local_results = json.load(f)
        local_results = {k.lower().strip(): v for k, v in local_results.items()}

# Load NotebookLM Results
notebooklm_results = {}
if os.path.exists(notebooklm_results_path):
    with open(notebooklm_results_path, "r", encoding="utf-8") as f:
        notebooklm_results = json.load(f)

def is_garbage_row(row):
    row_str = " ".join([str(c) for c in row]).lower()
    if "http" in row_str or "drive.google" in row_str or ".pdf" in row_str or ".xlsx" in row_str or ".png" in row_str:
        return True
    if len(re.findall(r'\d{4}-\d{2}-\d{2}', row_str)) > 0:
        return True
    return False

def extract_price(row):
    if is_garbage_row(row):
        return None
    prices = []
    for cell in row:
        cell_str = str(cell)
        clean = re.sub(r'[^\d.,]', '', cell_str)
        if not clean: continue
        unified = clean.replace(".", "").replace(",", "")
        if unified.isdigit():
            val = int(unified)
            if 15000 <= val <= 150000000:
                prices.append(val)
    if not prices: return None
    prices.sort()
    if len(prices) >= 2:
        for i in range(len(prices)-1):
            for j in range(i+1, len(prices)-1):
                if prices[i] * prices[j] == prices[-1]:
                    return max(prices[i], prices[j])
        return prices[-2]
    return prices[0]

for path in db_paths:
    if not os.path.exists(path):
        print(f"Skipping missing file: {path}")
        continue
        
    print(f"Updating {path}...")
    with open(path, "r", encoding="utf-8") as f:
        db = json.load(f)

    updates = 0
    for item in db.get("ratecard_items", []):
        name = item.get("item_name")
        if not name: continue
        name_lower = name.lower().strip()
        
        found_price = None
        source_info = ""
        priority = 0

        if name_lower in local_results:
            matches = local_results[name_lower]
            extracted_prices = []
            for m in matches:
                p = extract_price(m["row"])
                if p: extracted_prices.append(p)
            if extracted_prices:
                found_price = Counter(extracted_prices).most_common(1)[0][0]
                source_info = f"Local File: {os.path.basename(matches[0]['file'])}"
                priority = 1

        if name_lower in notebooklm_results:
            found_price = notebooklm_results[name_lower]["unit_price"]
            source_info = notebooklm_results[name_lower]["source"]
            priority = 2

        if found_price:
            current_price = item.get("unit_price")
            is_bogus = current_price is not None and isinstance(current_price, (int, float)) and current_price > 1000000000
            is_higher_priority = priority == 2 and current_price != found_price
            
            if current_price is None or is_bogus or is_higher_priority:
                item["unit_price"] = found_price
                updates += 1

    with open(path, "w", encoding="utf-8") as f:
        json.dump(db, f, indent=2)
    print(f"Successfully updated {updates} items in {os.path.basename(path)}!")

print("\nAll database files synchronized.")
