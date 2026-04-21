# Skill: generate-quotation

## Purpose
To compile and format a detailed Quotation or Cost Estimation based on requested services using the standardized Ratecard Database.

## Data Source
The primary ratecard database is located at:
- **Source Excel**: `knowledge-base/RATE CARD JUARA 2026.xlsx`
- **Structured JSON**: `knowledge-base/ratecard-db.json`
- **Sample PDF**: `knowledge-base/002 Final Quotation.pdf` (visual reference)

## Output Template
Follow the exact format documented in:
- **Template Spec**: `.agent/skills/generate-quotation/quotation-template.md`

Key format rules:
- Page 1 = **SUMMARY QUOTATION** (grouped totals per section)
- Page 2+ = **QUOTATION** detail (per section with line items)
- Each page has: Header (Client/Event/Date/Venue/City/Number) + Logo JUARA
- Table columns: NO | ITEM/TASK | SPECIFICATION | QTY | unit | FREQ/DUR | unit | PRICE | AMOUNT
- Footer: Cost → Tax Base → PPN 12% → Total
- Number format: Indonesian (titik separator, e.g. `1.183.166.667`)
- Signatory: Name + PT Juara Berhasil Berkah Sejahtera

Always reference the JSON database for programmatic access. The JSON contains:
- `metadata`: Company info, version, currency (IDR)
- `chart_of_accounts`: CoA mapping (code 5.x.x hierarchy)
- `ratecard_items`: 128 line items with pricing, units, and descriptions

## Ratecard Structure (Sections)
| Section | Name | Description |
|:--------|:-----|:------------|
| A | PERMIT | Perizinan - Pemadam, Medis, Polisi, Ormas, Bendesa |
| B | VENUE SET UP - SYSTEM | Perimeter, Tenda, Electrical, Stage, Sound, LED, Lighting, Multimedia, Special FX, Others Equipment, Printingan, Manpower, Safety, Show Management, Talent |
| D | TRANSPORTASI | Kendaraan tanpa/dengan supir, Bus |
| E | AKOMODASI | Hotel Team EO, Hotel Talent |

## Execution
1. Load `knowledge-base/ratecard-db.json` as the price reference.
2. Match requested services to `ratecard_items` by `item_name` or `category`.
3. Structure the estimation with split sections: **Direct Costs** (by CoA category) and **Gross Margin**.
4. For items with `unit_price: null` (93 items TBD), flag them as "Price on Request" and prompt user for manual input.
5. Calculate: `line_total = qty × freq × unit_price`
6. Validate total calculation.
7. Output as JSON or formatted Markdown for human review before downstream broadcast.

## Price Formula
```
line_total = qty_default × freq_default × unit_price
subtotal_section = SUM(line_totals in section)
direct_cost = SUM(all subtotal_sections)
gross_margin = direct_cost × margin_percentage
total_quotation = direct_cost + gross_margin
```

## Important Notes
- Currency is always **IDR (Rupiah)**
- 35 items have confirmed prices, 93 are TBD (null)
- Never fabricate prices for TBD items — always flag for user confirmation
- All pricing must trace back to the ratecard database
