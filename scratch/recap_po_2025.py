import pandas as pd
import os

input_file = "/Users/yudiqitrick/Desktop/juara-ratecard/knowledge-base/PO JBBS - 2025.xlsx"
output_file = "/Users/yudiqitrick/Desktop/REKAP_PO_JBBS_2025.xlsx"

# Patterns to identify columns
ITEM_KEYWORDS = ['item', 'particular', 'pekerjaan', 'uraian', 'description']
PRICE_KEYWORDS = ['price', 'rate', 'harga', 'satuan', 'amount']

recap_data = []

xl = pd.ExcelFile(input_file)
print(f"Total sheets: {len(xl.sheet_names)}")

for sheet_name in xl.sheet_names:
    print(f"Processing sheet: {sheet_name}...")
    try:
        df = pd.read_excel(xl, sheet_name=sheet_name)
        if df.empty: continue
        
        # Find header row
        header_idx = -1
        for idx, row in df.iterrows():
            row_vals = [str(x).lower() for x in row.values if pd.notnull(x)]
            row_str = " ".join(row_vals)
            
            has_item = any(k in row_str for k in ITEM_KEYWORDS)
            has_price = any(k in row_str for k in PRICE_KEYWORDS)
            
            if has_item and has_price:
                header_idx = idx
                # print(f"Found header at row {idx} in {sheet_name}")
                break
        
        if header_idx != -1:
            # Get actual headers
            headers = [str(h).strip().lower() for h in df.iloc[header_idx]]
            data_df = df.iloc[header_idx+1:].copy()
            
            # Map columns by index to handle duplicate names or nan
            item_idx = -1
            for i, h in enumerate(headers):
                if any(k == h or k in h for k in ITEM_KEYWORDS):
                    item_idx = i
                    break
            
            price_idx = -1
            for i, h in enumerate(headers):
                if any(k == h or k in h for k in PRICE_KEYWORDS):
                    price_idx = i
                    # Don't break yet, we might find a better 'price' column (like 'total amount')
            
            if item_idx != -1:
                # We also need to find the Amount column if Price is not enough
                amount_idx = -1
                for i, h in enumerate(headers):
                    if 'amount' in h or 'total' in h:
                        amount_idx = i
                
                # Use amount_idx if price_idx is not found or if amount is more relevant
                target_price_idx = amount_idx if amount_idx != -1 else price_idx
                
                if target_price_idx != -1:
                    for _, row in data_df.iterrows():
                        item = str(row.iloc[item_idx]).strip()
                        if not item or item.lower() in ['nan', 'none', 'total', 'grand total', 'subtotal', 'no']: continue
                        
                        raw_price = row.iloc[target_price_idx]
                        try:
                            price = float(str(raw_price).replace(',', '').replace('Rp', '').strip())
                        except:
                            price = 0
                            
                        if len(item) > 2 and price > 0:
                            recap_data.append({
                                'Sheet': sheet_name,
                                'Item': item,
                                'Amount': price,
                            })
    except Exception as e:
        print(f"Error in sheet {sheet_name}: {e}")

if recap_data:
    final_df = pd.DataFrame(recap_data)
    final_df.to_excel(output_file, index=False)
    print(f"SUCCESS: Summarized {len(final_df)} items into {output_file}")
else:
    print("No data found.")
