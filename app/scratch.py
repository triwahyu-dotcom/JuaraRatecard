import pandas as pd
import json

excel_path = "../knowledge-base/RATE CARD JUARA 2026.xlsx"

print(f"Loading {excel_path}...")
df = pd.read_excel(excel_path, sheet_name=0)

print("Excel columns:", df.columns.tolist())
print("\nFirst 10 rows:")
print(df.head(10).to_string())
