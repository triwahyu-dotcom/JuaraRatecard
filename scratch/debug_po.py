import pandas as pd
xl = pd.ExcelFile('/Users/yudiqitrick/Desktop/juara-ratecard/knowledge-base/PO JBBS - 2025.xlsx')
for s in xl.sheet_names[:10]:
    print(f"--- Sheet: {s} ---")
    df = pd.read_excel(xl, sheet_name=s).head(20)
    print(df)
    print("\n")
