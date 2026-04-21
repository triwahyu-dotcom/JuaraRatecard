import os
import glob
import json
import re
import PyPDF2

db_path = "public/ratecard-db.json"
with open(db_path, "r", encoding="utf-8") as f:
    db = json.load(f)

# The items missing prices
raw_missing = [item["item_name"] for item in db["ratecard_items"] if item.get("unit_price") is None and item.get("item_name")]
missing_pairs = [(orig, orig.lower().strip()) for orig in raw_missing]

folder_path = "/Users/yudiqitrick/Desktop/Rate Card/**/*.pdf"
files = glob.glob(folder_path, recursive=True)

print(f"Searching {len(files)} PDF files for 66 missing items...")

found_results = {}

for fpath in files:
    try:
        with open(fpath, "rb") as file:
            reader = PyPDF2.PdfReader(file)
            for page in reader.pages:
                text = page.extract_text()
                if not text: continue
                text_lower = text.lower()
                
                for orig_term, m in missing_pairs:
                    if len(m) < 4 and m != "acl": continue
                    if m == "stage" or m == "tenda" or m == "video": continue
                    
                    if m in text_lower:
                        # Extract the line containing the term
                        lines = [line for line in text.split('\n') if m in line.lower()]
                        
                        if orig_term not in found_results:
                            found_results[orig_term] = []
                            
                        for line in lines:
                            # Try to find a standalone price in this line
                            found_results[orig_term].append({
                                "file": os.path.basename(fpath),
                                "line": line
                            })
    except Exception as e:
        # print("Error reading", fpath, e)
        pass

output_path = "search_pdf_results.json"
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(found_results, f, indent=2)

print(f"Done. Found potential matches for {len(found_results)} items.")
