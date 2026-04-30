import { calcSummary, calcAllSectionSellTotals, getUniqueSections, getQuotationLines } from '../utils/calc'
import { fmt, fmtRp } from '../utils/fmt'
import { CATEGORY_COLORS } from '../utils/constants'

function Row({ label, value, bold, big, accent, dimTop, textColor, sub }) {
  return (
    <tr style={{ borderTop: dimTop ? '1px solid var(--border)' : undefined }}>
      <td style={{
        padding: sub ? '8px 16px 8px 32px' : '10px 16px',
        textAlign: 'right', fontSize: big ? 14 : 12,
        fontWeight: bold ? 700 : 500,
        color: textColor || (accent ? 'var(--text)' : 'var(--text-3)'),
        textTransform: sub ? 'none' : 'uppercase',
        letterSpacing: sub ? '0' : '0.05em'
      }}>{label}</td>
      <td style={{
        padding: '10px 16px', textAlign: 'right',
        fontSize: big ? 16 : 13, fontWeight: bold ? 700 : 600,
        color: textColor || (accent ? 'var(--text)' : 'var(--text)'),
        minWidth: 180, fontVariantNumeric: 'tabular-nums',
        fontFamily: 'var(--font-mono)'
      }}>{value === '-' ? '-' : `Rp ${fmt(value)}`}</td>
    </tr>
  )
}

