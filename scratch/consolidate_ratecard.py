import pandas as pd
import os
import re

folder_path = "/Users/yudiqitrick/Desktop/Quotation_Budget_Collection"
files = [f for f in os.listdir(folder_path) if f.endswith(('.xlsx', '.xls', '.csv'))]

def get_year(filename):
    match = re.search(r'202\d', filename)
    return int(match.group(0)) if match else 2025 # Default to current year if not found

all_data = []

# Column name patterns
HPP_PATTERNS = ['hpp', 'unit cost', 'modal', 'cost', 'unit_cost']
SELL_PATTERNS = ['unit sell', 'harga jual', 'sell', 'price', 'unit_sell', 'selling price']
ITEM_PATTERNS = ['item', 'description', 'nama barang', 'kebutuhan', 'particular']
CAT_PATTERNS = ['category', 'kategori', 'group', 'area']

for file in files:
    path = os.path.join(folder_path, file)
    year = get_year(file)
    
    try:
        if file.endswith('.csv'):
            df = pd.read_csv(path)
        else:
            # Read all sheets, but focus on the first one for now
            df = pd.read_excel(path, sheet_name=0)
        
        # Clean up headers - sometimes headers are not in the first row
        # We look for a row that has one of our patterns
        header_row = -1
        for i, row in df.iterrows():
            row_vals = [str(x).lower() for x in row.values if pd.notnull(x)]
            if any(p in ' '.join(row_vals) for p in ITEM_PATTERNS):
                header_row = i
                break
        
        if header_row != -1:
            # Set new headers
            new_cols = df.iloc[header_row].values
            df = df.iloc[header_row+1:].copy()
            df.columns = new_cols
        
        # Identify columns
        cols = [str(c).lower() for c in df.columns]
        
        hpp_col = next((c for c in df.columns if str(c).lower() in HPP_PATTERNS), None)
        sell_col = next((c for c in df.columns if str(c).lower() in SELL_PATTERNS), None)
        item_col = next((c for c in df.columns if str(c).lower() in ITEM_PATTERNS), None)
        cat_col = next((c for c in df.columns if str(c).lower() in CAT_PATTERNS), None)
        
        if not item_col:
            # Try fuzzy matching if exact match fails
            item_col = next((c for c in df.columns if any(p in str(c).lower() for p in ITEM_PATTERNS)), None)
        if not hpp_col:
            hpp_col = next((c for c in df.columns if any(p in str(c).lower() for p in HPP_PATTERNS)), None)
        if not sell_col:
            sell_col = next((c for c in df.columns if any(p in str(c).lower() for p in SELL_PATTERNS)), None)

        if item_col and (hpp_col or sell_col):
            # Select and clean
            subset = df[[item_col]].copy()
            subset.columns = ['Item']
            
            if hpp_col:
                subset['HPP'] = pd.to_numeric(df[hpp_col], errors='coerce')
            else:
                subset['HPP'] = 0
                
            if sell_col:
                subset['Selling Price'] = pd.to_numeric(df[sell_col], errors='coerce')
            else:
                subset['Selling Price'] = 0
            
            if cat_col:
                subset['Category'] = df[cat_col]
            else:
                subset['Category'] = 'Uncategorized'
                
            subset['Year'] = year
            subset['Source File'] = file
            
            # Remove empty rows
            subset = subset.dropna(subset=['Item'])
            subset = subset[subset['Item'].astype(str).str.len() > 2]
            
            all_data.append(subset)
            
    except Exception as e:
        # print(f"Error processing {file}: {e}")
        pass

if all_data:
    final_df = pd.concat(all_data, ignore_index=True)
    
    # Sort and remove duplicates
    final_df = final_df.sort_values(by=['Item', 'Year'], ascending=[True, False])
    final_df = final_df.drop_duplicates(subset=['Item', 'Year'], keep='first')
    
    output_path = "/Users/yudiqitrick/Desktop/Master_Ratecard_Consolidated_2025.xlsx"
    final_df.to_excel(output_path, index=False)
    print(f"Success! Created: {output_path}")
    print(f"Total items extracted: {len(final_df)}")
else:
    print("No data found to consolidate.")
