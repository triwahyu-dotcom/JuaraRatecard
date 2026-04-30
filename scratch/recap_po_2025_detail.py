import pandas as pd
import os

input_file = "/Users/yudiqitrick/Desktop/juara-ratecard/knowledge-base/PO JBBS - 2025.xlsx"
output_file = "/Users/yudiqitrick/Desktop/REKAP_PO_JBBS_2025_DETAIL.xlsx"

# Patterns to identify columns
ITEM_KEYWORDS = ['item', 'particular', 'pekerjaan', 'uraian']
SPEC_KEYWORDS = ['spec', 'specification', 'detail', 'keterangan']
QTY_KEYWORDS = ['qty', 'jumlah', 'quantity', 'vol']
FREQ_KEYWORDS = ['freq', 'frekuensi', 'frekwensi']
PRICE_KEYWORDS = ['price', 'rate', 'harga satuan', 'satuan']
TOTAL_KEYWORDS = ['amount', 'total', 'jumlah harga', 'subtotal']

recap_data = []

xl = pd.ExcelFile(input_file)
print(f"Total sheets: {len(xl.sheet_names)}")

for sheet_name in xl.sheet_names:
    try:
        df = pd.read_excel(xl, sheet_name=sheet_name)
        if df.empty: continue
        
        # Find header row
        header_idx = -1
        for idx, row in df.iterrows():
            row_vals = [str(x).lower() for x in row.values if pd.notnull(x)]
            row_str = " ".join(row_vals)
            
            if any(k in row_str for k in ITEM_KEYWORDS) and (any(k in row_str for k in PRICE_KEYWORDS) or any(k in row_str for k in TOTAL_KEYWORDS)):
                header_idx = idx
                break
        
        if header_idx != -1:
            headers = [str(h).strip().lower() for h in df.iloc[header_idx]]
            data_df = df.iloc[header_idx+1:].copy()
            
            # Map columns by index
            idx_map = {
                'item': next((i for i, h in enumerate(headers) if any(k == h or k in h for k in ITEM_KEYWORDS)), -1),
                'spec': next((i for i, h in enumerate(headers) if any(k == h or k in h for k in SPEC_KEYWORDS)), -1),
                'qty': next((i for i, h in enumerate(headers) if any(k == h or k in h for k in QTY_KEYWORDS)), -1),
                'freq': next((i for i, h in enumerate(headers) if any(k == h or k in h for k in FREQ_KEYWORDS)), -1),
                'price': next((i for i, h in enumerate(headers) if any(k == h or k in h for k in PRICE_KEYWORDS)), -1),
                'total': next((i for i, h in enumerate(headers) if any(k == h or k in h for k in TOTAL_KEYWORDS)), -1)
            }
            
            if idx_map['item'] != -1:
                for _, row in data_df.iterrows():
                    item = str(row.iloc[idx_map['item']]).strip()
                    if not item or item.lower() in ['nan', 'none', 'total', 'grand total', 'subtotal', 'no', 'uraian']: continue
                    
                    # Clean numeric data
                    def clean_num(val, default=0):
                        if pd.isnull(val): return default
                        try: return float(str(val).replace(',', '').replace('Rp', '').strip())
                        except: return default

                    price = clean_num(row.iloc[idx_map['price']]) if idx_map['price'] != -1 else 0
                    total = clean_num(row.iloc[idx_map['total']]) if idx_map['total'] != -1 else 0
                    qty = clean_num(row.iloc[idx_map['qty']], 1) if idx_map['qty'] != -1 else 1
                    freq = clean_num(row.iloc[idx_map['freq']], 1) if idx_map['freq'] != -1 else 1
                    spec = str(row.iloc[idx_map['spec']]).strip() if idx_map['spec'] != -1 else ""
                    
                    if len(item) > 2 and (price > 0 or total > 0):
                        recap_data.append({
                            'Sheet': sheet_name,
                            'Item Name': item,
                            'Detail/Spec': spec if spec.lower() != 'nan' else "",
                            'Qty': qty,
                            'Freq': freq,
                            'Unit Price': price if price > 0 else (total/(qty*freq) if (qty*freq) > 0 else 0),
                            'Total Amount': total if total > 0 else (price * qty * freq),
                        })
    except Exception as e:
        print(f"Error in sheet {sheet_name}: {e}")

if recap_data:
    final_df = pd.DataFrame(recap_data)
    final_df.to_excel(output_file, index=False)
    print(f"SUCCESS: Summarized {len(final_df)} detailed items into {output_file}")
else:
    print("No data found.")
