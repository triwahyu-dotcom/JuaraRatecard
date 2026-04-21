def calc_vendor_tax(line_cost, tax_type):
    pph_rates = {
        'pph23_2': 0.02,
        'pph21_25': 0.025,
        'pph21_3': 0.03,
        'pph42_10': 0.10,
    }
    rate = pph_rates.get(tax_type, 0)
    return round(line_cost * rate)

def verify():
    # Mock data matches calc.js implementation
    unit_cost = 1000000
    unit_sell = 1250000
    qty = 1
    
    subtotal = unit_sell * qty
    total_hpp = unit_cost * qty
    
    gross_profit = subtotal - total_hpp # 250,000
    
    vendor_tax = calc_vendor_tax(total_hpp, 'pph23_2') # 20,000
    
    net_profit = gross_profit - vendor_tax # 230,000
    net_margin_pct = (net_profit / subtotal) * 100
    
    print(f"Subtotal: {subtotal}")
    print(f"Total HPP: {total_hpp}")
    print(f"Gross Profit: {gross_profit}")
    print(f"Vendor Tax (PPh): {vendor_tax}")
    print(f"Net Profit: {net_profit}")
    print(f"Net Margin %: {net_margin_pct}%")
    
    assert net_profit == 230000, "Logic Error: Net Profit should be 230,000"
    print("SUCCESS: Python logic check matches expectation.")

if __name__ == "__main__":
    verify()
