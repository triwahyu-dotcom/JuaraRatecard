import pandas as pd
import sys

file_path = '/Users/yudiqitrick/Desktop/juara-ratecard/Juara_Ratecard_Existing_Data.xlsx'
try:
    xl = pd.ExcelFile(file_path)
    print(f"Sheets: {xl.sheet_names}")
    for sheet in xl.sheet_names:
        df = pd.read_excel(file_path, sheet_name=sheet)
        print(f"\n--- Sheet: {sheet} ---")
        print(f"Columns: {df.columns.tolist()}")
        print(df.head(20))
except Exception as e:
    print(f"Error: {e}")
