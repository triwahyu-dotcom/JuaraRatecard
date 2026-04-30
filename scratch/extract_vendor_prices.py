import os
import pandas as pd
import pdfplumber
import re
from datetime import datetime

# Path to the folder
source_folder = "/Users/yudiqitrick/Desktop/Rate Card"
output_file = "/Users/yudiqitrick/Desktop/Vendor_Pricing_Consolidated_2025.xlsx"

# Patterns to identify columns
ITEM_KEYWORDS = ['item', 'description', 'particular', 'kebutuhan', 'nama barang', 'uraian']
PRICE_KEYWORDS = ['price', 'unit price', 'harga', 'satuan', 'rate', 'unit_sell', 'unit_cost']
QTY_KEYWORDS = ['qty', 'jumlah', 'quantity', 'vol']
TOTAL_KEYWORDS = ['total', 'amount', 'subtotal', 'jumlah harga']

def extract_year(text, filename):
    # Try to find year in text or filename
    match = re.search(r'202[0-9]', text + filename)
    if match:
        return match.group(0)
    return datetime.now().year

def clean_price(val):
    if pd.isna(val): return 0
    # Remove Rp, dots, commas, etc.
    s = str(val).lower().replace('rp', '').replace('.', '').replace(',', '').strip()
    match = re.search(r'[0-9]+', s)
    return int(match.group(0)) if match else 0

extracted_data = []

files = [f for f in os.listdir(source_folder) if not f.startswith('.')]

for file in files:
    file_path = os.path.join(source_folder, file)
    year = extract_year('', file)
    
    # --- HANDLE EXCEL ---
    if file.endswith(('.xlsx', '.xls')):
        try:
            dfs = pd.read_excel(file_path, sheet_name=None)
            for sheet_name, df in dfs.items():
                # Basic cleanup
                df = df.dropna(how='all').dropna(axis=1, how='all')
                if df.empty: continue
                
                # Try to find header row
                header_idx = -1
                for idx, row in df.iterrows():
                    row_str = " ".join([str(x).lower() for x in row.values if pd.notnull(x)])
                    if any(k in row_str for k in ITEM_KEYWORDS) and any(k in row_str for k in PRICE_KEYWORDS):
                        header_idx = idx
                        break
                
                if header_idx != -1:
                    df.columns = df.iloc[header_idx]
                    df = df.iloc[header_idx+1:]
                
                # Map columns
                item_col = next((c for c in df.columns if str(c).lower() in ITEM_KEYWORDS), None)
                price_col = next((c for c in df.columns if str(c).lower() in PRICE_KEYWORDS), None)
                
                if item_col and price_col:
                    for _, row in df.iterrows():
                        item = str(row[item_col]).strip()
                        price = clean_price(row[price_col])
                        if item and price > 0 and len(item) > 3:
                            extracted_data.append({
                                'Item': item,
                                'Price': price,
                                'Year': year,
                                'Source': file,
                                'Type': 'Excel'
                            })
        except Exception as e:
            print(f"Error Excel {file}: {e}")

    # --- HANDLE PDF ---
    elif file.endswith('.pdf'):
        try:
            with pdfplumber.open(file_path) as pdf:
                text_all = ""
                for page in pdf.pages:
                    text_all += page.extract_text() or ""
                    tables = page.extract_tables()
                    for table in tables:
                        if not table or len(table) < 2: continue
                        
                        # Find header in table
                        df_table = pd.DataFrame(table)
                        header_row = -1
                        for i, row in df_table.iterrows():
                            row_str = " ".join([str(x).lower() for x in row.values if x])
                            if any(k in row_str for k in ITEM_KEYWORDS) and any(k in row_str for k in PRICE_KEYWORDS):
                                header_row = i
                                break
                        
                        if header_row != -1:
                            headers = [str(h).lower() for h in table[header_row]]
                            # Map columns
                            try:
                                item_idx = next((i for i, h in enumerate(headers) if any(k in h for k in ITEM_KEYWORDS)), -1)
                                price_idx = next((i for i, h in enumerate(headers) if any(k in h for k in PRICE_KEYWORDS)), -1)
                                
                                if item_idx != -1 and price_idx != -1:
                                    for row_data in table[header_row+1:]:
                                        if len(row_data) > max(item_idx, price_idx):
                                            item = str(row_data[item_idx]).strip()
                                            price = clean_price(row_data[price_idx])
                                            if item and price > 0 and len(item) > 3:
                                                extracted_data.append({
                                                    'Item': item,
                                                    'Price': price,
                                                    'Year': extract_year(text_all, file),
                                                    'Source': file,
                                                    'Type': 'PDF'
                                                })
                            except: pass
        except Exception as e:
            print(f"Error PDF {file}: {e}")

# FINAL CONSOLIDATION
if extracted_data:
    final_df = pd.DataFrame(extracted_data)
    # Deduplicate
    final_df = final_df.drop_duplicates(subset=['Item', 'Price', 'Year'])
    final_df = final_df.sort_values(by=['Item', 'Year'])
    final_df.to_excel(output_file, index=False)
    print(f"SUCCESS: Extracted {len(final_df)} items into {output_file}")
else:
    print("No data extracted.")
