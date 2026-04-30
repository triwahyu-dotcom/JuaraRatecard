import pandas as pd
import os
import re

folder_path = "/Users/yudiqitrick/Desktop/Quotation_Budget_Collection"
files = [f for f in os.listdir(folder_path) if f.endswith(('.xlsx', '.xls', '.csv'))]

def get_year(filename):
    match = re.search(r'202\d', filename)
    return match.group(0) if match else "Unknown"

results = []

for file in files[:20]: # Test with first 20 files
    path = os.path.join(folder_path, file)
    year = get_year(file)
    try:
        if file.endswith('.csv'):
            df = pd.read_csv(path).head(0)
        else:
            df = pd.read_excel(path).head(0)
        results.append({"file": file, "year": year, "columns": list(df.columns)})
    except:
        pass

for r in results:
    print(f"File: {r['file']} | Year: {r['year']}")
    print(f"Cols: {r['columns']}\n")
