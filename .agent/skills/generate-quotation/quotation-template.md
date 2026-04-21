# Quotation Template Format

Referensi: `knowledge-base/002 Final Quotation.pdf`

## Document Structure

### 1. Header (setiap halaman)
```
CLIENT       : [Nama Client]
EVENT TITLE  : [Nama Event]
DATE         : [Tanggal Event]
VENUE        : [Nama Venue]                    TO : [Client Name]
CITY         : [Kota]                          NUMBER : [Nomor Quotation]
```
- **Logo JUARA** di pojok kanan atas
- **Nomor format**: `[YY]/QUOT/JBBS/[CLIENT-EVENT]/[BULAN_ROMAWI]/[TAHUN]`
  - Contoh: `25/QUOT/JBBS/OCBC-DISNEYCONCERT/V/2025`

### 2. Title
- Halaman 1: **"SUMMARY QUOTATION"**
- Halaman detail: **"QUOTATION"**

### 3. Table Structure

#### Summary Page (Page 1)
| NO | ITEM / TASK | QTY | | FREQ / DUR | | PRICE | AMOUNT |
|:---|:------------|----:|:---|----:|:---|------:|-------:|
| A  | **SUMMARY** |     |    |     |    |       |        |
| 1  | Production  | 1   | pckg | 1 | event | xxx | xxx |
| 2  | Talent      | 1   | pckg | 1 | event | xxx | xxx |
| ... | ...        |     |    |     |    |       |        |

**Footer rows:**
- **Cost** = subtotal semua section
- **Special Discount** = potongan harga (jika ada)
- **Cost After Discount** = Cost - Discount
- **Tax Base** = Cost After Discount / 1.12 (jika PPN inclusive)
- **PPN 12%** = Tax Base × 0.12
- **Total** = Tax Base + PPN

#### Detail Pages (Page 2+)
Setiap halaman untuk satu section/area:

| NO | ITEM / TASK | SPECIFICATION | QTY | | FREQ / DUR | | PRICE | AMOUNT |
|:---|:------------|:--------------|----:|:---|----:|:---|------:|-------:|
| A  | **SECTION NAME** | | | | | | | |
|    | Category    |              |     |    |     |    |       |        |
|    | └ Item 1    | deskripsi    | qty | unit | freq | dur | price | amount |
|    | └ Item 2    | deskripsi    | qty | unit | freq | dur | price | amount |

**Detail page footer:**
- **Cost** = subtotal halaman
- **Tax Base** = Cost / 1.12
- **PPN 12%** = Tax Base × 0.12
- **Total** (atau **Total Cost**) = Tax Base + PPN

### 4. Section Hierarchy (dari contoh PDF)
```
PAGE 1: SUMMARY QUOTATION
  1. Production
  2. Talent
  3. Sound & Lighting
  4. Additional
  5. Permit

PAGE 2: QUOTATION - Production Detail
  A. SAFETY
  B. VENUE - SETUP - SYSTEM
     ├── Outdoor Area
     │   ├── Parking Area
     │   ├── Redemption Area
     │   ├── F&B Area
     │   └── Floor Area
     └── Indoor Area
         ├── Foyer Area
         ├── Gamification Area
         └── Ballroom Area
  C. COMMITTEE
     ├── Project Management roles
     ├── Show Management
     ├── Safety & Security
     ├── Equipment
     ├── Meals/Consumables
     └── Operational (transport, hotel)

PAGE 3+: QUOTATION - Talent, Sound & Lighting, Additional, Permit
```

### 5. Notes Section (di bawah setiap halaman)
```
NOTE :
1. Offering Validations:
The offer price above valid as long as the term specified
The Offer Price Included Rehearsal D-1
```

### 6. Signatory
```
[Kota], [Tanggal lengkap]
Submitted by,

[Tanda tangan]

[Nama Penandatangan]
PT Juara Berhasil Berkah Sejahtera
```

## Price Calculation Rules

### Tax Calculation (PPN 12%)
```
Tax Base = Cost / 1.12
PPN 12% = Tax Base × 0.12
Total   = Tax Base + PPN = Cost (round to nearest)
```

### Amount Calculation
```
Amount = QTY × FREQ × PRICE
```

### Number Formatting
- Gunakan format Indonesia: titik sebagai pemisah ribuan, tanpa desimal
- Contoh: `1.183.166.667` bukan `1,183,166,667`
- Untuk item gratis: tulis `complimentary`

## Visual Style
- Font: Clean sans-serif
- Header row tabel: **background hitam, teks putih, bold**
- Section header (A, B, C): **bold**
- Sub-section/Category: **bold**
- Detail items: indent sesuai level hierarki
- Angka: rata kanan
- Border: thin lines pada tabel
