import { useState } from 'react'
import { fmtRp } from '../utils/fmt'

const SECTIONS = {
  A: { label: 'A — Permit', color: 'var(--text-2)' },
  B: { label: 'B — Venue Setup & System', color: 'var(--text-2)' },
  D: { label: 'D — Transportasi', color: 'var(--text-2)' },
  E: { label: 'E — Akomodasi', color: 'var(--text-2)' },
}

const FREQ_UNITS = ['day', 'event', 'project', 'night', 'shift', 'time', 'hour']
const QTY_UNITS = ['unit', 'prs', 'm2', 'm', 'set', 'team', 'lot', 'titik', 'meter', 'pckg', 'pax', 'carton', 'pcs', 'room']

function Field({ label, children, required }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}{required && <span style={{ color: 'var(--red)', marginLeft: 2 }}>*</span>}</label>
      {children}
    </div>
  )
}

export default function ItemModal({ item, existingCategories, onSave, onClose }) {
  const isEdit = !!item?.id
  const [form, setForm] = useState({
    type: item?.type || 'single',
    section: item?.section || 'B',
    section_name: item?.section_name || 'VENUE SET UP - SYSTEM',
    category: item?.category || '',
    subcategory: item?.subcategory || null,
    item_name: item?.item_name || '',
    description: item?.description || '',
    qty_default: item?.qty_default ?? 1,
    qty_unit: item?.qty_unit || 'unit',
    freq_default: item?.freq_default ?? 1,
    freq_unit: item?.freq_unit || 'event',
    unit_cost: item?.unit_cost ?? '',
    unit_sell: item?.unit_sell ?? '',
    coa_code: item?.coa_code || '',
    vendor_tax_type: item?.vendor_tax_type || '',
  })
  
  const [marginPct, setMarginPct] = useState(
    item?.unit_cost > 0 && item?.unit_sell > 0 
      ? Math.round(((item.unit_sell - item.unit_cost) / item.unit_sell) * 100) 
      : 20
  )
  
  const [categoryInput, setCategoryInput] = useState(form.category)
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSectionChange = (s) => {
    const names = { A: 'PERMIT', B: 'VENUE SET UP - SYSTEM', D: 'TRANSPORTASI', E: 'AKOMODASI' }
    set('section', s)
    set('section_name', names[s] || s)
  }
  
  const handleMarginChange = (cost, pct) => {
    setMarginPct(pct)
    if (cost > 0) {
      const sell = pct >= 100 ? cost * 10 : cost / (1 - (pct / 100))
      set('unit_sell', Math.round(sell))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.item_name.trim()) return
    setSaving(true)
    const payload = {
      ...form,
      category: categoryInput.trim() || form.category,
      unit_cost: form.unit_cost === '' || form.unit_cost === null ? null : Number(form.unit_cost),
      unit_sell: form.unit_sell === '' || form.unit_sell === null ? null : Number(form.unit_sell),
      unit_price: form.unit_sell === '' || form.unit_sell === null ? null : Number(form.unit_sell),
      qty_default: Number(form.qty_default) || 1,
      freq_default: Number(form.freq_default) || 1,
    }
    await onSave(payload)
    setSaving(false)
  }

  const sectionCats = [...new Set((existingCategories[form.section] || []).map(c => c))].sort()

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }} onClick={(e) => e.target === e.currentTarget && onClose()} className="fade-in">
      <div style={{
        background: 'var(--bg)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: 40, width: '100%', maxWidth: 740,
        maxHeight: '94vh', overflowY: 'auto',
        boxShadow: 'var(--shadow-lg)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 32, height: 32, background: 'var(--text)', borderRadius: 8, color: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
               {isEdit ? 'E' : '+'}
            </div>
            <h2 style={{ fontSize: 20 }}>{isEdit ? 'Modify Database Item' : 'New Ratecard Item'}</h2>
          </div>
          <button onClick={onClose} className="btn btn-ghost" style={{ width: 32, height: 32, padding: 0 }}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          
          {/* Type Toggle */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 28, border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', width: 'fit-content' }}>
            <button type="button" onClick={() => set('type', 'single')}
              style={{
                padding: '8px 20px', fontSize: 13, fontWeight: 700, border: 'none',
                background: form.type === 'single' ? 'var(--text)' : 'transparent',
                color: form.type === 'single' ? 'var(--bg)' : 'var(--text-2)', cursor: 'pointer', transition: 'all 0.15s'
              }}>Single Service</button>
            <div style={{ width: 1, background: 'var(--border)' }} />
            <button type="button" onClick={() => set('type', 'package')}
              style={{
                padding: '8px 20px', fontSize: 13, fontWeight: 700, border: 'none',
                background: form.type === 'package' ? 'var(--text)' : 'transparent',
                color: form.type === 'package' ? 'var(--bg)' : 'var(--text-2)', cursor: 'pointer', transition: 'all 0.15s'
              }}>Bundle / Pack</button>
          </div>

          <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 24px', marginBottom: 32 }}>
            {/* Section */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label" style={{ marginBottom: 10, display: 'block' }}>Primary Section Selection</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {Object.entries(SECTIONS).map(([code, s]) => (
                  <button type="button" key={code}
                    onClick={() => handleSectionChange(code)}
                    style={{
                      flex: 1, padding: '12px 0', borderRadius: 'var(--radius)', fontSize: 12,
                      fontWeight: 700, cursor: 'pointer', border: '1px solid',
                      borderColor: form.section === code ? 'var(--text)' : 'var(--border)',
                      background: form.section === code ? 'var(--text)' : 'transparent',
                      color: form.section === code ? 'var(--bg)' : 'var(--text-2)',
                      transition: 'all 0.1s',
                    }}>{code}</button>
                ))}
              </div>
            </div>

            <Field label="Category Group" required>
              <input className="form-input" list="cat-list"
                value={categoryInput}
                onChange={e => setCategoryInput(e.target.value)}
                placeholder="e.g. Sound System"
              />
              <datalist id="cat-list">
                {sectionCats.map(c => <option key={c} value={c} />)}
              </datalist>
            </Field>

            <Field label="Subcategory (optional)">
              <input className="form-input" value={form.subcategory || ''}
                onChange={e => set('subcategory', e.target.value || null)}
                placeholder="e.g. Wired Microphones" />
            </Field>

            <Field label="Identification / Name" required>
              <input className="form-input" value={form.item_name}
                onChange={e => set('item_name', e.target.value)}
                placeholder="e.g. Shure SM58 Vocal Mic" required />
            </Field>

            <Field label="Detailed Specification">
              <input className="form-input" value={form.description || ''}
                onChange={e => set('description', e.target.value)}
                placeholder="e.g. Dynamic cardioid microphone" />
            </Field>

            <Field label="Default Quantity">
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="form-input" type="number" min="0" step="0.5"
                  value={form.qty_default} onChange={e => set('qty_default', e.target.value)} style={{ flex: 1 }} />
                <select className="minimal-select" style={{ flex: 1, fontSize: 12 }} 
                  value={form.qty_unit} onChange={e => set('qty_unit', e.target.value)}>
                  {QTY_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </Field>

            <Field label="Default Duration">
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="form-input" type="number" min="0" step="0.5"
                  value={form.freq_default} onChange={e => set('freq_default', e.target.value)} style={{ flex: 1 }} />
                <select className="minimal-select" style={{ flex: 1, fontSize: 12 }}
                  value={form.freq_unit} onChange={e => set('freq_unit', e.target.value)}>
                  {FREQ_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </Field>

            {/* Pricing Section - Side by Side */}
            <div style={{ gridColumn: '1 / -1', background: 'var(--bg-2)', padding: 24, borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <h4 style={{ fontSize: 11, marginBottom: 20, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Pricing Strategy & Margin
              </h4>
              <div style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Base Cost (HPP)</label>
                  <div style={{ position: 'relative', marginTop: 8 }}>
                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>Rp</span>
                    <input className="form-input" style={{ width: '100%', paddingLeft: 40, fontFamily: 'var(--font-mono)' }} type="number" min="0" step="1000"
                      value={form.unit_cost ?? ''}
                      onChange={e => {
                        set('unit_cost', e.target.value)
                        handleMarginChange(Number(e.target.value), marginPct)
                      }}
                      placeholder="TBD" />
                  </div>
                </div>

                <div style={{ width: 90 }}>
                  <label className="form-label" style={{ textAlign: 'center', display: 'block' }}>Margin (%)</label>
                  <input className="form-input" style={{ width: '100%', textAlign: 'center', marginTop: 8, fontFamily: 'var(--font-mono)', fontWeight: 700 }} type="number" min="0" max="99"
                    value={marginPct}
                    onChange={e => handleMarginChange(Number(form.unit_cost), Number(e.target.value))}
                    disabled={!form.unit_cost} />
                </div>

                <div style={{ flex: 1 }}>
                  <label className="form-label">Recommended Sell Price</label>
                  <div style={{ position: 'relative', marginTop: 8 }}>
                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>Rp</span>
                    <input className="form-input" style={{ width: '100%', paddingLeft: 40, fontFamily: 'var(--font-mono)', border: '1px solid var(--text-3)' }} type="number" min="0" step="1000"
                      value={form.unit_sell ?? ''}
                      onChange={e => {
                        set('unit_sell', e.target.value)
                        if (form.unit_cost > 0 && e.target.value > 0) {
                          setMarginPct(Math.round(((Number(e.target.value) - form.unit_cost) / Number(e.target.value)) * 100))
                        }
                      }}
                      placeholder="TBD" />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <Field label="Taxation Withholding">
                <select className="form-input" value={form.vendor_tax_type || ''}
                  onChange={e => set('vendor_tax_type', e.target.value)}>
                  <option value="">WHT Exempt</option>
                  <option value="pph23_2">PPh 23 (2%) - Service/Rental</option>
                  <option value="pph21_25">PPh 21 (2.5%) - Manpower</option>
                  <option value="pph21_3">PPh 21 (3%) - Non-NPWP</option>
                  <option value="pph42_10">PPh 4(2) (10%) - Property</option>
                </select>
              </Field>

              <Field label="Accounting Code (COA)">
                <input className="form-input" value={form.coa_code || ''}
                  onChange={e => set('coa_code', e.target.value)}
                  placeholder="e.g. 501.201" />
              </Field>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end', paddingTop: 24, borderTop: '1px solid var(--border)' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving || !form.item_name.trim()} style={{ minWidth: 160 }}>
              {saving ? 'Processing...' : isEdit ? 'Save Changes' : 'Create Database Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
