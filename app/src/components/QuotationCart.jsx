import { Fragment, useState, useEffect, useRef } from 'react'
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  DragOverlay, defaultDropAnimationSideEffects,
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy,
  useSortable, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { calcLineCost, calcLineSell, calcAllSectionSellTotals, calcVendorTax, getUniqueSections } from '../utils/calc'
import { fmtRp } from '../utils/fmt'
import { getMasterZones, getAllRatecardItems } from '../lib/ratecardRepo'

function InlineText({ value, onChange, placeholder = '', bold = false, style = {}, onKeyDown, onBlur, row, col }) {
  const [focused, setFocused] = useState(false)
  return (
    <input
      value={value || ''}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => { setFocused(false); onBlur?.() }}
      onKeyDown={onKeyDown}
      data-row={row}
      data-col={col}
      className="cell-input"
      style={{
        width: '100%', background: 'transparent',
        border: focused ? '1px solid var(--text-3)' : '1px solid transparent',
        borderRadius: 4, padding: focused ? '2px 6px' : '2px 0',
        fontSize: bold ? 13 : 11, fontWeight: bold ? 600 : 400,
        color: 'var(--text)', outline: 'none',
        transition: 'all 0.12s',
        ...style,
      }}
    />
  )
}

function InlineArea({ value, onChange, placeholder = '', style = {}, onKeyDown, onBlur, row, col }) {
  const [focused, setFocused] = useState(false)
  const textareaRef = useRef(null)

  // Auto-expand height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [value])

  return (
    <textarea
      ref={textareaRef}
      value={value || ''}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => { setFocused(false); onBlur?.() }}
      onKeyDown={onKeyDown}
      data-row={row}
      data-col={col}
      className="cell-input cell-area"
      rows={1}
      style={{
        width: '100%', background: 'transparent',
        border: focused ? '1px solid var(--text-3)' : '1px solid transparent',
        borderRadius: 4, padding: focused ? '2px 6px' : '2px 0',
        fontSize: 10, fontWeight: 400,
        color: 'var(--text)', outline: 'none',
        transition: 'border 0.12s',
        resize: 'none',
        overflow: 'hidden',
        lineHeight: '1.4',
        display: 'block',
        ...style,
      }}
    />
  )
}

function InlineUnit({ value, onChange, row, col, onKeyDown, onBlur }) {
  const [focused, setFocused] = useState(false)
  return (
    <input value={value || ''} onChange={e => onChange(e.target.value)}
      onFocus={() => setFocused(true)} 
      onBlur={() => { setFocused(false); onBlur?.() }}
      onKeyDown={onKeyDown}
      data-row={row}
      data-col={col}
      className="cell-input"
      style={{
        width: 46, fontSize: 9, fontWeight: 700, textAlign: 'center',
        textTransform: 'uppercase',
        color: focused ? 'var(--text)' : 'var(--text-3)',
        background: 'transparent',
        border: focused ? '1px solid var(--text-3)' : '1px solid transparent',
        borderRadius: 4, padding: '1px 3px', outline: 'none',
        cursor: 'text', transition: 'border 0.12s',
      }} />
  )
}

function NumInput({ value, onChange, step = 1, w = 50, highlight = false, row, col, onKeyDown, onBlur }) {
  return (
    <input type="number" min="0" step={step} value={value || ''}
      onChange={e => onChange(Number(e.target.value))}
      onKeyDown={onKeyDown}
      onBlur={onBlur}
      data-row={row}
      data-col={col}
      className="cell-input"
      style={{
        width: w, background: 'var(--bg)', textAlign: 'center',
        border: `1px solid ${highlight ? 'var(--text-3)' : 'var(--border)'}`,
        borderRadius: 6, padding: '5px 3px', fontSize: 13,
        color: 'var(--text)', fontWeight: 600,
        fontFamily: 'var(--font-mono)',
        outline: 'none',
        transition: 'all 0.15s'
      }} />
  )
}

