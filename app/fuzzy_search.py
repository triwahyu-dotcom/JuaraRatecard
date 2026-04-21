import json
import os
import glob
import pandas as pd

with open("public/ratecard-db.json", "r", encoding="utf-8") as f:
    db = json.load(f)

missing = [(item["item_name"], item["item_name"].lower().strip()) for item in db["ratecard_items"] if item.get("unit_price") is None]

# create a fuzzy mapping
fuzzy = []
for orig, lower in missing:
    if "sarnavil 3x3" in lower: fuzzy.append((orig, "sarnavil 3x3"))
    elif "sarnavil 5x5" in lower: fuzzy.append((orig, "sarnavil 5x5"))
    elif "projector" in lower:
        if "5000" in lower: fuzzy.append((orig, "5000 lumen"))
        elif "7000" in lower: fuzzy.append((orig, "7000 lumen"))
        elif "10.000" in lower or "10000" in lower: fuzzy.append((orig, "10000 lumen"))
    elif "strobo" in lower: fuzzy.append((orig, "strobo"))
    elif "smoke" in lower: fuzzy.append((orig, "smoke"))
    elif "avolite" in lower: fuzzy.append((orig, "avolite"))
    elif "sky tracker" in lower: fuzzy.append((orig, "sky tracker"))
    elif "pemadam" in lower: fuzzy.append((orig, "pemadam"))
    else: fuzzy.append((orig, lower))

print("Searching with fuzzy keywords...")

folder_path = "/Users/yudiqitrick/Desktop/Rate Card/**/*.xlsx"
files = glob.glob(folder_path, recursive=True)

found = {}
for fpath in files:
    if "~$" in fpath: continue
    try:
        xls = pd.read_excel(fpath, sheet_name=None, engine='openpyxl')
        for sheet_name, df in xls.items():
            df_str = df.astype(str).apply(lambda x: x.str.lower())
            
            for orig, term in fuzzy:
                if len(term) < 4: continue
                mask = df_str.apply(lambda col: col.str.contains(term, na=False, regex=False))
                if mask.any().any():
                    matched_rows = df[mask.any(axis=1)]
                    if orig not in found: found[orig] = []
                    for _, row in matched_rows.iterrows():
                        row_vals = [str(x) for x in row.values if pd.notna(x) and str(x).strip() and str(x) != 'nan']
                        found[orig].append({"file": os.path.basename(fpath), "row": row_vals})
    except: pass

import PyPDF2
pdf_files = glob.glob("/Users/yudiqitrick/Desktop/Rate Card/**/*.pdf", recursive=True)
for fpath in pdf_files:
    try:
        with open(fpath, "rb") as file:
            reader = PyPDF2.PdfReader(file)
            for page in reader.pages:
                text = page.extract_text()
                if not text: continue
                text_lower = text.lower()
                for orig, term in fuzzy:
                    if len(term) < 4: continue
                    if term in text_lower:
                        lines = [line for line in text.split('\n') if term in line.lower()]
                        if orig not in found: found[orig] = []
                        for line in lines:
                            found[orig].append({"file": os.path.basename(fpath), "row": [line]})
    except: pass

with open("fuzzy_results.json", "w", encoding="utf-8") as f:
    json.dump(found, f, indent=2)

print(f"Found fuzzy matches for {len(found)} items.")
