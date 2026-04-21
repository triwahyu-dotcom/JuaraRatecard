#!/usr/bin/env python3
"""
Juara Quotation Engine 2.1
Supports Bundles, Zones, Category Recap, and Premium UI.
"""
import json
import os
import sys
from datetime import datetime
from collections import defaultdict

# ── Project Configuration ───────────────────────────────────────────────
PROJECT_CONFIG = {
    "client": "JUARA INTERNAL",
    "event_title": "Simulation Project",
    "event_date": "TBD 2026",
    "venue": "TBD Area",
    "city": "Jakarta",
    "quot_number": "DRAFT/QUOT/JBBS/2026",
    "signatory": "Eka Marutha Yuswardana",
    "ppn_rate": 0.12,
    "asf_rate": 0.10,
    "zones": []
}

# ── Load Data Layers ────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(__file__)
RATECARD_PATH = os.path.join(BASE_DIR, "knowledge-base", "ratecard-db.json")

def load_db():
    with open(RATECARD_PATH, 'r') as f:
        return json.load(f)

DB = load_db()
RATECARD_ITEMS = {item["item_name"]: item for item in DB["ratecard_items"]}
BUNDLES = {b["name"]: b for b in DB.get("bundles", [])}

# ── Core Logic ──────────────────────────────────────────────────────────

def resolve_item(item_input):
    """Returns a list of resolved dictionary items for a given input."""
    name = item_input.get("item")
    qty_multiplier = item_input.get("qty", 1)
    
    # Check if it's a bundle
    if name in BUNDLES:
        bundle = BUNDLES[name]
        resolved = []
        for b_item in bundle["items"]:
            base = RATECARD_ITEMS.get(b_item["name"], {})
            resolved.append({
                "item": b_item["name"],
                "spec": base.get("description", ""),
                "qty": b_item["qty"] * qty_multiplier,
                "unit": b_item["unit"],
                "freq": b_item["freq"],
                "dur": b_item["dur"],
                "price": base.get("unit_price", 0),
                "provided_by": base.get("provided_by", "JUARA"),
                "is_bundle_child": True,
                "bundle_parent": name,
                "category_code": base.get("category_code", "CAT-11"),
                "section_name": base.get("section_name", "MISCELLANEOUS")
            })
        return resolved
    
    # Otherwise, it's a regular item
    base = RATECARD_ITEMS.get(name, {})
    return [{
        "item": name,
        "spec": item_input.get("spec") or base.get("description", ""),
        "qty": qty_multiplier,
        "unit": item_input.get("unit") or base.get("qty_unit", "unit"),
        "freq": item_input.get("freq", 1),
        "dur": item_input.get("dur", "day"),
        "price": item_input.get("price") if "price" in item_input else base.get("unit_price", 0),
        "provided_by": item_input.get("provided_by", base.get("provided_by", "JUARA")),
        "category_code": base.get("category_code", "CAT-11"),
        "section_name": base.get("section_name", "MISCELLANEOUS")
    }]

def calc_amount(item):
    price = item.get("price") or 0
    if item.get("provided_by") != "JUARA" and price == 0:
        return 0
    return item["qty"] * item["freq"] * price

def fmt(n):
    if n == 0 or n is None: return "-"
    return f"{int(n):,}".replace(",", ".")

# ── HTML Rendering ──────────────────────────────────────────────────────

def render_item_row(item):
    amount = calc_amount(item)
    price_str = fmt(item["price"])
    amount_str = fmt(amount) if item.get("provided_by") == "JUARA" else "Provided by Client"
    row_class = "bundle-child" if item.get("is_bundle_child") else ""
    name_prefix = "&nbsp;&nbsp;↳ " if item.get("is_bundle_child") else ""
    return f'''
    <tr class="{row_class}">
        <td></td>
        <td class="item-name">{name_prefix}{item["item"]}</td>
        <td class="spec">{item["spec"]}</td>
        <td class="num">{item["qty"]}</td>
        <td class="unit">{item["unit"]}</td>
        <td class="num">{item["freq"]}</td>
        <td class="unit">{item["dur"]}</td>
        <td class="num">{price_str}</td>
        <td class="num">{amount_str}</td>
    </tr>
    '''

