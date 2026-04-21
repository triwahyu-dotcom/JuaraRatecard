import pandas as pd

data = [
    {
        "SECTION": "CREATIVE",
        "SUB CATEGORY": "Manpower",
        "ITEM NAME": "Senior Graphic Designer",
        "SPECIFICATION": "- Experience > 5 years\n- Portfolio in Event Branding",
        "QTY UNIT": "Pax",
        "FREQ UNIT": "Day",
        "PRICE": 1500000
    },
    {
        "SECTION": "EQUIPMENT",
        "SUB CATEGORY": "Audio",
        "ITEM NAME": "Wireless Microphone",
        "SPECIFICATION": "- Sennheiser brand\n- Include battery",
        "QTY UNIT": "Set",
        "FREQ UNIT": "Day",
        "PRICE": 250000
    }
]

df = pd.DataFrame(data)
df.to_excel("Juara_Ratecard_Template.xlsx", index=False)
print("Template created: Juara_Ratecard_Template.xlsx")
