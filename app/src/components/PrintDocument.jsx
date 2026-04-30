import { calcLineSell, calcSummary, calcAllSectionSellTotals, getUniqueSections, getQuotationLines } from '../utils/calc'
import { fmt, fmtDate } from '../utils/fmt'

const COMPANY = 'PT Juara Berhasil Berkah Sejahtera'

/* ── Shared Styles ──────────────────────────────────────────────── */
const TH = {
  background: '#1a1a1a', color: '#fff', fontWeight: 700,
  padding: '5px 6px', textAlign: 'center', fontSize: 8, textTransform: 'uppercase',
}
const TD = { 
  padding: '4px 5px', borderBottom: '1px solid #e8e8e8', 
  verticalAlign: 'top', fontSize: 9,
  wordBreak: 'break-word', overflowWrap: 'break-word', whiteSpace: 'normal'
}

/* ── Print Header (every page) ──────────────────────────────────── */
function PrintHeader({ eventData }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid #eee' }}>
      <table style={{ borderCollapse: 'collapse', fontSize: 9 }}>
        <tbody>
          {[
            ['CLIENT', eventData.client],
            ['EVENT TITLE', eventData.event_title],
            ['DATE', fmtDate(eventData.event_date)],
            ['VENUE', eventData.venue],
            ['TO', eventData.client],
            ['CITY', eventData.city],
            ['NUMBER', eventData.quot_number],
          ].map(([label, val]) => (
            <tr key={label}>
              <td style={{ fontWeight: 700, paddingRight: 6, minWidth: 75, verticalAlign: 'top', color: '#555' }}>{label}</td>
              <td style={{ verticalAlign: 'top' }}>: {val || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ textAlign: 'right' }}>
        <img 
          src="/Logo_Juara_Handover-01 jpeg.png" 
          alt="JUARA" 
          style={{ height: 48, width: 'auto', display: 'block', marginLeft: 'auto' }} 
        />
        <div style={{ fontSize: 8, marginTop: 4, color: '#666' }}>{COMPANY}</div>
      </div>
    </div>
  )
}

/* ── Section Footer (cost + tax + grand total) ──────────────────── */
function SectionFooter({ cost, ppnRate, notes, signatory, city, eventDate, showFull = true }) {
  const taxBase = cost
  const ppn = taxBase * (ppnRate || 0.12)
  const total = taxBase + ppn
  const ppnPct = Math.round((ppnRate || 0.12) * 100)

  return (
    <>
      <table style={{ marginLeft: 'auto', borderCollapse: 'collapse', marginTop: 8, marginBottom: 10 }}>
        <tbody>
          <tr>
            <td style={{ textAlign: 'right', fontWeight: 600, padding: '2px 10px', fontSize: 9, color: '#555' }}>Cost</td>
            <td style={{ textAlign: 'right', fontWeight: 600, padding: '2px 10px', fontSize: 9, minWidth: 120, borderBottom: '1px solid #ddd' }}>{fmt(cost)}</td>
          </tr>
          {showFull && (
            <>
              <tr>
                <td style={{ textAlign: 'right', fontWeight: 600, padding: '2px 10px', fontSize: 9, color: '#555' }}>Tax Base</td>
                <td style={{ textAlign: 'right', fontWeight: 600, padding: '2px 10px', fontSize: 9, borderBottom: '1px solid #ddd' }}>{fmt(taxBase)}</td>
              </tr>
              <tr>
                <td style={{ textAlign: 'right', fontWeight: 600, padding: '2px 10px', fontSize: 9, color: '#555' }}>PPN {ppnPct}%</td>
                <td style={{ textAlign: 'right', fontWeight: 600, padding: '2px 10px', fontSize: 9, borderBottom: '1px solid #ddd' }}>{fmt(ppn)}</td>
              </tr>
            </>
          )}
          <tr style={{ borderTop: '2px solid #1a1a1a' }}>
            <td style={{ textAlign: 'right', fontWeight: 900, padding: '4px 10px', fontSize: 10 }}>Total</td>
            <td style={{ textAlign: 'right', fontWeight: 900, padding: '4px 10px', fontSize: 10, borderBottom: '2px solid #1a1a1a' }}>{fmt(total)}</td>
          </tr>
        </tbody>
      </table>

      {notes?.length > 0 && (
        <div style={{ fontSize: 8, color: '#444', marginBottom: 8 }}>
          <strong>NOTE :</strong>
          <ul style={{ marginLeft: 14, marginTop: 2 }}>
            {notes.map((n, i) => <li key={i} style={{ marginBottom: 1 }}>{n}</li>)}
          </ul>
        </div>
      )}

      <div style={{ marginTop: 20, fontSize: 9 }}>
        <p style={{ margin: '2px 0' }}>{city ? `${city}, ` : ''}{fmtDate(eventDate)}</p>
        <p style={{ margin: '2px 0' }}>Submitted by,</p>
        <div style={{ height: 46 }} />
        <p style={{ margin: '2px 0', fontWeight: 700 }}><u>{signatory}</u></p>
        <p style={{ margin: '2px 0' }}>{COMPANY}</p>
      </div>
    </>
  )
}

/* ── Item Row ────────────────────────────────────────────────────── */
function ItemRow({ item, num, depth = 0 }) {
  const amount = calcLineSell(item)
  
  // support both old (freq/freq_unit) and new (duration_qty/duration_unit) field names
  const durQty  = item.duration_qty  ?? item.freq ?? 1
  const durUnit = item.duration_unit ?? item.freq_unit ?? 'day'

  const priceInput = item.unit_sell ?? item.unit_price;
  const isNumeric = priceInput !== null && priceInput !== undefined && priceInput !== '' && !isNaN(Number(priceInput));

  // Indentation Logic: Base is 12px. +10px per depth level.
  const namePadding = 12 + (depth * 10)

  return (
    <tr>
      <td style={{ ...TD, textAlign: 'right', paddingRight: 8, color: '#888', width: 50, fontSize: 8, whiteSpace: 'nowrap' }}>{num || ''}</td>
      <td style={{ ...TD, paddingLeft: namePadding, fontWeight: 500 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span>{item.item_name || '—'}</span>
        </div>
        {(item.variant_name || item.zone_name) && (
          <div style={{ fontSize: 7.5, color: 'var(--accent)', marginTop: 2, fontWeight: 600, textTransform: 'uppercase' }}>
            {item.variant_name && <span>{item.variant_name}</span>}
            {item.variant_name && item.zone_name && <span style={{ color: '#ccc', margin: '0 4px' }}>|</span>}
            {item.zone_name && <span>{item.zone_name}</span>}
          </div>
        )}
      </td>
      <td style={{ ...TD, color: '#666', fontSize: 8, width: 180, maxWidth: 180, lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>{item.spec || item.specification || ''}</td>
      <td style={{ ...TD, textAlign: 'right', width: 45, fontWeight: 600 }}>{item.qty}</td>
      <td style={{ ...TD, textAlign: 'center', color: '#777', fontSize: 8, width: 40, whiteSpace: 'nowrap' }}>{item.qty_unit}</td>
      <td style={{ ...TD, textAlign: 'right', width: 45 }}>{durQty}</td>
      <td style={{ ...TD, textAlign: 'center', color: '#777', fontSize: 8, width: 40, whiteSpace: 'nowrap' }}>{durUnit}</td>
      <td style={{ ...TD, textAlign: 'right', width: 80, fontWeight: 500, whiteSpace: 'nowrap' }}>
        {item.provided_by 
          ? `provided by ${item.provided_by.toLowerCase()}` 
          : isNumeric 
            ? fmt(priceInput) 
            : (priceInput || 'TBD')}
      </td>
      <td style={{ ...TD, textAlign: 'right', width: 80, fontWeight: 600, whiteSpace: 'nowrap' }}>
        {item.provided_by 
          ? `provided by ${item.provided_by.toLowerCase()}` 
          : amount > 0 
            ? fmt(amount) 
            : isNumeric 
              ? '-' 
              : (priceInput || '-')}
      </td>
    </tr>
  )
}

/* ── Page 1 : Summary ────────────────────────────────────────────── */
function SummaryPage({ eventData, items }) {
  const sections = getUniqueSections(items)
  const sectionTotals = calcAllSectionSellTotals(items)

  const opts = {
    discount_type:  eventData.discount_type  || 'amt',
    discount_value: eventData.discount_value ?? (eventData.discount ? Math.round(eventData.discount / Math.max(1, items.reduce((s, i) => s + calcLineSell(i), 0)) * 100) : 0),
    mgmt_type:      'pct',
    mgmt_value:     Math.round((eventData.mgmt_fee_rate || 0.10) * 100),
    ppn_rate:       Math.round((eventData.ppn_rate || 0.12) * 100),
  }
  const { subtotal, discountAmount, mgmtFeeAmount, taxBase, ppnAmount, grandTotal } = calcSummary(items, opts)
  const ppnPct = opts.ppn_rate

  return (
    <div className="print-page" style={pageStyle}>
      <PrintHeader eventData={eventData} />
      <h1 style={titleStyle}>SUMMARY QUOTATION</h1>

      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', fontSize: 9, marginBottom: 8 }}>
        <thead>
          <tr>
            <th style={{ ...TH, width: 50 }}>NO</th>
            <th style={{ ...TH, minWidth: 168 }} colSpan={2}>ITEM / TASK</th>
            <th style={{ ...TH, width: 85 }} colSpan={2}>QTY</th>
            <th style={{ ...TH, width: 85 }} colSpan={2}>FREQ / DUR</th>
            <th style={TH}>PRICE</th>
            <th style={TH}>AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          {/* "A SUMMARY" block header */}
          <tr>
            <td style={{ ...TD, background: '#f0f0f0', fontWeight: 800, textAlign: 'center', fontSize: 10 }}>A</td>
            <td style={{ ...TD, background: '#f0f0f0', fontWeight: 800, borderBottom: '2px solid #bbb', letterSpacing: 0.5 }} colSpan={8}>
              SUMMARY
            </td>
          </tr>
          {sections.map((s, i) => {
            const t = sectionTotals[s.code] || 0
            return (
              <tr key={s.code}>
                <td style={{ ...TD, textAlign: 'center', color: '#555' }}>{String.fromCharCode(65 + i)}</td>
                <td style={{ ...TD, fontWeight: 600, paddingLeft: 12 }}>{s.name || `Section ${s.code}`}</td>
                <td style={TD}></td>
                <td style={{ ...TD, textAlign: 'right' }}>1</td>
                <td style={{ ...TD, textAlign: 'center', color: '#888', fontSize: 8, whiteSpace: 'nowrap' }}>pckg</td>
                <td style={{ ...TD, textAlign: 'right' }}>1</td>
                <td style={{ ...TD, textAlign: 'center', color: '#888', fontSize: 8, whiteSpace: 'nowrap' }}>event</td>
                <td style={{ ...TD, textAlign: 'right', fontWeight: 700, whiteSpace: 'nowrap' }}>{fmt(t)}</td>
                <td style={{ ...TD, textAlign: 'right', fontWeight: 700, whiteSpace: 'nowrap' }}>{fmt(t)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Summary totals */}
      <table style={{ marginLeft: 'auto', borderCollapse: 'collapse', marginTop: 8, marginBottom: 10 }}>
        <tbody>
          {[
            ['Subtotal',       subtotal],
            ...(discountAmount > 0 ? [[opts.discount_type === 'pct' ? `Diskon (${opts.discount_value}%)` : 'Diskon (Nominal)', -discountAmount]] : []),
            ...(mgmtFeeAmount > 0  ? [[`Management Fee (${opts.mgmt_value}%)`, mgmtFeeAmount]] : []),
            ['Tax Base (DPP)', taxBase],
            [`PPN ${ppnPct}%`, ppnAmount],
          ].map(([label, val]) => (
            <tr key={label}>
              <td style={{ textAlign: 'right', fontWeight: 600, padding: '2px 10px', fontSize: 9, color: '#555' }}>{label}</td>
              <td style={{ textAlign: 'right', fontWeight: 600, padding: '2px 10px', fontSize: 9, minWidth: 120, borderBottom: '1px solid #ddd' }}>
                {fmt(val)}
              </td>
            </tr>
          ))}
          <tr style={{ borderTop: '2px solid #1a1a1a' }}>
            <td style={{ textAlign: 'right', fontWeight: 900, padding: '4px 10px', fontSize: 11 }}>Total</td>
            <td style={{ textAlign: 'right', fontWeight: 900, padding: '4px 10px', fontSize: 11, borderBottom: '2px solid #1a1a1a' }}>{fmt(grandTotal)}</td>
          </tr>
        </tbody>
      </table>

      {eventData.notes?.length > 0 && (
        <div style={{ fontSize: 8, color: '#444', marginTop: 10 }}>
          <strong>Notes :</strong>
          <ul style={{ marginLeft: 14, marginTop: 2 }}>
            {eventData.notes.map((n, i) => <li key={i}>{n}</li>)}
          </ul>
        </div>
      )}

      <div style={{ marginTop: 22, fontSize: 9 }}>
        <p style={{ margin: '2px 0' }}>Jakarta, {fmtDate(eventData.event_date)}</p>
        <p style={{ margin: '2px 0' }}>Submitted by,</p>
        <div style={{ height: 48 }} />
        <p style={{ margin: '2px 0', fontWeight: 700 }}><u>{eventData.signatory}</u></p>
        <p style={{ margin: '2px 0' }}>{COMPANY}</p>
      </div>
    </div>
  )
}

/* ── Detail Page (one per section) ──────────────────────────────── */
function DetailPage({ eventData, section, items, index }) {
  const sectionItems = items.filter(i => (i.section_code || i.section || '_') === section.code)
  const cost = sectionItems.reduce((s, i) => s + calcLineSell(i), 0)

  const secLetter = String.fromCharCode(65 + index)
  const rows = []
  let globalIdx = 0

  const categories = [...new Set(sectionItems.map(i => i.category).filter(Boolean))]

  if (categories.length > 0) {
    categories.forEach((cat, catIdx) => {
      const catCode = `${secLetter}.${catIdx + 1}`
      const catItems = sectionItems.filter(i => i.category === cat)
      rows.push({ type: 'catHeader', cat, code: catCode })

      // Get unique sub-categories and flat items together for sequential numbering
      const subCategories = [...new Set(catItems.map(i => i.sub_category).filter(Boolean))]
      const noSubItems = catItems.filter(i => !i.sub_category)
      
      let level2Counter = 1

      // 1. Render all Sub-Categories
      subCategories.forEach((sub) => {
        const subCode = `${catCode}.${level2Counter++}`
        const subItems = catItems.filter(i => i.sub_category === sub)
        rows.push({ type: 'subHeader', sub, code: subCode })
        
        subItems.forEach((item, itemIdx) => {
          globalIdx++
          rows.push({ type: 'item', item, num: `${subCode}.${itemIdx + 1}`, depth: 2 })
        })
      })

      // 2. Render Flat Items (no sub-category)
      if (noSubItems.length > 0) {
        noSubItems.forEach((item) => {
          globalIdx++
          rows.push({ type: 'item', item, num: `${catCode}.${level2Counter++}`, depth: 1 })
        })
      }
    })

    // Items with NO category at all
    const noCatItems = sectionItems.filter(i => !i.category)
    if (noCatItems.length > 0) {
      noCatItems.forEach((item, itemIdx) => {
        globalIdx++
        rows.push({ type: 'item', item, num: `${secLetter}.${itemIdx + 1}`, depth: 0 })
      })
    }
  } else {
    // Section with no categories
    sectionItems.forEach((item, itemIdx) => {
      globalIdx++
      rows.push({ type: 'item', item, num: `${secLetter}.${itemIdx + 1}`, depth: 0 })
    })
  }

  const defaultNotes = [
    'Offering Validations:',
    'The offer price above valid as long as the term specified',
    'The Offer Price Included Rehearsal D-1',
  ]

  return (
    <div className="print-page" style={pageStyle}>
      <PrintHeader eventData={eventData} />
      <h1 style={titleStyle}>QUOTATION</h1>

      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', fontSize: 9, marginBottom: 8 }}>
        <thead>
          <tr>
            <th style={{ ...TH, width: 50 }}>NO</th>
            <th style={{ ...TH, minWidth: 100 }}>ITEM / TASK</th>
            <th style={{ ...TH, width: 180 }}>SPECIFICATION</th>
            <th style={{ ...TH, width: 85 }} colSpan={2}>QTY</th>
            <th style={{ ...TH, width: 85 }} colSpan={2}>FREQ / DUR</th>
            <th style={{ ...TH, width: 80 }}>PRICE</th>
            <th style={{ ...TH, width: 80 }}>AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          {/* Section master header */}
          <tr>
            <td style={{ ...TD, background: '#f5f5f5', fontWeight: 900, textAlign: 'right', paddingRight: 10, fontSize: 10 }}>{String.fromCharCode(65 + index)}</td>
            <td style={{ ...TD, background: '#f5f5f5', fontWeight: 900, borderBottom: '2px solid #ccc', letterSpacing: 0.5, textTransform: 'uppercase' }} colSpan={8}>
              {(section.name || `Section ${section.code}`).replace(/^Set \d+ - /i, '')}
            </td>
          </tr>

          {rows.map((row, i) => {
            if (row.type === 'catHeader') {
              return (
                <tr key={`ch-${i}`}>
                  <td style={{ ...TD, background: '#fafafa', fontWeight: 800, textAlign: 'right', paddingRight: 8, color: '#444', textTransform: 'uppercase', fontSize: 8.5, letterSpacing: 0.5 }}>
                    {row.code}
                  </td>
                  <td style={{ ...TD, background: '#fafafa', fontWeight: 800, paddingLeft: 10, color: '#222', textTransform: 'uppercase', fontSize: 8.5, letterSpacing: 0.5 }} colSpan={8}>
                    {row.cat}
                  </td>
                </tr>
              )
            }
            if (row.type === 'subHeader') {
              return (
                <tr key={`sub-${i}`}>
                   <td style={{ ...TD, background: 'transparent', fontWeight: 700, textAlign: 'right', paddingRight: 8, color: '#666', fontSize: 8 }}>
                    {row.code}
                  </td>
                  <td style={{ ...TD, fontWeight: 700, paddingLeft: 10, color: '#444', fontSize: 8, fontStyle: 'italic' }} colSpan={8}>
                    {row.sub}
                  </td>
                </tr>
              )
            }
            return <ItemRow key={`r-${i}`} item={row.item} num={row.num} depth={row.depth} />
          })}
        </tbody>
      </table>

      <SectionFooter
        cost={cost}
        ppnRate={eventData.ppn_rate || 0.12}
        notes={eventData.notes?.length ? eventData.notes : defaultNotes}
        signatory={eventData.signatory}
        city={eventData.city || 'Jakarta'}
        eventDate={eventData.event_date}
      />
    </div>
  )
}

/* ── Combined Page (Single long table) ─────────────────────────── */
function CombinedPage({ eventData, items }) {
  const cost = items.reduce((s, i) => s + calcLineSell(i), 0)
  const sections = getUniqueSections(items)
  
  // Build flattened list of rows with Section and Category headers
  const allRows = []
  let globalItemIdx = 0

  sections.forEach((sec, secIdx) => {
    const secItems = items.filter(i => (i.section_code || i.section || '_') === sec.code)
    if (secItems.length === 0) return

    allRows.push({ type: 'secHeader', sec, index: secIdx })

    const secLetter = String.fromCharCode(65 + secIdx)
    const categories = [...new Set(secItems.map(i => i.category).filter(Boolean))]

    if (categories.length > 0) {
      categories.forEach((cat, catIdx) => {
        const catCode = `${secLetter}.${catIdx + 1}`
        const catItems = secItems.filter(i => i.category === cat)
        allRows.push({ type: 'catHeader', cat, code: catCode })

        const subCategories = [...new Set(catItems.map(i => i.sub_category).filter(Boolean))]
        const noSubItems = catItems.filter(i => !i.sub_category)
        
        let level2Counter = 1

        // 1. Render Sub-Categories
        subCategories.forEach((sub) => {
          const subCode = `${catCode}.${level2Counter++}`
          const subItems = catItems.filter(i => i.sub_category === sub)
          allRows.push({ type: 'subHeader', sub, code: subCode })

          subItems.forEach((item, itemIdx) => {
            globalItemIdx++
            allRows.push({ type: 'item', item, num: `${subCode}.${itemIdx + 1}`, depth: 2 })
          })
        })

        // 2. Render Flat Items
        if (noSubItems.length > 0) {
          noSubItems.forEach((item) => {
            globalItemIdx++
            allRows.push({ type: 'item', item, num: `${catCode}.${level2Counter++}`, depth: 1 })
          })
        }
      })

      // Items with NO category at all
      const noCatItems = secItems.filter(i => !i.category)
      if (noCatItems.length > 0) {
        noCatItems.forEach((item, itemIdx) => {
          globalItemIdx++
          allRows.push({ type: 'item', item, num: `${secLetter}.${itemIdx + 1}` })
        })
      }
    } else {
      // Section has items but no categories
      secItems.forEach((item, itemIdx) => {
        globalItemIdx++
        allRows.push({ type: 'item', item, num: `${secLetter}.${itemIdx + 1}` })
      })
    }
  })

  const defaultNotes = [
    'Offering Validations:',
    'The offer price above valid as long as the term specified',
    'The Offer Price Included Rehearsal D-1',
  ]

  return (
    <div className="print-page" style={pageStyle}>
      <PrintHeader eventData={eventData} />
      <h1 style={titleStyle}>QUOTATION</h1>

      <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', fontSize: 9, marginBottom: 8 }}>
        <thead>
          <tr>
            <th style={{ ...TH, width: 50 }}>NO</th>
            <th style={{ ...TH, minWidth: 100 }}>ITEM / TASK</th>
            <th style={{ ...TH, width: 180 }}>SPECIFICATION</th>
            <th style={{ ...TH, width: 85 }} colSpan={2}>QTY</th>
            <th style={{ ...TH, width: 85 }} colSpan={2}>FREQ / DUR</th>
            <th style={{ ...TH, width: 80 }}>PRICE</th>
            <th style={{ ...TH, width: 80 }}>AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          {allRows.map((row, i) => {
            if (row.type === 'secHeader') {
              return (
                <tr key={`sh-${i}`}>
                   <td style={{ ...TD, background: '#f5f5f5', fontWeight: 900, textAlign: 'right', paddingRight: 10, fontSize: 10 }}>{String.fromCharCode(65 + row.index)}</td>
                  <td style={{ ...TD, background: '#f5f5f5', fontWeight: 900, borderBottom: '2px solid #ccc', letterSpacing: 0.5, textTransform: 'uppercase' }} colSpan={8}>
                    {(row.sec.name || `Section ${row.sec.code}`).replace(/^Set \d+ - /i, '')}
                  </td>
                </tr>
              )
            }
            if (row.type === 'catHeader') {
              return (
                <tr key={`ch-${i}`}>
                   <td style={{ ...TD, background: '#fafafa', fontWeight: 800, textAlign: 'right', paddingRight: 8, color: '#444', textTransform: 'uppercase', fontSize: 8.5, letterSpacing: 0.5 }}>
                    {row.code}
                  </td>
                  <td style={{ ...TD, background: '#fafafa', fontWeight: 800, paddingLeft: 10, color: '#222', textTransform: 'uppercase', fontSize: 8.5, letterSpacing: 0.5 }} colSpan={7}>
                    {row.cat}
                  </td>
                </tr>
              )
            }
            if (row.type === 'subHeader') {
              return (
                <tr key={`sub-${i}`}>
                   <td style={{ ...TD, background: 'transparent', fontWeight: 700, textAlign: 'right', paddingRight: 8, color: '#666', fontSize: 8 }}>
                    {row.code}
                  </td>
                  <td style={{ ...TD, fontWeight: 700, paddingLeft: 10, color: '#444', fontSize: 8, fontStyle: 'italic' }} colSpan={7}>
                    {row.sub}
                  </td>
                </tr>
              )
            }
            return <ItemRow key={`r-${i}`} item={row.item} num={row.num} depth={row.depth} />
          })}
        </tbody>
      </table>

      <SectionFooter
        cost={cost}
        ppnRate={eventData.ppn_rate || 0.12}
        notes={eventData.notes?.length ? eventData.notes : defaultNotes}
        signatory={eventData.signatory}
        city={eventData.city || 'Jakarta'}
        eventDate={eventData.event_date}
      />
    </div>
  )
}

/* ── Shared ──────────────────────────────────────────────────────── */
const pageStyle = {
  width: '210mm', minHeight: '297mm',
  margin: '20px auto', padding: '18mm 14mm 22mm',
  background: 'white', boxShadow: '0 2px 16px rgba(0,0,0,0.12)',
  fontFamily: 'Inter, sans-serif', color: '#1a1a1a', fontSize: 9.5, lineHeight: 1.45,
}
const titleStyle = {
  textAlign: 'center', fontSize: 16, fontWeight: 900,
  margin: '10px 0 16px', letterSpacing: 1.5, textTransform: 'uppercase',
  borderBottom: '2px solid #1a1a1a', paddingBottom: 6,
}

/* ── Root Export ─────────────────────────────────────────────────── */
export default function PrintDocument({ quotation, showSummary = true, combinedMode = false }) {
  if (!quotation) return null
  const items = getQuotationLines(quotation).filter(i => {
    const name = (i.item_name || '').toLowerCase();
    const isHeader = name.includes('item / task') || name.includes('item/task') || (name === 'item') || (name === 'task');
    return !isHeader;
  })
  const eventData = quotation
  const sections = getUniqueSections(items)

  return (
    <div style={{ background: '#ddd', padding: '24px 0' }}>
      {showSummary && !combinedMode && (
        <SummaryPage eventData={eventData} items={items} />
      )}
      
      {combinedMode ? (
        <CombinedPage eventData={eventData} items={items} />
      ) : (
        sections.map((s, idx) => (
          <DetailPage key={s.code} eventData={eventData} section={s} items={items} index={idx} />
        ))
      )}
    </div>
  )
}