/* ── Sortable row wrapper ── */
function SortableRow({ id, item, rowIndex, onUpdate, onCommit, onRemove, onDuplicate, onAddBelow, onEnterKey, colWidths, masterZones, masterItems, onKeyDown, items }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    background: isDragging ? 'var(--surface)' : 'transparent'
  }

  return (
    <tr ref={setNodeRef} style={style}>
      <ItemRowCells
        item={item}
        rowIndex={rowIndex}
        onUpdate={onUpdate}
        onCommit={onCommit}
        onRemove={onRemove}
        onDuplicate={onDuplicate}
        onAddBelow={onAddBelow}
        onEnterKey={onEnterKey}
        dragHandleProps={{ ...attributes, ...listeners }}
        colWidths={colWidths}
        masterZones={masterZones}
        masterItems={masterItems}
        onKeyDown={onKeyDown}
        items={items}
      />
    </tr>
  )
}

/* ── The actual cell content ── */
function ItemRowCells({ item, rowIndex, onUpdate, onCommit, onRemove, onDuplicate, onAddBelow, onEnterKey, dragHandleProps, colWidths, masterItems = [], onKeyDown, items = [] }) {
  const key = item._ratecard_key
  const lineCost = calcLineCost(item)
  const lineSell = calcLineSell(item)
  const marginPct =
    item.unit_cost > 0 && item.unit_sell > 0
      ? Math.round(((item.unit_sell - item.unit_cost) / item.unit_sell) * 100)
      : 20

  const upd = (field, val) => onUpdate(key, { [field]: val })

  const taxRates = { pph23_2: 0.02, pph21_25: 0.025, pph21_3: 0.03, pph42_10: 0.1 }
  const taxAmt = item.vendor_tax_type ? lineCost * (taxRates[item.vendor_tax_type] || 0) : 0

  const mItem = masterItems.find(mi => mi.item_code === item.item_code)
  const variants = mItem?.variants || []

  return (
    <>
      <td style={{ ...TD, width: 22, color: 'var(--text-3)' }} {...dragHandleProps}>
        <div style={{ cursor: 'grab', userSelect: 'none', padding: '4px' }}>⠿</div>
      </td>

      {/* ── ITEM NAME & HIERARCHY ── */}
      <td style={{ ...TD, width: colWidths.item }}>
        {/* LINE 1: Name & Category Grouping */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8,
            paddingLeft: item.sub_category ? 16 : item.category && item.category !== 'custom' ? 8 : 0,
            transition: 'padding 0.2s'
          }}>
             <InlineText value={item.item_name} placeholder="Service or Item Name..."
              onChange={v => upd('item_name', v)}
              onBlur={onCommit} row={rowIndex} col="name" onKeyDown={onKeyDown}
              style={{ fontWeight: 800, fontSize: 13 }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 2, background: 'var(--surface)', padding: '1px 3px', borderRadius: 6, border: '1px solid var(--border)' }}>
            <InlineText value={item.category} placeholder="Cat..."
              onChange={v => upd('category', v)}
              onBlur={onCommit} row={rowIndex} col="cat" onKeyDown={onKeyDown}
              style={{ 
                width: 70, fontSize: 9, padding: '1px 4px', border: 'none', 
                opacity: (rowIndex > 0 && items[rowIndex-1].category === item.category) ? 0.3 : 1 
              }}
            />
            <span style={{ fontSize: 9, color: 'var(--text-3)' }}>›</span>
            <InlineText value={item.sub_category} placeholder="Sub..."
              onChange={v => upd('sub_category', v)}
              onBlur={onCommit} row={rowIndex} col="sub" onKeyDown={onKeyDown}
              style={{ 
                width: 70, fontSize: 9, padding: '1px 4px', border: 'none',
                opacity: (rowIndex > 0 && items[rowIndex-1].sub_category === item.sub_category && items[rowIndex-1].category === item.category) ? 0.3 : 1
              }}
            />
          </div>
        </div>

        {/* LINE 2: Specs & Complimentary */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <InlineArea value={item.spec} placeholder="Technical specifications (Enter for newline...)"
              onChange={v => upd('spec', v)}
              onBlur={onCommit} row={rowIndex} col="spec" onKeyDown={onKeyDown}
              style={{ color: 'var(--text-3)' }}
            />
          </div>
          
          {/* Variant Selector (if any) */}
          {variants.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>{item.item_name || '—'}</span>
              <select 
                value={item.variant_name || ''}
                onChange={e => onUpdate(key, { variant_name: e.target.value })}
                className="minimal-select"
                style={{ fontSize: 9, padding: '1px 3px' }}
              >
                <option value="">—</option>
                {variants.map(v => <option key={v.name} value={v.name}>{v.name}</option>)}
              </select>
            </div>
          )}
        </div>

        <style>{`
          .minimal-select {
            font-size: 10px; padding: 2px 4px; background: transparent; 
            border: 1px solid var(--border); borderRadius: 4px; color: var(--text-2);
            outline: none; cursor: pointer; transition: all 0.15s;
          }
          .minimal-select:hover { border-color: var(--text-3); }
          .minimal-select option { background: var(--surface); color: var(--text); }
        `}</style>
      </td>

      {/* ── QTY ── */}
      <td style={{ ...TD, textAlign: 'center', width: colWidths.qty }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <NumInput value={item.qty} onChange={v => onUpdate(key, { qty: v })} step={0.5} 
            row={rowIndex} col="qty" onKeyDown={onKeyDown} onBlur={onCommit} />
          <InlineUnit value={item.qty_unit} onChange={v => upd('qty_unit', v)} 
            row={rowIndex} col="qty_u" onKeyDown={onKeyDown} onBlur={onCommit} />
        </div>
      </td>

      {/* ── FREQ ── */}
      <td style={{ ...TD, textAlign: 'center', width: colWidths.freq }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <NumInput value={item.freq} onChange={v => onUpdate(key, { freq: v })} step={0.5} 
            row={rowIndex} col="freq" onKeyDown={onKeyDown} onBlur={onCommit}/>
          <InlineUnit value={item.freq_unit} onChange={v => upd('freq_unit', v)} 
            row={rowIndex} col="freq_u" onKeyDown={onKeyDown} onBlur={onCommit} />
        </div>
      </td>

      {/* ── HPP / MODAL ── */}
      <td style={{ ...TD, width: colWidths.hpp }}>
        <NumInput w="100%"
          value={item.unit_cost || ''}
          onChange={v => {
            const updates = { unit_cost: v || null }
            if (v > 0 && marginPct > 0 && marginPct < 100)
              updates.unit_sell = Math.round(v / (1 - marginPct / 100))
            onUpdate(key, updates)
          }}
          highlight={!!item.unit_cost}
          step={1000}
          row={rowIndex} col="cost" onKeyDown={onKeyDown} onBlur={onCommit}
        />
        <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 6, textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
          ∑ {fmtRp(lineCost)}
        </div>
      </td>

      {/* ── PAJAK POTONGAN ── */}
      <td style={{ ...TD, width: colWidths.tax }}>
        <select value={item.vendor_tax_type || ''}
          onChange={e => onUpdate(key, { vendor_tax_type: e.target.value })}
          className="form-input"
          style={{ width: '100%', fontSize: 11, padding: '5px 8px' }}>
          <option value="">WHT Exempt</option>
          <option value="pph23_2">PPh 23 (2%)</option>
          <option value="pph21_25">PPh 21 (2.5%)</option>
          <option value="pph21_3">PPh 21 (3%)</option>
          <option value="pph42_10">PPh 4(2) (10%)</option>
        </select>
        {item.vendor_tax_type && taxAmt > 0 && (
          <div style={{ fontSize: 10, color: 'var(--red)', marginTop: 6, fontWeight: 700, textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
            -{fmtRp(taxAmt)}
          </div>
        )}
      </td>

      {/* ── MARGIN % ── */}
      <td style={{ ...TD, textAlign: 'center', width: colWidths.margin }}>
        <input type="number" min="0" max="99" value={marginPct}
          disabled={!item.unit_cost}
          onChange={e => {
            const pct = Number(e.target.value)
            if (item.unit_cost > 0 && pct < 100)
              onUpdate(key, { unit_sell: Math.round(item.unit_cost / (1 - pct / 100)) })
          }}
          style={{
            width: '100%', textAlign: 'center', borderRadius: 6, padding: '5px 3px',
            fontSize: 13, fontWeight: 700, color: 'var(--accent)',
            background: 'var(--bg)', border: '1px solid var(--border)',
            fontFamily: 'var(--font-mono)', outline: 'none'
          }} />
        <div style={{ fontSize: 9, color: 'var(--vercel-green)', marginTop: 4, fontWeight: 700 }}>
          +{fmtRp(lineSell - lineCost - taxAmt)}
        </div>
      </td>

      {/* ── HARGA JUAL ── */}
      <td style={{ ...TD, width: colWidths.sell }}>
        <input 
          value={item.unit_sell || ''} 
          onChange={e => onUpdate(key, { unit_sell: e.target.value })}
          onBlur={onCommit}
          data-row={rowIndex} data-col="sell" onKeyDown={onKeyDown}
          className="cell-input"
          style={{
            width: '100%', background: 'var(--bg)', textAlign: 'center',
            border: `1px solid var(--border)`,
            borderRadius: 6, padding: '5px 3px', fontSize: 13,
            color: 'var(--text)', fontWeight: 600,
            fontFamily: 'var(--font-mono)',
            outline: 'none',
            transition: 'all 0.15s'
          }} 
        />
      </td>

      {/* ── SUBTOTAL ── */}
      <td style={{ ...TD, textAlign: 'right', width: colWidths.subtotal, fontWeight: 700, fontSize: 13, fontFamily: 'var(--font-mono)' }}>
        {lineSell > 0 ? (
          fmtRp(lineSell)
        ) : (item.unit_sell && isNaN(Number(item.unit_sell)) ? (
          <span className="badge badge-yellow" style={{ fontSize: 9, textTransform: 'uppercase' }}>
            {item.unit_sell}
          </span>
        ) : (
          item.is_complimentary ? <span className="badge badge-yellow" style={{ fontSize: 9 }}>COMPLIMENTARY</span> : fmtRp(0)
        ))}
      </td>

      {/* ── ACTIONS ── */}
      <td style={{ ...TD, textAlign: 'center', width: colWidths.actions }}>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
          <ActionBtn title="Duplicate" onClick={() => onDuplicate(item)} icon="⧉" />
          <ActionBtn title="Delete" onClick={() => onRemove(key)} icon="✕" danger />
        </div>
      </td>
    </>
  )
}

function ActionBtn({ icon, onClick, title, danger }) {
  return (
    <button title={title} onClick={onClick} style={{
      fontSize: 12, background: 'transparent',
      border: '1px solid var(--border)',
      borderRadius: 6, width: 28, height: 28, cursor: 'pointer',
      color: danger ? 'var(--red)' : 'var(--text-2)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all 0.15s'
    }} className="action-btn">
      {icon}
      <style>{`
        .action-btn:hover { border-color: var(--text-3); background: var(--surface); color: var(--text); }
      `}</style>
    </button>
  )
}

/* ── Add Item Footer Bar ── */
function AddBar({ onAdd }) {
  const [code, setCode] = useState('')
  const [name, setName] = useState('')

  const standardSections = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'
  ];

  const submit = () => {
    const c = code.toUpperCase() || 'A'
    onAdd(c, name || '')
    setName(''); setCode('')
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '16px 32px',
      borderTop: '1px solid var(--border)', background: 'var(--bg)', flexWrap: 'wrap',
    }}>
      <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase' }}>Quick Add Section:</span>
      <div style={{ display: 'flex', gap: 4 }}>
        {standardSections.map(v => (
          <button key={v} onClick={() => onAdd(v, '')}
            className="btn btn-ghost btn-sm" style={{ minWidth: 28, padding: 0 }}>
            {v}
          </button>
        ))}
      </div>
      <div style={{ height: 24, width: 1, background: 'var(--border)', margin: '0 8px' }} />
      <input value={code} onChange={e => setCode(e.target.value.toUpperCase())}
        placeholder="SEC" maxLength={4} className="form-input"
        style={{ width: 60, textAlign: 'center', fontWeight: 700 }} />
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Custom Item Title..."
        className="form-input" style={{ flex: 1, minWidth: 200 }} 
        onKeyDown={e => e.key === 'Enter' && submit()}/>
      <button onClick={submit} className="btn btn-primary btn-sm">
        Add Custom Line
      </button>
    </div>
  )
}