def generate_html(project):
    style = '''
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        :root { --primary: #e53935; --dark: #1a1a1a; --gray: #f5f5f5; --text: #333; }
        body { font-family: 'Inter', sans-serif; font-size: 10px; color: var(--text); background: #eee; margin: 0; }
        .page { width: 210mm; min-height: 297mm; padding: 20mm; margin: 10mm auto; background: white; box-shadow: 0 0 10px rgba(0,0,0,0.1); position: relative; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid var(--dark); padding-bottom: 10px; margin-bottom: 20px; }
        .logo { font-size: 32px; font-weight: 900; letter-spacing: 2px; }
        .logo span { color: var(--primary); }
        .header-info td { padding: 2px 5px; font-size: 9px; vertical-align: top; }
        .header-info .label { font-weight: 700; width: 100px; }
        h1 { text-align: center; text-transform: uppercase; font-size: 18px; margin: 20px 0; letter-spacing: 1px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background: var(--dark); color: white; padding: 8px 5px; text-transform: uppercase; font-size: 8px; }
        td { padding: 6px 5px; border-bottom: 1px solid #ddd; }
        .zone-header { background: #333; color: white; font-weight: 700; padding: 8px 15px !important; font-size: 11px; }
        .recap-header { background: #e53935; color: white; font-weight: 700; padding: 6px 15px !important; }
        .section-header { background: var(--gray); font-weight: 700; }
        .num { text-align: right; }
        .unit { text-align: center; color: #777; font-size: 8px; }
        .spec { font-size: 8px; color: #555; max-width: 150px; }
        .total-row { font-weight: 800; font-size: 12px; border-top: 2px solid var(--dark) !important; }
        @media print { body { background: none; } .page { margin: 0; box-shadow: none; page-break-after: always; } }
    </style>
    '''
    
    pages_html = ""
    recap_items = defaultdict(lambda: {"qty": 0, "freq": 1, "price": 0, "unit": "", "dur": "", "cat_code": "", "section_name": ""})
    running_total = 0
    
    for zone in project["zones"]:
        zone_total = 0
        rows = f'<tr class="zone-header"><td colspan="9">AREA: {zone["name"].upper()}</td></tr>'
        for section in zone["sections"]:
            rows += f'<tr class="section-header"><td colspan="9">{section["name"].upper()}</td></tr>'
            for item_input in section["items"]:
                name = item_input.get("item")
                # Aggregate for Recap
                base_item = RATECARD_ITEMS.get(name, {})
                bundle_info = BUNDLES.get(name)
                
                cat_code = base_item.get("category_code", "CAT-11") if not bundle_info else "CAT-03" # Default bundle to Venue
                sec_name = base_item.get("section_name", "MISCELLANEOUS") if not bundle_info else "BUNDLED PACKAGES"
                
                recap_items[name]["qty"] += item_input.get("qty", 1)
                recap_items[name]["freq"] = item_input.get("freq", 1)
                recap_items[name]["dur"] = item_input.get("dur", "day")
                recap_items[name]["cat_code"] = cat_code
                recap_items[name]["section_name"] = sec_name
                recap_items[name]["unit"] = item_input.get("unit") or base_item.get("qty_unit", "unit")
                
                resolved = resolve_item(item_input)
                bundle_total_price = 0
                for r in resolved:
                    rows += render_item_row(r)
                    zone_total += calc_amount(r)
                    bundle_total_price += calc_amount(r) / (item_input.get("qty", 1) * item_input.get("freq", 1))
                
                recap_items[name]["price"] = bundle_total_price if bundle_info else (resolved[0].get("price") or 0)

        running_total += zone_total
        pages_html += f'''
        <div class="page">
            <div class="header"><div><table class="header-info">
                <tr><td class="label">CLIENT</td><td>: {project["client"]}</td></tr>
                <tr><td class="label">EVENT TITLE</td><td>: {project["event_title"]}</td></tr>
                <tr><td class="label">DATE</td><td>: {project["event_date"]}</td></tr>
            </table></div><div style="text-align:right">
                <div class="logo"><span>J</span>UARA</div>
                <div style="font-size:9px; font-weight:700">NUMBER: {project["quot_number"]}</div>
            </div></div>
            <h1>TECHNICAL QUOTATION - {zone["name"]}</h1>
            <table><thead><tr><th>NO</th><th>ITEM / TASK</th><th>SPECIFICATION</th><th colspan="2">QTY</th><th colspan="2">FREQ</th><th>PRICE</th><th>AMOUNT</th></tr></thead>
            <tbody>{rows}</tbody></table>
            <div style="display:flex; justify-content:flex-end">
                <table style="width:300px"><tr class="total-row"><td>SUBTOTAL</td><td class="num">Rp {fmt(zone_total)}</td></tr></table>
            </div>
        </div>
        '''

    # Combined Recap Page
    recap_rows = ""
    sorted_cats = sorted(set(v["cat_code"] for v in recap_items.values()))
    for cat in sorted_cats:
        items_in_cat = {k: v for k, v in recap_items.items() if v["cat_code"] == cat}
        sec_name = list(items_in_cat.values())[0]["section_name"]
        recap_rows += f'<tr class="recap-header"><td colspan="6">{sec_name} ({cat})</td></tr>'
        for name, data in items_in_cat.items():
            amount = data["qty"] * data["freq"] * data["price"]
            recap_rows += f'''
            <tr>
                <td></td>
                <td>{name}</td>
                <td class="num">{data["qty"]} {data["unit"]}</td>
                <td class="num">{data["freq"]} {data["dur"]}</td>
                <td class="num">{fmt(data["price"])}</td>
                <td class="num">{fmt(amount)}</td>
            </tr>
            '''

    recap_page = f'''
    <div class="page">
        <div class="header"><div class="logo"><span>J</span>UARA</div><div style="text-align:right"><h1>COMBINED RECAP BY CATEGORY</h1></div></div>
        <table><thead><tr><th>NO</th><th>DESCRIPTION</th><th>QTY</th><th>FREQ</th><th>UNIT PRICE</th><th>AMOUNT</th></tr></thead>
        <tbody>{recap_rows}</tbody></table>
    </div>
    '''

    # Final Summary Page
    asf = running_total * project["asf_rate"]
    tax_base = running_total + asf
    ppn = tax_base * project["ppn_rate"]
    summary_page = f'''
    <div class="page">
        <div class="header"><div class="logo"><span>J</span>UARA</div><div style="text-align:right"><h1>SUMMARY QUOTATION</h1></div></div>
        <table><thead><tr><th>DESCRIPTION</th><th class="num">AMOUNT</th></tr></thead>
        <tbody>
            {''.join([f'<tr><td>Total Area: {z["name"]}</td><td class="num">{fmt(sum([calc_amount(r) for sec in z["sections"] for ii in sec["items"] for r in resolve_item(ii)]))}</td></tr>' for z in project["zones"]])}
            <tr style="height:20px"><td></td><td></td></tr>
            <tr><td><strong>TOTAL COST</strong></td><td class="num"><strong>{fmt(running_total)}</strong></td></tr>
            <tr><td>Agency Service Fee (10%)</td><td class="num">{fmt(asf)}</td></tr>
            <tr><td>Tax Base (PPN Industrial)</td><td class="num">{fmt(tax_base)}</td></tr>
            <tr><td>PPN (12%)</td><td class="num">{fmt(ppn)}</td></tr>
            <tr class="total-row"><td>GRAND TOTAL</td><td class="num">Rp {fmt(tax_base + ppn)}</td></tr>
        </tbody></table>
        <div style="margin-top:50px"><p>Jakarta, {datetime.now().strftime("%d %B %Y")}</p><p>Submitted by,</p><div style="height:80px"></div><p><strong><u>{project["signatory"]}</u></strong><br>PT Juara Berhasil Berkah Sejahtera</p></div>
    </div>
    '''
    
    return f"<html><head>{style}</head><body>{pages_html}{recap_page}{summary_page}</body></html>"

if __name__ == "__main__":
    if len(sys.argv) > 1:
        with open(sys.argv[1], 'r') as f: PROJECT_CONFIG = json.load(f)
    with open("quotation_bundle_sim.html", "w") as f: f.write(generate_html(PROJECT_CONFIG))
    print(f"✅ Quotation generated: quotation_bundle_sim.html")
