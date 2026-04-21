import json

db_path = "public/ratecard-db.json"
with open(db_path, "r", encoding="utf-8") as f:
    db = json.load(f)

missing = [item["item_name"] for item in db["ratecard_items"] if item.get("unit_price") is None]
print(f"Total missing: {len(missing)}")
for item in missing[:20]: # list first 20
    print("- " + item)