/* ── Column Header ── */
const ColH = ({ children, w, center, right, onResize, noResize }) => {
  const [hover, setHover] = useState(false);
  return (
    <th style={{
      padding: '6px 14px', textAlign: center ? 'center' : right ? 'right' : 'left',
      fontSize: 10, fontWeight: 700, color: 'var(--text-2)',
      letterSpacing: '0.05em', textTransform: 'uppercase',
      width: w, position: 'relative',
      background: 'var(--bg)', borderBottom: '1px solid var(--border)', cursor: 'default'
    }}>
      {children}
      {!noResize && (
        <div 
          onMouseDown={onResize}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          style={{
            position: 'absolute', right: 0, top: 0, bottom: 0, width: 8,
            cursor: 'col-resize', background: hover ? 'var(--vercel-blue)' : 'transparent', 
            zIndex: 10, transition: 'background 0.15s',
            opacity: hover ? 0.8 : 0,
            transform: 'translateX(4px)'
          }}
        />
      )}
    </th>
  )
}

/* ── Section Header Row ── */
function SectionHeaderRow({ sec, secTotal, onAddToSection, onRenameSection, sectionName }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(sectionName || '')
  
  return (
    <tr style={{ background: 'var(--bg-2)' }}>
      <td style={{ padding: '12px 8px', borderBottom: '1px solid var(--border)' }}></td>
      <td colSpan={7} style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {sec !== sectionName && sec !== '_' && (
            <span style={{ 
              color: 'var(--bg)', background: 'var(--text)', 
              padding: '2px 8px', borderRadius: 4, 
              fontSize: 11, fontWeight: 800, fontFamily: 'var(--font-mono)' 
            }}>
              {sec}
            </span>
          )}
          {editing ? (
            <input autoFocus value={draft} onChange={e => setDraft(e.target.value)}
              onBlur={() => { onRenameSection(sec, draft); setEditing(false) }}
              onKeyDown={e => { if (e.key === 'Enter') { onRenameSection(sec, draft); setEditing(false) } }}
              className="form-input" style={{ fontSize: 13, fontWeight: 700, minWidth: 240, padding: '4px 8px' }} />
          ) : (
            <span onClick={() => { setDraft(sectionName || ''); setEditing(true) }}
              style={{ fontSize: 14, color: 'var(--text)', fontWeight: 600, cursor: 'text' }}>
              {sectionName || sec || 'Unnamed Section ...'}
            </span>
          )}
        </div>
      </td>
      <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', textAlign: 'right', fontWeight: 700, fontSize: 13, fontFamily: 'var(--font-mono)' }}>
        {fmtRp(secTotal)}
      </td>
      <td style={{ padding: '8px 8px', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
        <button onClick={() => onAddToSection(sec)} className="btn btn-ghost" style={{ width: 28, height: 28, padding: 0 }}>
          +
        </button>
      </td>
    </tr>
  )
}

const TD = { padding: '2px 8px', borderBottom: '1px solid var(--border)', verticalAlign: 'top' }

export default function QuotationCart({ items, onUpdate, onCommit, onRemove, onDuplicate, onAddCustom, onReorder, onRenameSection }) {
  const [activeId, setActiveId] = useState(null)
  const [colWidths, setColWidths] = useState(() => {
    try {
      const saved = localStorage.getItem('juara_quotation_col_widths')
      return saved ? JSON.parse(saved) : {
        item: 320, qty: 72, freq: 72, hpp: 140, tax: 130, margin: 70, sell: 140, subtotal: 130, actions: 80
      }
    } catch {
      return { item: 320, qty: 72, freq: 72, hpp: 140, tax: 130, margin: 70, sell: 140, subtotal: 130, actions: 80 }
    }
  })

  // --- KEYBOARD NAVIGATION ENGINE ---
  const handleKeyDown = (e) => {
    const row = parseInt(e.target.dataset.row)
    const col = e.target.dataset.col
    if (isNaN(row)) return

    const moveFocus = (r, c) => {
      const next = document.querySelector(`.cell-input[data-row="${r}"][data-col="${c}"]`)
      if (next) {
        e.preventDefault()
        next.focus()
        next.select?.()
      }
    }

    if (e.key === 'ArrowDown') moveFocus(row + 1, col)
    if (e.key === 'ArrowUp') moveFocus(row - 1, col)
    
    // Alt + Arrows for Smart Hierarchy (Indentation)
    if (e.altKey && e.key === 'ArrowRight') {
      e.preventDefault()
      const prev = items[row - 1]
      if (prev) {
        onUpdate(items[row]._ratecard_key, { 
          category: prev.category, 
          sub_category: prev.sub_category 
        })
      }
    }
    if (e.altKey && e.key === 'ArrowLeft') {
      e.preventDefault()
      onUpdate(items[row]._ratecard_key, { category: '', sub_category: '' })
    }

    if (e.key === 'Enter') {
      // Don't move focus if we are in a textarea (Specification field)
      const isArea = e.target.tagName === 'TEXTAREA'
      if (!isArea || e.shiftKey || e.metaKey || e.ctrlKey) {
        if (isArea) e.preventDefault() // If doing Cmd+Enter in textarea, prevent newline but move focus
        moveFocus(row + 1, col)
      }
    }
    
    // Alt + D for Duplicate
    if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
      e.preventDefault()
      const item = items[row]
      if (item) onDuplicate(item)
    }
  }
  const [masterItems, setMasterItems] = useState([])

  useEffect(() => {
    getAllRatecardItems().then(setMasterItems)
  }, [])

  const resizingCol = useRef(null)
  const startX = useRef(0)
  const startWidth = useRef(0)

  const handleResizeStart = (e, col) => {
    resizingCol.current = col; startX.current = e.clientX; startWidth.current = colWidths[col]
    document.addEventListener('mousemove', handleResizeMove); document.addEventListener('mouseup', handleResizeEnd)
    document.body.style.cursor = 'col-resize'; document.body.style.userSelect = 'none'
  }
  const handleResizeMove = (e) => {
    if (!resizingCol.current) return
    const delta = e.clientX - startX.current
    setColWidths(prev => ({ ...prev, [resizingCol.current]: Math.max(40, startWidth.current + delta) }))
  }
  const handleResizeEnd = () => {
    resizingCol.current = null; 
    document.removeEventListener('mousemove', handleResizeMove); 
    document.removeEventListener('mouseup', handleResizeEnd)
    document.body.style.cursor = 'default'; 
    document.body.style.userSelect = 'auto'
  }

  // Auto-save widths whenever they change (debounced via state updates)
  useEffect(() => {
    localStorage.setItem('juara_quotation_col_widths', JSON.stringify(colWidths))
  }, [colWidths])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))
  const uniqueSections = getUniqueSections(items)
  const sectionTotals = calcAllSectionSellTotals(items)

  const handleDragEnd = ({ active, over }) => {
    setActiveId(null)
    if (!over || active.id === over.id) return
    const oldIdx = items.findIndex(i => i._ratecard_key === active.id)
    const newIdx = items.findIndex(i => i._ratecard_key === over.id)
    onReorder(arrayMove(items, oldIdx, newIdx))
  }

  const handleAddBelow = (key) => {
    const idx = items.findIndex(i => i._ratecard_key === key)
    const item = items[idx]
    onAddCustom(
      item?.section_code || 'A', 
      '', 
      idx + 1, 
      item?.category, 
      item?.sub_category
    )
  }

  if (items.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)' }}>
        <CartHeader itemCount={0} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
          <p style={{ fontSize: 13, fontWeight: 500 }}>Select items from the ratecard or add custom lines.</p>
        </div>
        <AddBar onAdd={onAddCustom} />
      </div>
    )
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter}
      onDragStart={({ active }) => setActiveId(active.id)}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
        <CartHeader itemCount={items.length} />
        <div style={{ overflowX: 'auto', flex: 1, overflowY: 'auto', borderRight: '1px solid var(--border)' }}>
          <table style={{ width: 'max-content', minWidth: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
              <tr>
                <ColH w={22} noResize />
                <ColH w={colWidths.item} onResize={(e) => handleResizeStart(e, 'item')}>Service / Item</ColH>
                <ColH w={colWidths.qty} center onResize={(e) => handleResizeStart(e, 'qty')}>Qty</ColH>
                <ColH w={colWidths.freq} center onResize={(e) => handleResizeStart(e, 'freq')}>Freq</ColH>
                <ColH w={colWidths.hpp} onResize={(e) => handleResizeStart(e, 'hpp')}>Cost (HPP)</ColH>
                <ColH w={colWidths.tax} onResize={(e) => handleResizeStart(e, 'tax')}>Tax WHT</ColH>
                <ColH w={colWidths.margin} center onResize={(e) => handleResizeStart(e, 'margin')}>Margin</ColH>
                <ColH w={colWidths.sell} onResize={(e) => handleResizeStart(e, 'sell')}>Unit Sell</ColH>
                <ColH w={colWidths.subtotal} right onResize={(e) => handleResizeStart(e, 'subtotal')}>Subtotal</ColH>
                <ColH w={colWidths.actions} center noResize />
              </tr>
            </thead>
            <tbody>
              <SortableContext items={items.map(i => i._ratecard_key)} strategy={verticalListSortingStrategy}>
                {uniqueSections.map(s => {
                  const sec = s.code; const secItems = items.filter(i => (i.section_code || i.section || '_') === sec)
                  return (
                    <Fragment key={sec}>
                      <SectionHeaderRow sec={sec} secTotal={sectionTotals[sec] || 0} sectionName={s.name || secItems[0]?.section_name || ''} onAddToSection={() => onAddCustom(sec)} onRenameSection={onRenameSection} />
                      {secItems.map(item => {
                        const globalIdx = items.findIndex(i => i._ratecard_key === item._ratecard_key)
                        return (
                          <SortableRow key={item._ratecard_key} id={item._ratecard_key} 
                            item={item} rowIndex={globalIdx} 
                            onUpdate={onUpdate} onCommit={onCommit} onRemove={onRemove} 
                            onDuplicate={onDuplicate} 
                            onAddBelow={() => handleAddBelow(item._ratecard_key)} 
                            onEnterKey={() => handleAddBelow(item._ratecard_key)} 
                            colWidths={colWidths} masterItems={masterItems}
                            onKeyDown={handleKeyDown}
                            items={items}
                          />
                        )
                      })}
                    </Fragment>
                  )
                })}
              </SortableContext>
            </tbody>
          </table>
        </div>
        <AddBar onAdd={onAddCustom} />
      </div>

      <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.3' } } }) }}>
        {activeId && (
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)', borderRadius: 8, padding: '16px 24px', minWidth: 400 }}>
             <h4 style={{ fontSize: 14 }}>{items.find(i => i._ratecard_key === activeId)?.item_name}</h4>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}

function CartHeader({ itemCount }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px 32px', borderBottom: '1px solid var(--border)',
      background: 'var(--bg)', flexShrink: 0,
    }}>
      <div>
        <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Inventory & Calculations</h3>
        <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>
          {itemCount} lines active · Drag to reorder · Section headers support inline renaming
        </div>
      </div>
    </div>
  )
}
