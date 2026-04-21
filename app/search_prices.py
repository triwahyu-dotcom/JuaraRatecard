import os
import glob
import pandas as pd
import json
import sys

db_path = "public/ratecard-db.json"
with open(db_path, "r", encoding="utf-8") as f:
    db = json.load(f)

# The items missing prices
raw_missing = [item["item_name"] for item in db["ratecard_items"] if item.get("unit_price") is None and item.get("item_name")]
missing = [x.lower().strip() for x in raw_missing]

folder_path = "/Users/yudiqitrick/Desktop/Rate Card/**/*.xlsx"
files = glob.glob(folder_path, recursive=True)

print(f"Searching {len(files)} Excel files for missing items...")

found_results = {}

for fpath in files:
    if "~$" in fpath: continue # skip temp files
    try:
        xls = pd.read_excel(fpath, sheet_name=None, engine='openpyxl')
        for sheet_name, df in xls.items():
            df_str = df.astype(str).apply(lambda x: x.str.lower())
            
            for orig_term, m in zip(raw_missing, missing):
                if len(m) < 4 and m != "acl": continue # skip very short words
                if m == "stage" or m == "tenda" or m == "video": continue # skip too generic 
                
                # Check if exact term string is in dataframe
                mask = df_str.apply(lambda col: col.str.contains(m, na=False, regex=False))
                if mask.any().any():
                    matched_rows = df[mask.any(axis=1)]
                    
                    if orig_term not in found_results:
                        found_results[orig_term] = []
                        
                    for _, row in matched_rows.iterrows():
                        row_vals = [str(x) for x in row.values if pd.notna(x) and str(x).strip() and str(x) != 'nan']
                        found_results[orig_term].append({
                            "file": os.path.basename(fpath),
                            "sheet": sheet_name,
                            "row": row_vals
                        })
    except Exception as e:
        print("Error reading", fpath, e)
        pass

output_path = "search_results.json"
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(found_results, f, indent=2)

print(f"Done. Found potential matches for {len(found_results)} items.")
