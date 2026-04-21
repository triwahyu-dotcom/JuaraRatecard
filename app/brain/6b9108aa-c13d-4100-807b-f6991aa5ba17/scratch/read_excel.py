import pandas as pd
import json

file_path = '/Users/yudiqitrick/Desktop/juara-ratecard/knowledge-base/master_data_juara_ratecard_quotation_full.xlsx'

# Get all sheet names
xl = pd.ExcelFile(file_path)
print(f"Sheets: {xl.sheet_names}")

summary = {}

for sheet in xl.sheet_names:
    df = pd.read_excel(file_path, sheet_name=sheet)
    summary[sheet] = {
        "columns": df.columns.tolist(),
        "rows_count": len(df),
        "head": df.head(10).to_dict(orient='records')
    }

print(json.dumps(summary, indent=2))