export default function SummaryTable({ items: _items, quotation, eventData, onEventDataChange }) {
  const items = _items || getQuotationLines(quotation || eventData)
  const sections     = getUniqueSections(items)
  const sectionTotals = calcAllSectionSellTotals(items)

  const opts = {
    discount_type:  eventData.discount_type  || 'amt',
    discount_value: eventData.discount_value ?? 0,
    mgmt_type:      'pct',
    mgmt_value:     eventData.mgmt_fee_rate ?? 0.10,
    ppn_rate:       eventData.ppn_rate      ?? 0.12,
  }

  const {
    subtotal, totalHPP, discountAmount, afterDiscount,
    mgmtFeeAmount, taxBase, ppnAmount, grandTotal,
    grossProfit, grossMarginPct, vendorTaxTotal, netProfit, netMarginPct
  } = calcSummary(items, opts)

  // Use opts.mgmt_value/opts.ppn_rate directly if they are already decimals
  const mgmtPct = Math.round((opts.mgmt_value > 1 ? opts.mgmt_value : opts.mgmt_value * 100))
  const ppnPct  = Math.round((opts.ppn_rate > 1 ? opts.ppn_rate : opts.ppn_rate * 100))

  const upd = (field, val) => onEventDataChange?.({ ...eventData, [field]: val })

  return (
    <div className="card" style={{ padding: '32px 40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
         <div style={{ width: 32, height: 32, background: 'var(--text)', borderRadius: 8, color: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>#</div>
         <h2 style={{ fontSize: 20 }}>Financial Review</h2>
      </div>

      {/* Internal Margin Indicators - Vercel Metric Style */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 40 }}>
        <div style={{ padding: '24px 32px', borderRight: '1px solid var(--border)' }}>
          <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Cost (HPP)</div>
          <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{fmtRp(totalHPP)}</div>
        </div>
        <div style={{ padding: '24px 32px', borderRight: '1px solid var(--border)' }}>
          <div style={{ fontSize: 10, color: 'var(--vercel-green)', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Net Profit</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--vercel-green)', fontFamily: 'var(--font-mono)' }}>
            {fmtRp(netProfit)} <span style={{ fontSize: 14, opacity: 0.8 }}>({Math.round(netMarginPct || 0)}%)</span>
          </div>
        </div>
        <div style={{ padding: '24px 32px' }}>
          <div style={{ fontSize: 10, color: 'var(--red)', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vendor Tax (WHT)</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--red)', opacity: 0.8, fontFamily: 'var(--font-mono)' }}>{fmtRp(vendorTaxTotal)}</div>
        </div>
      </div>

      {/* Section Breakdown */}
      <div style={{ marginBottom: 40 }}>
        <h4 style={{ fontSize: 11, marginBottom: 16, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Section Breakdown</h4>
        <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead style={{ background: 'var(--bg-2)' }}>
              <tr>
                <th style={{ padding: '12px 16px', textAlign: 'left',  fontSize: 10, fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Section</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 10, fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Items</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 10, fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Subtotal Jual</th>
              </tr>
            </thead>
            <tbody>
              {sections.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-3)' }}>No line items added yet.</td>
                </tr>
              )}
              {sections.map(s => {
                const secItems = items.filter(i => (i.section_code || i.section) === s.code)
                return (
                  <tr key={s.code} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ 
                          width: 8, height: 8, borderRadius: '50%', 
                          background: CATEGORY_COLORS[s.name] || 'var(--accent)'
                        }} />
                        <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-3)' }}>{s.code}</span>
                        <span style={{ fontSize: 14, fontWeight: 600, color: CATEGORY_COLORS[s.name] || 'var(--text)' }}>{s.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--text-2)', fontWeight: 500 }}>{secItems.length}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, fontVariantNumeric: 'tabular-nums', fontFamily: 'var(--font-mono)' }}>
                      Rp {fmt(sectionTotals[s.code] || 0)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Commercial Layer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 40, borderTop: '1px solid var(--border)', paddingTop: 40 }}>
        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: 11, marginBottom: 20, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Offer Configuration</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Discount (Nominal)</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontWeight: 800, color: 'var(--text-3)', fontSize: 14 }}>Rp</span>
                <input type="text"
                  value={fmt(eventData.discount_value ?? 0)}
                  onChange={e => {
                    const raw = e.target.value.replace(/\D/g, '');
                    upd('discount_value', Number(raw) || 0);
                  }}
                  className="form-input" style={{ paddingLeft: 40, fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 18, width: '100%' }} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Management Fee (%)</label>
              <input type="number" min="0" max="100" step="1"
                value={Math.round((eventData.mgmt_fee_rate ?? 0.10) * 100)}
                onChange={e => upd('mgmt_fee_rate', Number(e.target.value) / 100)}
                className="form-input" style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }} />
            </div>
            <div className="form-group">
              <label className="form-label">VAT / PPN Rate (%)</label>
              <input type="number" min="0" max="20" step="1"
                value={Math.round((eventData.ppn_rate ?? 0.12) * 100)}
                onChange={e => upd('ppn_rate', Number(e.target.value) / 100)}
                className="form-input" style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }} />
            </div>
          </div>
          
          {items.some(i => !i.unit_sell && !i.unit_price && !i.is_complimentary) && (
            <div className="card-sm" style={{ background: 'rgba(245,166,35,0.05)', borderColor: 'rgba(245,166,35,0.2)', color: 'var(--yellow)', fontSize: 12, marginTop: 24, display: 'flex', gap: 12 }}>
              <span style={{ fontSize: 16 }}>⚠</span>
              <div>
                <strong>Incomplete Pricing</strong>
                <p style={{ marginTop: 4, opacity: 0.8 }}>One or more items are missing sell prices. The grand total may be inaccurate.</p>
              </div>
            </div>
          )}
        </div>

        <div style={{ minWidth: 400 }}>
          <div style={{ background: 'var(--bg-2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
              <tbody>
                <Row label="Invoiced Items Subtotal"               value={subtotal}      bold />
                {discountAmount > 0 && (
                  <Row label={opts.discount_type === 'pct' ? `Applied Discount (${opts.discount_value}%)` : 'Applied Discount (Nominal)'}    value={-discountAmount} sub textColor="var(--yellow)" />
                )}
                {discountAmount > 0 && (
                  <Row label="After Discount"                        value={afterDiscount} bold dimTop />
                )}
                <Row label={`Management Fee (${mgmtPct}%)`}         value={mgmtFeeAmount} dimTop />
                <Row label="Tax Foundation (DPP)"            value={taxBase}       bold dimTop />
                <Row label={`Value Added Tax (PPN ${ppnPct}%)`}                      value={ppnAmount}     />
                <tr style={{ background: 'var(--text)', color: 'var(--bg)' }}>
                  <td style={{ padding: '20px 24px', textAlign: 'right', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Grand Total Estimate</td>
                  <td style={{ padding: '20px 24px', textAlign: 'right', fontSize: 24, fontWeight: 800, fontVariantNumeric: 'tabular-nums', fontFamily: 'var(--font-mono)' }}>
                    Rp {fmt(grandTotal)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
