import json

extracted_items = [
    {
        "section": "B",
        "section_name": "VENUE SET UP -  SYSTEM",
        "category": "Internet",
        "subcategory": "Okto Edutorium",
        "item_name": "ASTINET 100 Mbps",
        "description": "Termasuk aktivasi (include activation)",
        "qty_default": 1,
        "qty_unit": "titik",
        "freq_default": 1,
        "freq_unit": "project",
        "unit_cost": 5000000,
        "unit_price": 6250000
    },
    {
        "section": "B",
        "section_name": "VENUE SET UP -  SYSTEM",
        "category": "Internet",
        "subcategory": "Okto Edutorium",
        "item_name": "Indibiz 100 Mbps",
        "description": "Source internet backup",
        "qty_default": 1,
        "qty_unit": "titik",
        "freq_default": 1,
        "freq_unit": "project",
        "unit_cost": 2000000,
        "unit_price": 2500000
    },
    {
        "section": "B",
        "section_name": "VENUE SET UP -  SYSTEM",
        "category": "Perlengkapan",
        "subcategory": "Okto Edutorium",
        "item_name": "Kabel UTP Cat6",
        "description": "Instalasi kabel networking",
        "qty_default": 1,
        "qty_unit": "meter",
        "freq_default": 100,
        "freq_unit": "project",
        "unit_cost": 2500000,
        "unit_price": 3125000
    },
    {
        "section": "B",
        "section_name": "VENUE SET UP -  SYSTEM",
        "category": "Perlengkapan",
        "subcategory": "Okto Edutorium",
        "item_name": "unifi U6",
        "description": "Wireless Access Point",
        "qty_default": 1,
        "qty_unit": "pcs",
        "freq_default": 1,
        "freq_unit": "project",
        "unit_cost": 2000000,
        "unit_price": 2500000
    },
    {
        "section": "B",
        "section_name": "VENUE SET UP -  SYSTEM",
        "category": "Decor",
        "subcategory": "Okto Edutorium",
        "item_name": "Black Curtain Mainstage",
        "description": "Cover truss, per meter",
        "qty_default": 1,
        "qty_unit": "meter",
        "freq_default": 1,
        "freq_unit": "project",
        "unit_cost": 85000,
        "unit_price": 110000
    },
    {
        "section": "B",
        "section_name": "VENUE SET UP -  SYSTEM",
        "category": "Decor",
        "subcategory": "Okto Edutorium",
        "item_name": "Black Curtain FOH",
        "description": "Dinding kaca, per meter",
        "qty_default": 1,
        "qty_unit": "meter",
        "freq_default": 1,
        "freq_unit": "project",
        "unit_cost": 45000,
        "unit_price": 60000
    },
    {
        "section": "B",
        "section_name": "VENUE SET UP -  SYSTEM",
        "category": "Decor",
        "subcategory": "Okto Edutorium",
        "item_name": "Welcome gate",
        "description": "Ukuran 2,5 x 7",
        "qty_default": 1,
        "qty_unit": "pcs",
        "freq_default": 1,
        "freq_unit": "project",
        "unit_cost": 5000000,
        "unit_price": 6250000
    },
    {
        "section": "B",
        "section_name": "VENUE SET UP -  SYSTEM",
        "category": "Tenda",
        "subcategory": "Okto Edutorium",
        "item_name": "Tenda Sarnavile 3x3",
        "description": "Tanpa flooring (CCTV room)",
        "qty_default": 1,
        "qty_unit": "unit",
        "freq_default": 1,
        "freq_unit": "day",
        "unit_cost": 450000,
        "unit_price": 600000
    },
    {
        "section": "B",
        "section_name": "VENUE SET UP -  SYSTEM",
        "category": "Electrical",
        "subcategory": "Okto Edutorium",
        "item_name": "Genset 80 kVA",
        "description": "Area Gate, per day",
        "qty_default": 1,
        "qty_unit": "unit",
        "freq_default": 1,
        "freq_unit": "day",
        "unit_cost": 2800000,
        "unit_price": 3500000
    },
    {
        "section": "B",
        "section_name": "VENUE SET UP -  SYSTEM",
        "category": "Equipment",
        "subcategory": "Okto Edutorium",
        "item_name": "Mistyfan",
        "description": "Cooling system",
        "qty_default": 1,
        "qty_unit": "unit",
        "freq_default": 1,
        "freq_unit": "day",
        "unit_cost": 200000,
        "unit_price": 275000
    },
    {
        "section": "B",
        "section_name": "VENUE SET UP -  SYSTEM",
        "category": "Equipment",
        "subcategory": "Okto Edutorium",
        "item_name": "Sofa Single Chair",
        "description": "VIP Seating",
        "qty_default": 1,
        "qty_unit": "pcs",
        "freq_default": 1,
        "freq_unit": "day",
        "unit_cost": 300000,
        "unit_price": 400000
    },
    {
        "section": "B",
        "section_name": "VENUE SET UP -  SYSTEM",
        "category": "Equipment",
        "subcategory": "Okto Edutorium",
        "item_name": "AC portable 5 pk",
        "description": "Area selasar",
        "qty_default": 1,
        "qty_unit": "unit",
        "freq_default": 1,
        "freq_unit": "day",
        "unit_cost": 500000,
        "unit_price": 650000
    },
    {
        "section": "B",
        "section_name": "VENUE SET UP -  SYSTEM",
        "category": "Equipment",
        "subcategory": "Okto Edutorium",
        "item_name": "Toilet Portable",
        "description": "12 Female & 8 Male",
        "qty_default": 1,
        "qty_unit": "unit",
        "freq_default": 1,
        "freq_unit": "day",
        "unit_cost": 1500000,
        "unit_price": 2000000
    },
    {
        "section": "F",
        "section_name": "PRODUCTION TEAM",
        "category": "Floor Team",
        "subcategory": "Okto Edutorium",
        "item_name": "Floor Manager",
        "description": "Local Team (2 days)",
        "qty_default": 1,
        "qty_unit": "person",
        "freq_default": 2,
        "freq_unit": "day",
        "unit_cost": 750000,
        "unit_price": 1000000
    },
    {
        "section": "F",
        "section_name": "PRODUCTION TEAM",
        "category": "Floor Team",
        "subcategory": "Okto Edutorium",
        "item_name": "Floor Staff",
        "description": "Local Team (1 day)",
        "qty_default": 30,
        "qty_unit": "person",
        "freq_default": 1,
        "freq_unit": "day",
        "unit_cost": 500000,
        "unit_price": 650000
    },
    {
        "section": "F",
        "section_name": "PRODUCTION TEAM",
        "category": "Cleaning Team",
        "subcategory": "Okto Edutorium",
        "item_name": "Facility Care D-Day Event",
        "description": "Outdoor cleaning service",
        "qty_default": 48,
        "qty_unit": "person",
        "freq_default": 1,
        "freq_unit": "day",
        "unit_cost": 350000,
        "unit_price": 450000
    },
    {
        "section": "F",
        "section_name": "PRODUCTION TEAM",
        "category": "LO Team",
        "subcategory": "Okto Edutorium",
        "item_name": "LO Talent",
        "description": "Local Team (2 days)",
        "qty_default": 7,
        "qty_unit": "person",
        "freq_default": 2,
        "freq_unit": "day",
        "unit_cost": 550000,
        "unit_price": 700000
    },
    {
        "section": "F",
        "section_name": "PRODUCTION TEAM",
        "category": "Production",
        "subcategory": "Okto Edutorium",
        "item_name": "Production Team",
        "description": "Local Team Support (7 days)",
        "qty_default": 3,
        "qty_unit": "person",
        "freq_default": 7,
        "freq_unit": "day",
        "unit_cost": 500000,
        "unit_price": 650000
    }
]

file_path = 'app/public/ratecard-db.json'
with open(file_path, 'r') as f:
    db = json.load(f)

# Ensure CoA for items (can leave empty for now as in current file)
for item in extracted_items:
    item['coa_code'] = ""

db['ratecard_items'].extend(extracted_items)

with open(file_path, 'w') as f:
    json.dump(db, f, indent=2)

print(f"Successfully added {len(extracted_items)} items to {file_path}")
