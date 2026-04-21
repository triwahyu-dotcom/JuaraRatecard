import json
import os
import pandas as pd
import PyPDF2
from datetime import datetime

# Correct path to the database
DB_PATH = os.path.join(os.path.dirname(__file__), "public/ratecard-db.json")

if not os.path.exists(DB_PATH):
    # Fallback to current directory for testing
    DB_PATH = "public/ratecard-db.json"

with open(DB_PATH, "r", encoding="utf-8") as f:
    db = json.load(f)

# Identify items missing prices
missing = [(item["item_name"], item["item_name"].lower().strip()) for item in db["ratecard_items"] if item.get("unit_price") is None]

fuzzy = []
for orig, lower in missing:
    if "projector" in lower:
        if "5000" in lower: fuzzy.append((orig, "5000 lumen"))
        elif "7000" in lower: fuzzy.append((orig, "7000 lumen"))
        elif "10.000" in lower or "10000" in lower: fuzzy.append((orig, "10000 lumen"))
        elif "15.000" in lower or "15000" in lower: fuzzy.append((orig, "15000 lumen"))
    elif "strobo" in lower: fuzzy.append((orig, "strobo"))
    elif "smoke" in lower: fuzzy.append((orig, "smoke"))
    elif "avolite" in lower: fuzzy.append((orig, "avolite"))
    elif "sky tracker" in lower: fuzzy.append((orig, "sky tracker"))
    elif "pemadam" in lower: fuzzy.append((orig, "pemadam"))
    elif "moving head" in lower: fuzzy.append((orig, "moving head"))
    elif "switcher" in lower: fuzzy.append((orig, "switcher"))
    elif "camera" in lower: fuzzy.append((orig, "camera"))
    elif "canon" in lower: fuzzy.append((orig, "canon"))
    elif "hotel" in lower: fuzzy.append((orig, "hotel"))
    elif "band" in lower: fuzzy.append((orig, "band"))
    elif "dj" in lower: fuzzy.append((orig, "dj"))
    else: fuzzy.append((orig, lower))

# Base directories to search
home = os.path.expanduser("~")
search_dirs = [
    os.path.join(home, "Desktop"),
    os.path.join(home, "Documents"),
    os.path.join(home, "Downloads")
]

print(f"Searching for {len(fuzzy)} keywords in: {', '.join(search_dirs)}")

target_files = []
for base_dir in search_dirs:
    if not os.path.exists(base_dir):
        continue
    for root, dirs, files in os.walk(base_dir):
        # Skip directories that might contain too many files or are irrelevant
        if any(skip in root for skip in ["node_modules", ".git", ".gemini", "Library", "Applications", "venv", ".venv"]):
            continue
        for file in files:
            fl = file.lower()
            # look for invoice or inv or po or vendor or price or quotation
            if any(k in fl for k in ["inv", "invoice", "po ", "po_", "vendor", "price", "quotation", "penawaran"]):
                if fl.endswith(".pdf") or fl.endswith(".xlsx"):
                    target_files.append(os.path.join(root, file))

print(f"Found {len(target_files)} potential files to scan.")

found = {}
for i, fpath in enumerate(target_files):
    if i % 10 == 0:
        print(f"Scanning file {i+1}/{len(target_files)}: {os.path.basename(fpath)}")
        
    if fpath.endswith(".pdf"):
        try:
            with open(fpath, "rb") as file:
                reader = PyPDF2.PdfReader(file)
                for page in reader.pages:
                    text = page.extract_text()
                    if not text: continue
                    text_lower = text.lower()
                    for orig, term in fuzzy:
                        if len(term) < 3: continue
                        if term in text_lower:
                            lines = [line.strip() for line in text.split('\n') if term in line.lower() and len(line.strip()) > 5]
                            if not lines: continue
                            if orig not in found: found[orig] = []
                            for line in lines:
                                found[orig].append({
                                    "file": fpath, 
                                    "row": [line], 
                                    "date": datetime.fromtimestamp(os.path.getmtime(fpath)).strftime('%Y-%m-%d')
                                })
        except Exception: pass
    elif fpath.endswith(".xlsx"):
        if "~$" in fpath: continue
        try:
            # Using engine='openpyxl' for .xlsx files
            xls = pd.read_excel(fpath, sheet_name=None, engine='openpyxl')
            for sheet_name, df in xls.items():
                # Convert whole dataframe to string for easy searching
                df_str = df.astype(str).apply(lambda x: x.str.lower())
                for orig, term in fuzzy:
                    if len(term) < 3: continue
                    mask = df_str.apply(lambda col: col.str.contains(term, na=False, regex=False))
                    if mask.any().any():
                        matched_rows = df[mask.any(axis=1)]
                        if orig not in found: found[orig] = []
                        for _, row in matched_rows.iterrows():
                            row_vals = [str(x) for x in row.values if pd.notna(x) and str(x).strip() and str(x) != 'nan']
                            found[orig].append({
                                "file": fpath, 
                                "row": row_vals, 
                                "date": datetime.fromtimestamp(os.path.getmtime(fpath)).strftime('%Y-%m-%d')
                            })
        except Exception: pass

output_path = os.path.join(os.path.dirname(__file__), "invoice_results.json")
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(found, f, indent=2)

print(f"Found matches for {len(found)} items. Results saved to {output_path}")
