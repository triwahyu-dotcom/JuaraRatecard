import json

file_path = 'app/public/ratecard-db.json'
with open(file_path, 'r') as f:
    db = json.load(f)

for item in db['ratecard_items']:
    # If subcategory is null or Juara-related, set to 'Juara Master'
    if item.get('subcategory') is None:
        item['subcategory'] = "Juara Master"
    # If it was already 'Okto Edutorium', refine it
    elif item.get('subcategory') == "Okto Edutorium":
        item['subcategory'] = "Vendor Info (Okto)"

with open(file_path, 'w') as f:
    json.dump(db, f, indent=2)

print(f"Successfully labeled all items in {file_path}")
