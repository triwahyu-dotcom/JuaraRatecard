import pandas as pd
import json

df = pd.read_excel('test_excel.xlsx', header=None)

rows = []
for idx, row in df.head(30).iterrows():
    r = []
    for val in row:
        if pd.isna(val):
            r.append(None)
        else:
            r.append(str(val))
    rows.append(r)

print(json.dumps(rows[:20], indent=2))
