import json
import collections

file_path = '/Users/yudiqitrick/Desktop/juara-ratecard/knowledge-base/ratecard-db.json'

with open(file_path, 'r') as f:
    data = json.load(f)

items = data['ratecard_items']

# Total items
total_items = len(items)

# Structure analysis
sections = collections.defaultdict(int)
categories = collections.defaultdict(int)
subcategories = collections.defaultdict(int)
units = collections.defaultdict(int)
missing_price = 0
has_description = 0
has_coa = 0

for item in items:
    sections[item.get('section')] += 1
    categories[item.get('category')] += 1
    if item.get('subcategory'):
        subcategories[item.get('subcategory')] += 1
    units[item.get('qty_unit')] += 1
    if not item.get('unit_price'):
        missing_price += 1
    if item.get('description'):
        has_description += 1
    if item.get('coa_code'):
        has_coa += 1

print(f"Total Items: {total_items}")
print(f"Sections: {dict(sections)}")
print(f"Top 10 Categories: {dict(sorted(categories.items(), key=lambda x: x[1], reverse=True)[:10])}")
print(f"Top 5 Units: {dict(sorted(units.items(), key=lambda x: x[1], reverse=True)[:5])}")
print(f"Items missing price: {missing_price}")
print(f"Items with description: {has_description}")
print(f"Items with COA: {has_coa}")
