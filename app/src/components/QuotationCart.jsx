import { Fragment, useState, useEffect, useRef, memo, useCallback, useMemo } from 'react'
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  DragOverlay, defaultDropAnimationSideEffects,
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy,
  useSortable, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
  calcLineCost, calcLineSell, calcAllSectionSellTotals, calcVendorTax, getUniqueSections,
  getUniqueZones, calcAllZoneSellTotals
} from '../utils/calc'
import { fmtRp } from '../utils/fmt'
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

function RemoteCursorIndicator({ cursor }) {
  if (!cursor) return null
  return (
    <div style={{
      position: 'absolute', top: -1, left: -1, right: -1, bottom: -1,
      border: `2px solid ${cursor.userColor}`,
      pointerEvents: 'none', borderRadius: 4, zIndex: 10,
      boxShadow: `0 0 4px ${cursor.userColor}`
    }}>
      <div style={{
        position: 'absolute', top: -18, left: -2,
        background: cursor.userColor, color: 'white',
        fontSize: 8, fontWeight: 800, padding: '1px 4px',
        borderRadius: '3px 3px 3px 0', whiteSpace: 'nowrap'
      }}>
        {cursor.userName}
      </div>
    </div>
  )
}

function InlineText({ value, onChange, placeholder = '', bold = false, style = {}, onKeyDown, onBlur, onFocus, row, col, remoteCursor }) {
  const [localValue, setLocalValue] = useState(value)
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    if (!focused) setLocalValue(value)
  }, [value, focused])

  const handleBlur = () => {
    setFocused(false)
    if (localValue !== value) onChange(localValue)
    onBlur?.()
  }

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <RemoteCursorIndicator cursor={remoteCursor} />
      <input
        value={localValue || ''}
        placeholder={placeholder}
        onChange={e => setLocalValue(e.target.value)}
        onFocus={() => { setFocused(true); onFocus?.() }}
        onBlur={handleBlur}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            handleBlur()
            e.currentTarget.blur()
          }
          onKeyDown?.(e)
        }}
        disabled={!!remoteCursor}
        data-row={row}
        data-col={col}
        className="cell-input"
        style={{
          width: '100%', background: 'transparent',
          border: focused ? '1px solid var(--text-3)' : '1px solid transparent',
          borderRadius: 4, padding: focused ? '2px 6px' : '2px 0',
          fontSize: bold ? 12 : 11, fontWeight: bold ? 700 : 500,
          color: remoteCursor ? 'var(--text-3)' : 'var(--text)', outline: 'none',
          transition: 'all 0.12s',
          whiteSpace: 'normal',
          wordBreak: 'break-word',
          cursor: remoteCursor ? 'not-allowed' : 'text',
          opacity: remoteCursor ? 0.7 : 1,
          ...style,
        }}
      />
      {remoteCursor && (
        <span style={{ position: 'absolute', right: 4, top: 4, fontSize: 8, opacity: 0.5 }}>🔒</span>
      )}
    </div>
  )
}

function InlineArea({ value, onChange, placeholder = '', style = {}, onKeyDown, onBlur, onFocus, row, col, remoteCursor }) {
  const [localValue, setLocalValue] = useState(value)
  const [focused, setFocused] = useState(false)
  const textareaRef = useRef(null)

  useEffect(() => {
    if (!focused) setLocalValue(value)
  }, [value, focused])

  // Auto-expand height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [localValue])

  const handleBlur = () => {
    setFocused(false)
    if (localValue !== value) onChange(localValue)
    onBlur?.()
  }

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <RemoteCursorIndicator cursor={remoteCursor} />
      <textarea
        ref={textareaRef}
        value={localValue || ''}
        placeholder={placeholder}
        onChange={e => setLocalValue(e.target.value)}
        onFocus={() => { setFocused(true); onFocus?.() }}
        onBlur={handleBlur}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) {
            handleBlur()
            e.currentTarget.blur()
          }
          onKeyDown?.(e)
        }}
        disabled={!!remoteCursor}
        data-row={row}
        data-col={col}
        className="cell-input cell-area"
        rows={1}
        style={{
          width: '100%', background: 'transparent',
          border: focused ? '1px solid var(--text-3)' : '1px solid transparent',
          borderRadius: 4, padding: focused ? '2px 6px' : '2px 0',
          fontSize: 9, fontWeight: 400,
          color: remoteCursor ? 'var(--text-3)' : 'var(--text)', outline: 'none',
          transition: 'border 0.12s',
          resize: 'none',
          overflow: 'hidden',
          lineHeight: '1.4',
          display: 'block',
          cursor: remoteCursor ? 'not-allowed' : 'text',
          opacity: remoteCursor ? 0.7 : 1,
          ...style,
        }}
      />
      {remoteCursor && (
        <span style={{ position: 'absolute', right: 4, top: 4, fontSize: 8, opacity: 0.5 }}>🔒</span>
      )}
    </div>
  )
}

function InlineUnit({ value, onChange, row, col, onKeyDown, onBlur }) {
  const [localValue, setLocalValue] = useState(value)
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    if (!focused) setLocalValue(value)
  }, [value, focused])

  const handleBlur = () => {
    setFocused(false)
    if (localValue !== value) onChange(localValue)
    onBlur?.()
  }

  return (
    <input value={localValue || ''}
      onChange={e => setLocalValue(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={handleBlur}
      onKeyDown={e => {
        if (e.key === 'Enter') {
          handleBlur()
          e.currentTarget.blur()
        }
        onKeyDown?.(e)
      }}
      data-row={row}
      data-col={col}
      className="cell-input"
      style={{
        width: 34, fontSize: 8, fontWeight: 700, textAlign: 'center',
        textTransform: 'uppercase',
        color: focused ? 'var(--text)' : 'var(--text-3)',
        background: 'transparent',
        border: focused ? '1px solid var(--text-3)' : '1px solid transparent',
        borderRadius: 4, padding: '1px 3px', outline: 'none',
        cursor: 'text', transition: 'border 0.12s',
        whiteSpace: 'nowrap'
      }} />
  )
}

const fmt = (v) => {
  if (v === null || v === undefined || v === '') return '';
  const num = Number(v);
  if (isNaN(num)) return v;
  return new Intl.NumberFormat('id-ID').format(num);
}

function NumInput({ value, onChange, w = '100%', highlight = false, row, col, onKeyDown, onBlur, onFocus, remoteCursor }) {
  const [localValue, setLocalValue] = useState(value)
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    if (!focused) setLocalValue(value)
  }, [value, focused])

  const handleBlur = () => {
    setFocused(false)
    if (localValue !== value) onChange(localValue)
    onBlur?.()
  }

  return (
    <div style={{ position: 'relative', width: w }}>
      <RemoteCursorIndicator cursor={remoteCursor} />
      <input type="text" value={focused ? (localValue ?? '') : fmt(value)}
        onChange={e => {
          const raw = e.target.value.replace(/\./g, '');
          setLocalValue(raw === '' ? null : (isNaN(Number(raw)) ? raw : Number(raw)));
        }}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            handleBlur()
            e.currentTarget.blur()
          }
          onKeyDown?.(e)
        }}
        onBlur={handleBlur}
        onFocus={e => {
          setFocused(true)
          e.target.style.borderColor = 'var(--vercel-blue)';
          e.target.style.background = 'var(--surface)';
          onFocus?.()
        }}
        data-row={row}
        data-col={col}
        className="cell-input"
        style={{
          width: '100%', background: 'transparent', textAlign: 'center',
          border: '1px solid transparent',
          borderBottom: highlight ? '1px solid var(--border)' : '1px solid transparent',
          borderRadius: 4, padding: '3px 2px', fontSize: 11,
          color: 'var(--text)', fontWeight: 700,
          fontFamily: 'var(--font-mono)',
          outline: 'none',
          transition: 'all 0.15s',
          cursor: 'pointer'
        }}
        onMouseEnter={e => e.target.style.borderColor = 'var(--border)'}
        onMouseLeave={e => { if (document.activeElement !== e.target) e.target.style.borderColor = 'transparent' }}
      />
    </div>
  )
}

function ZonePicker({ currentZone, zones = [], onSelect, onOpenChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  // Notify parent when dropdown open state changes
  // Used by Builder to pause autosave while dropdown is open
  useEffect(() => {
    if (onOpenChange) onOpenChange(isOpen)
  }, [isOpen, onOpenChange])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const isValid = zones.some(z => z.name === currentZone)
  const isOrphan = currentZone && !isValid

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        style={{
          width: '100%', padding: '4px 8px', border: '1px solid var(--border)',
          borderRadius: 3, fontSize: 11, cursor: 'pointer', textAlign: 'left',
          background: 'transparent', display: 'flex', alignItems: 'center', gap: 6,
          transition: 'all 0.2s', color: isOrphan ? 'var(--yellow)' : (currentZone ? 'var(--text)' : 'var(--text-3)'),
          fontStyle: currentZone ? 'normal' : 'italic'
        }}
        onMouseEnter={e => e.target.style.background = 'var(--surface-2)'}
        onMouseLeave={e => e.target.style.background = 'transparent'}
      >
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {isOrphan ? currentZone : (currentZone ? currentZone : 'Assign Zone')}
        </span>
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0,
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 4, minWidth: 180, zIndex: 100,
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)', padding: '4px 0'
        }}>
          <button
            type="button"
            onMouseDown={(e) => { 
              e.stopPropagation(); 
              console.log('🔵 NEW ZONE MOUSE DOWN');
              setIsOpen(false); 
            }}
            style={{
              width: '100%', padding: '6px 12px', fontSize: 11, textAlign: 'left',
              background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--vercel-blue)',
              fontWeight: 600
            }}
            onMouseEnter={e => e.target.style.background = 'var(--surface-2)'}
            onMouseLeave={e => e.target.style.background = 'transparent'}
          >
            Buat zone baru
          </button>

          {currentZone && (
            <>
              <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
              <button
                type="button"
                onMouseDown={(e) => { 
                  e.stopPropagation(); 
                  console.log('🔵 CLEAR ZONE MOUSE DOWN');
                  onSelect(null); 
                  setIsOpen(false); 
                }}
                style={{
                  width: '100%', padding: '6px 12px', fontSize: 11, textAlign: 'left',
                  background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--red)'
                }}
                onMouseEnter={e => e.target.style.background = 'var(--surface-2)'}
                onMouseLeave={e => e.target.style.background = 'transparent'}
              >
                Hapus assignment
              </button>
            </>
          )}

          <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />

          {zones.length === 0 ? (
            <div style={{ padding: '8px 12px', fontSize: 10, color: 'var(--text-3)', textAlign: 'center' }}>
              Belum ada zone
            </div>
          ) : (
            zones.map(z => (
              <button
                type="button"
                key={z.name}
                onMouseDown={(e) => { 
                  e.stopPropagation(); 
                  console.log('🔵 ZONE BUTTON MOUSE DOWN', z.name);
                  onSelect(z.name); 
                  setIsOpen(false); 
                }}
                style={{
                  width: '100%', padding: '6px 12px', fontSize: 11, textAlign: 'left',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  color: 'var(--text)'
                }}
                onMouseEnter={e => e.target.style.background = 'var(--surface-2)'}
                onMouseLeave={e => e.target.style.background = 'transparent'}
              >
                <span>{z.name}</span>
                {currentZone === z.name && <span style={{ color: 'var(--vercel-blue)' }}>✓</span>}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

/* ── Sortable row wrapper ── */
const SortableRow = memo(function SortableRow({ 
  id, item, rowIndex, isActive, onSetActive, onUpdate, onCommit, onRemove, onDuplicate, onAddBelow, onEnterKey, 
  colWidths, onKeyDown, rowCursors, onFocusCell, rowComments, onComment, onEditingKey, 
  zones, onSetItemZone, onIndent, showFinancials 
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.3 : 1,
    background: isDragging ? 'var(--surface)' : isActive ? 'rgba(0, 112, 243, 0.25)' : 'transparent',
    boxShadow: isActive
      ? 'inset 4px 0 0 #0070f3, inset -1px 0 0 #0070f3, inset 0 1px 0 #0070f3, inset 0 -1px 0 #0070f3'
      : 'none',
    zIndex: isDragging ? 999 : (isActive ? 2 : 1),
    position: 'relative'
  }

  return (
    <tr
      ref={setNodeRef}
      style={style}
      data-row-key={item._ratecard_key}
      onClick={(e) => {
        if (isActive) onSetActive(null)
        else onSetActive(rowIndex)
      }}
    >
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
        onKeyDown={onKeyDown}
        rowCursors={rowCursors}
        onFocusCell={onFocusCell}
        rowComments={rowComments}
        onComment={onComment}
        onEditingKey={onEditingKey}
        zones={zones}
        onSetItemZone={onSetItemZone}
        onIndent={onIndent}
        showFinancials={showFinancials}
      />
    </tr>
  )
})

/* ── The actual cell content ── */
const ItemRowCells = memo(function ItemRowCells({ 
  item, rowIndex, onUpdate, onCommit, onRemove, onDuplicate, onAddBelow, onEnterKey, 
  dragHandleProps, colWidths, onKeyDown, rowCursors = [], onFocusCell, 
  rowComments = [], onComment, onEditingKey, zones = [], onSetItemZone, onIndent, showFinancials
}) {
  const key = item._ratecard_key
  const lockEdit = () => onEditingKey?.(key, true)
  const unlockEdit = () => onEditingKey?.(key, false)

  const getCursor = (colId) => {
    return rowCursors.find(c => c.colId === colId)
  }

  const lineCost = calcLineCost(item)
  const lineSell = calcLineSell(item)
  const marginPct =
    item.unit_cost > 0 && item.unit_sell > 0
      ? Math.round(((item.unit_sell - item.unit_cost) / item.unit_sell) * 100)
      : 20

  const upd = (field, val) => onUpdate(key, { [field]: val })

  const taxRates = { pph23_2: 0.02, pph21_25: 0.025, pph21_3: 0.03, pph42_10: 0.1 }
  const taxAmt = item.vendor_tax_type ? lineCost * (taxRates[item.vendor_tax_type] || 0) : 0

  return (
    <>
      <td style={{ ...TD, width: 40, verticalAlign: 'middle' }} {...dragHandleProps}>
        <div style={{ cursor: 'grab', userSelect: 'none', padding: '4px' }}>⠿</div>
      </td>
      <td style={{ ...TD, width: colWidths.zone, verticalAlign: 'top', padding: '12px 8px' }}>
        <ZonePicker
          currentZone={item.zone_name}
          zones={zones}
          onSelect={(newZoneName) => onSetItemZone(item._ratecard_key, newZoneName)}
          onOpenChange={(open) => onEditingKey?.(`zone-picker:${item._ratecard_key}`, open)}
        />
      </td>

      {/* ── ITEM NAME & SPECS (MULTI-LINE WRAP) ── */}
      <td style={{ ...TD, width: colWidths.item, verticalAlign: 'top', padding: '12px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Hierarchy Indent */}
          <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
            {item.parent_id && <span style={{ color: 'var(--text-3)', fontSize: 12, marginRight: 4 }}>↳</span>}
            <button onClick={() => onUpdate(key, { parent_id: null })} className="row-action-btn" style={{ opacity: item.parent_id ? 1 : 0.2 }}>←</button>
            <button onClick={() => onIndent(key)} className="row-action-btn" style={{ opacity: rowIndex > 0 ? 1 : 0.2 }}>→</button>
          </div>

          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <InlineArea value={item.item_name} placeholder="Item Name / Task Description..."
              onChange={v => upd('item_name', v)}
              onBlur={onCommit} row={rowIndex} col="name" onKeyDown={onKeyDown}
              onFocus={() => onFocusCell?.(key, 'name')}
              remoteCursor={getCursor('name')}
              style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', lineHeight: 1.4 }}
            />

            <InlineArea value={item.spec} placeholder="Specs..."
              onChange={v => upd('spec', v)}
              onBlur={onCommit} row={rowIndex} col="spec" onKeyDown={onKeyDown}
              onFocus={() => onFocusCell?.(key, 'spec')}
              remoteCursor={getCursor('spec')}
              style={{ color: 'var(--text-2)', fontSize: 11, fontStyle: 'italic', lineHeight: 1.4 }}
            />
          </div>

          {/* Category Mini Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, opacity: 0.6, flexShrink: 0 }}>
            <span style={{ fontSize: 9, color: 'var(--text-4)' }}>#</span>
            <InlineText value={item.category} placeholder="Category..."
              onChange={v => upd('category', v)}
              onBlur={onCommit} row={rowIndex} col="cat" onKeyDown={onKeyDown}
              onFocus={() => onFocusCell?.(key, 'cat')}
              remoteCursor={getCursor('cat')}
              style={{ width: 70, fontSize: 9, textAlign: 'right', fontStyle: 'italic' }}
            />
          </div>
        </div>
      </td>

      {/* ── QTY (SINGLE LINE) ── */}
      <td style={{ ...TD, width: colWidths.qty, verticalAlign: 'middle' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
          <NumInput value={item.qty} onChange={v => onUpdate(key, { qty: v })} w={45}
            row={rowIndex} col="qty" onKeyDown={onKeyDown}
            onBlur={() => { onCommit(); unlockEdit(); }}
            onFocus={() => { onFocusCell?.(key, 'qty'); lockEdit(); }}
            remoteCursor={getCursor('qty')} />
          <InlineUnit value={item.qty_unit} onChange={v => upd('qty_unit', v)}
            row={rowIndex} col="qty_u" onKeyDown={onKeyDown}
            onBlur={() => { onCommit(); unlockEdit(); }} />
        </div>
      </td>

      {/* ── FREQ (SINGLE LINE) ── */}
      <td style={{ ...TD, width: colWidths.freq, verticalAlign: 'middle' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
          <NumInput value={item.freq} onChange={v => onUpdate(key, { freq: v })} w={45}
            row={rowIndex} col="freq" onKeyDown={onKeyDown}
            onBlur={() => { onCommit(); unlockEdit(); }}
            onFocus={() => { onFocusCell?.(key, 'freq'); lockEdit(); }}
            remoteCursor={getCursor('freq')} />
          <InlineUnit value={item.freq_unit} onChange={v => upd('freq_unit', v)}
            row={rowIndex} col="freq_u" onKeyDown={onKeyDown}
            onBlur={() => { onCommit(); unlockEdit(); }} />
        </div>
      </td>

      {showFinancials && (
        <td style={{ ...TD, width: colWidths.hpp, verticalAlign: 'middle' }}>
          <NumInput w="100%"
            value={item.unit_cost || ''}
            onChange={v => {
              const updates = { unit_cost: v || null }
              if (v > 0 && marginPct > 0 && marginPct < 100)
                updates.unit_sell = Math.round(v / (1 - marginPct / 100))
              onUpdate(key, updates)
            }}
            highlight={!!item.unit_cost}
            row={rowIndex} col="cost" onKeyDown={onKeyDown}
            onBlur={() => { onCommit(); unlockEdit(); }}
            onFocus={() => { onFocusCell?.(key, 'cost'); lockEdit(); }}
            remoteCursor={getCursor('cost')}
          />
        </td>
      )}

      {/* ── TAX ── */}
      {showFinancials && (
        <td style={{ ...TD, width: colWidths.tax, verticalAlign: 'middle' }}>
          <select value={item.vendor_tax_type || ''}
            onChange={e => onUpdate(key, { vendor_tax_type: e.target.value })}
            onFocus={() => onFocusCell?.(key, 'tax')}
            className="form-input"
            style={{ width: '100%', fontSize: 10, padding: '2px 4px', height: 26, position: 'relative' }}>
            <option value="">No Tax</option>
            <option value="pph23_2">PPH 23 (2%)</option>
            <option value="pph21_25">PPH 21 (2.5%)</option>
            <option value="pph21_3">PPH 21 (3%)</option>
            <option value="pph42_10">PPH 4(2) (10%)</option>
          </select>
          <RemoteCursorIndicator cursor={getCursor('tax')} />
        </td>
      )}

      {/* ── MARGIN ── */}
      {showFinancials && (
        <td style={{ ...TD, width: colWidths.margin, verticalAlign: 'middle' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <input type="number" min="0" max="99" value={marginPct}
              disabled={!item.unit_cost}
              onChange={e => {
                const pct = Number(e.target.value)
                if (item.unit_cost > 0 && pct < 100)
                  onUpdate(key, { unit_sell: Math.round(item.unit_cost / (1 - pct / 100)) })
              }}
              onFocus={lockEdit}
              onBlur={() => { onCommit(); unlockEdit(); }}
              style={{
                width: '100%', textAlign: 'center', borderRadius: 4, padding: '2px 0',
                fontSize: 12, fontWeight: 700, color: 'var(--accent)',
                background: 'var(--bg)', border: '1px solid var(--border)',
                fontFamily: 'var(--font-mono)', outline: 'none'
              }} />
            <span style={{ fontSize: 9, opacity: 0.5 }}>%</span>
          </div>
        </td>
      )}

      {/* ── SELL ── */}
      <td style={{ ...TD, width: colWidths.sell, verticalAlign: 'middle' }}>
        <NumInput
          value={item.unit_sell || ''}
          onChange={v => onUpdate(key, { unit_sell: v })}
          onBlur={() => { onCommit(); unlockEdit(); }}
          onFocus={() => { onFocusCell?.(key, 'sell'); lockEdit(); }}
          remoteCursor={getCursor('sell')}
          row={rowIndex} col="sell" onKeyDown={onKeyDown}
        />
      </td>

      {/* ── SUBTOTAL ── */}
      <td style={{ ...TD, textAlign: 'right', width: colWidths.subtotal, fontWeight: 700, fontSize: 13, fontFamily: 'var(--font-mono)', verticalAlign: 'middle' }}>
        {fmtRp(lineSell)}
      </td>

      {/* ── ACTIONS ── */}
      <td style={{ ...TD, textAlign: 'center', width: colWidths.actions, verticalAlign: 'middle' }}>
        <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
          <div style={{ position: 'relative' }}>
            <ActionBtn title="Comment" onClick={() => onComment(key)} icon="💬" />
            {rowComments.length > 0 && (
              <span style={{
                position: 'absolute', top: -4, right: -4,
                background: 'var(--red)', color: 'white',
                fontSize: 7, padding: '1px 3px', borderRadius: 10,
                fontWeight: 800, border: '1px solid var(--bg)'
              }}>
                {rowComments.length}
              </span>
            )}
          </div>
          <ActionBtn title="Duplicate" onClick={() => onDuplicate(item)} icon="⧉" />
          <ActionBtn title="Delete" onClick={() => onRemove(key)} icon="✕" danger />
        </div>
      </td>

      <style>{`
        .row-action-btn {
          width: 18px; height: 18px; display: flex; alignItems: center; justifyContent: center;
          background: transparent; border: 1px solid var(--border); border-radius: 4px;
          font-size: 10px; cursor: pointer; color: var(--text-3); transition: all 0.2s;
        }
        .row-action-btn:hover { border-color: var(--text); color: var(--text); background: var(--surface); }
      `}</style>
    </>
  )
})

function ActionBtn({ icon, onClick, title, danger }) {
  return (
    <button title={title} 
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }} 
      style={{
      fontSize: 10, background: 'transparent',
      border: '1px solid var(--border)',
      borderRadius: 4, width: 22, height: 22, cursor: 'pointer',
      color: danger ? 'var(--red)' : 'var(--text-2)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all 0.15s'
    }} className="action-btn">
      {icon}
    </button>
  )
}

/* ── Add Item Footer Bar ── */
const AddBar = memo(function AddBar({ onAdd }) {
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
      display: 'flex', alignItems: 'center', gap: 12, padding: '8px 32px',
      borderTop: '1px solid var(--border)', background: 'var(--bg)', flexWrap: 'wrap',
    }}>
      <span style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase' }}>Quick Add:</span>
      <div style={{ display: 'flex', gap: 4 }}>
        {standardSections.map(v => (
          <button key={v} onClick={() => onAdd(v, '')}
            className="btn btn-ghost btn-sm" style={{ minWidth: 24, padding: 0, height: 24, fontSize: 10 }}>
            {v}
          </button>
        ))}
      </div>
      <div style={{ height: 20, width: 1, background: 'var(--border)', margin: '0 8px' }} />
      <input value={code} onChange={e => setCode(e.target.value.toUpperCase())}
        placeholder="SEC" maxLength={4} className="form-input"
        style={{ width: 50, textAlign: 'center', fontWeight: 700, height: 28, fontSize: 11 }} />
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Custom Item Title..."
        className="form-input" style={{ flex: 1, minWidth: 200, height: 28, fontSize: 11 }}
        onKeyDown={e => e.key === 'Enter' && submit()} />
      <button onClick={submit} className="btn btn-primary btn-sm" style={{ height: 28, fontSize: 11 }}>
        Add Line
      </button>
    </div>
  )
})

/* ── Column Header ── */
const ColH = ({ children, w, center, right, onResize, noResize }) => {
  const [hover, setHover] = useState(false);
  return (
    <th style={{
      padding: '4px 10px', textAlign: center ? 'center' : right ? 'right' : 'left',
      fontSize: 9, fontWeight: 700, color: 'var(--text-3)',
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
            position: 'absolute', right: 0, top: 4, bottom: 4, width: 4,
            cursor: 'col-resize', 
            background: hover ? 'var(--vercel-blue)' : 'var(--border)',
            borderRadius: 2,
            zIndex: 10, transition: 'all 0.15s',
            opacity: hover ? 1 : 0.4,
            transform: 'translateX(2px)'
          }}
        />
      )}
    </th>
  )
}

/* ── Section Header Row ── */
function SectionHeaderRow({ sec, secTotal, onAddToSection, onRenameSection, sectionName, showFinancials }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(sectionName || '')

  return (
    <tr style={{ background: 'var(--bg-2)' }}>
      <td style={{ padding: '6px 8px', borderBottom: '1px solid var(--border)' }}></td>
      <td colSpan={showFinancials ? 8 : 5} style={{ padding: '4px 12px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {sec !== sectionName && sec !== '_' && (
            <span style={{
              color: 'var(--bg)', background: 'var(--text-3)',
              padding: '1px 6px', borderRadius: 3,
              fontSize: 9, fontWeight: 800, fontFamily: 'var(--font-mono)'
            }}>
              {sec}
            </span>
          )}
          {editing ? (
            <input autoFocus value={draft} onChange={e => setDraft(e.target.value)}
              onBlur={() => { onRenameSection(sec, draft); setEditing(false) }}
              onKeyDown={e => { if (e.key === 'Enter') { onRenameSection(sec, draft); setEditing(false) } }}
              className="form-input" style={{ fontSize: 11, fontWeight: 700, minWidth: 200, padding: '2px 6px', height: 24 }} />
          ) : (
            <span onClick={() => { setDraft(sectionName || ''); setEditing(true) }}
              style={{ fontSize: 13, color: 'var(--text)', fontWeight: 800, cursor: 'text', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
              {sectionName || sec || 'Unnamed Section ...'}
            </span>
          )}
        </div>
      </td>
      <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', textAlign: 'right', fontWeight: 800, fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>
        {fmtRp(secTotal)}
      </td>
      <td style={{ padding: '4px 8px', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
        <button onClick={() => onAddToSection(sec)} className="btn btn-ghost" style={{ width: 22, height: 22, padding: 0, fontSize: 10 }}>
          +
        </button>
      </td>
    </tr>
  )
}

function SubcategoryHeaderRow({ name, showFinancials }) {
  return (
    <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
      <td style={{ padding: '4px 8px' }}></td>
      <td colSpan={showFinancials ? 9 : 6} style={{ padding: '6px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 4, height: 12, background: 'var(--accent)', borderRadius: 2 }}></div>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
            {name}
          </span>
        </div>
      </td>
      <td style={{ borderBottom: '1px solid var(--border)' }}></td>
    </tr>
  )
}


const TD = { padding: '4px 8px', borderBottom: '1px solid var(--border)', position: 'relative' }

const GroupByToggle = memo(function GroupByToggle({ value, onChange, zoom, onZoomIn, onZoomOut, onFit, showFinancials, onToggleFinancials, onResetLayout }) {
  const options = [
    { key: 'hybrid', label: 'Hybrid' },
    { key: 'pure_zone', label: 'By Zone' },
    { key: 'pure_section', label: 'By Section' },
  ]
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 32px', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
      <div style={{ display: 'flex', gap: 8 }}>
        {options.map(opt => (
          <button key={opt.key} onClick={() => onChange(opt.key)}
            style={{
              padding: '4px 14px', fontSize: 10, borderRadius: 6,
              background: value === opt.key ? 'var(--surface-2)' : 'transparent',
              border: value === opt.key ? '1px solid var(--text-3)' : '1px solid transparent',
              color: value === opt.key ? 'var(--text)' : 'var(--text-3)',
              cursor: 'pointer', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
              transition: 'all 0.15s'
            }}>
            {opt.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, padding: '2px' }}>
          <button onClick={() => onZoomOut()} className="zoom-btn" title="Zoom Out">➖</button>
          <span style={{ fontSize: 10, fontWeight: 700, width: 35, textAlign: 'center', color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>
            {Math.round(zoom * 100)}%
          </span>
          <button onClick={() => onZoomIn()} className="zoom-btn" title="Zoom In">➕</button>
        </div>
        <button onClick={() => onFit()} 
          style={{ 
            fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 6, 
            background: 'var(--surface-2)', border: '1px solid var(--border)', 
            color: 'var(--text)', cursor: 'pointer' 
          }}>
          FIT TO PAGE
        </button>

        <div style={{ width: 1, height: 16, background: 'var(--border)' }} />

        <button onClick={() => onToggleFinancials()} 
          style={{ 
            fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 6, 
            background: showFinancials ? 'var(--surface-2)' : 'var(--vercel-blue)', 
            border: '1px solid var(--border)', 
            color: showFinancials ? 'var(--text)' : 'white', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6
          }}>
          {showFinancials ? '👁️ HIDE FINANCIALS' : '👁️ SHOW FINANCIALS'}
        </button>

        <button onClick={() => onResetLayout()} 
          style={{ 
            fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 6, 
            background: 'transparent', border: '1px solid var(--border)', 
            color: 'var(--text-3)', cursor: 'pointer'
          }}>
          RESET LAYOUT
        </button>
      </div>
      <style>{`
        .zoom-btn {
          width: 20px; height: 20px; display: flex; alignItems: center; justifyContent: center;
          background: transparent; border: none; cursor: pointer; font-size: 10px;
          border-radius: 4px; transition: background 0.2s;
        }
        .zoom-btn:hover { background: var(--surface-2); }
      `}</style>
    </div>
  )
})

function ZoneHeaderRow({ zoneName, subtotal, indent = false, isOrphan = false, showFinancials }) {
  const isUnallocated = !zoneName
  return (
    <tr>
      <td colSpan={showFinancials ? 11 : 8}
        style={{
          background: 'var(--surface-2)',
          padding: indent ? '10px 12px 10px 32px' : '10px 12px 10px 24px',
          borderBottom: '1px solid var(--border)',
          fontWeight: 700,
          fontSize: 11,
          letterSpacing: '0.02em',
          color: isUnallocated ? 'var(--text-3)' : 'var(--text-2)',
          fontStyle: isUnallocated ? 'italic' : 'normal',
          textTransform: 'uppercase'
        }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 2, height: 14, background: isUnallocated ? 'var(--border)' : 'var(--vercel-blue)', borderRadius: 2 }} />
          <span>{isUnallocated ? 'Belum dialokasikan' : zoneName}</span>
          {isOrphan && (
            <span title="Zone name not found in settings" style={{ fontSize: 9, opacity: 0.5 }}>[ORPHAN]</span>
          )}
          <div style={{ flex: 1, height: 1, background: 'var(--border)', opacity: 0.5, margin: '0 12px' }} />
          <span style={{ color: 'var(--text)', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
            Rp {(subtotal || 0).toLocaleString('id-ID')}
          </span>
        </div>
      </td>
    </tr>
  )
}

const QuotationCart = memo(function QuotationCart({
  items,
  activeIndex,
  onSetActive,
  onUpdate,
  onCommit,
  onRemove,
  onDuplicate,
  onAddCustom,
  onReorder,
  onRenameSection,
  remoteCursors = {},
  onFocusCell,
  comments = [],
  onComment,
  onEditingKey,
  onSetItemZone,
  zones = []
}) {
  const [activeId, setActiveId] = useState(null)
  const [zoom, setZoom] = useState(1)
  const containerRef = useRef(null)
  const tableRef = useRef(null)

  const handleZoomIn = () => setZoom(prev => Math.min(2, prev + 0.1))
  const handleZoomOut = () => setZoom(prev => Math.max(0.5, prev - 0.1))
  const handleFit = () => {
    if (containerRef.current && tableRef.current) {
      const cw = containerRef.current.clientWidth - 64
      const tw = tableRef.current.scrollWidth
      if (tw > cw) setZoom(cw / tw)
      else setZoom(1)
    }
  }

  // Pre-calculate row-based maps to avoid O(N*M) filtering in the render loop
  const cursorsByRow = useMemo(() => {
    const map = {}
    Object.values(remoteCursors).forEach(c => {
      if (c.rowId) {
        if (!map[c.rowId]) map[c.rowId] = []
        map[c.rowId].push(c)
      }
    })
    return map
  }, [remoteCursors])

  const commentsByRow = useMemo(() => {
    const map = {}
    comments.forEach(c => {
      if (c.row_key) {
        if (!map[c.row_key]) map[c.row_key] = []
        map[c.row_key].push(c)
      }
    })
    return map
  }, [comments])

  const [colWidths, setColWidths] = useState(() => {
    try {
      const saved = localStorage.getItem('juara_quotation_col_widths')
      return saved ? JSON.parse(saved) : {
        zone: 100, item: 580, qty: 70, freq: 70, hpp: 110, tax: 80, margin: 45, sell: 110, subtotal: 120, actions: 70
      }
    } catch {
      return { zone: 100, item: 580, qty: 70, freq: 70, hpp: 110, tax: 80, margin: 45, sell: 110, subtotal: 120, actions: 70 }
    }
  })

  const handleResetLayout = () => {
    const defaults = { zone: 100, item: 580, qty: 70, freq: 70, hpp: 110, tax: 80, margin: 45, sell: 110, subtotal: 120, actions: 70 }
    setColWidths(defaults)
    localStorage.removeItem('juara_quotation_col_widths')
  }

  const [groupBy, setGroupBy] = useState(() => {
    try {
      return localStorage.getItem('quotation_groupby') || 'hybrid'
    } catch { return 'hybrid' }
  })

  const [showFinancials, setShowFinancials] = useState(() => {
    try {
      const saved = localStorage.getItem('quotation_show_financials')
      return saved === null ? true : saved === 'true'
    } catch { return true }
  })

  useEffect(() => {
    try { localStorage.setItem('quotation_groupby', groupBy) } catch { }
  }, [groupBy])

  useEffect(() => {
    try { localStorage.setItem('quotation_show_financials', showFinancials) } catch { }
  }, [showFinancials])

  // --- KEYBOARD NAVIGATION ENGINE ---
  const handleKeyDown = useCallback((e) => {
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

    if (e.altKey && e.key === 'ArrowRight') {
      e.preventDefault()
      const prev = items[row - 1]
      if (prev) {
        onUpdate(items[row]._ratecard_key, {
          parent_id: prev._ratecard_key
        })
      }
    }
    if (e.altKey && e.key === 'ArrowLeft') {
      e.preventDefault()
      onUpdate(items[row]._ratecard_key, { parent_id: null })
    }

    if (e.key === 'Enter') {
      const isArea = e.target.tagName === 'TEXTAREA'
      if (!isArea || e.shiftKey || e.metaKey || e.ctrlKey) {
        if (isArea) e.preventDefault()
        moveFocus(row + 1, col)
      }
    }

    if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
      e.preventDefault()
      const item = items[row]
      if (item) onDuplicate(item)
    }
  }, [items, onUpdate, onDuplicate])


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

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))
  const uniqueSections = useMemo(() => getUniqueSections(items), [items])
  const sectionTotals = useMemo(() => calcAllSectionSellTotals(items), [items])
  const itemIds = useMemo(() => items.map(i => i._ratecard_key), [items])

  const handleDragEnd = ({ active, over }) => {
    setActiveId(null)
    if (!over || active.id === over.id) return

    const oldIdx = items.findIndex(i => i._ratecard_key === active.id)
    const newIdx = items.findIndex(i => i._ratecard_key === over.id)

    const reordered = arrayMove(items, oldIdx, newIdx)

    // --- SMART ADAPTATION ---
    // When moved to a new position, the item should adopt the section of its new neighbor
    const movedItem = reordered[newIdx]
    const neighbor = reordered[newIdx > 0 ? newIdx - 1 : newIdx + 1]

    if (neighbor && (movedItem.section_code !== neighbor.section_code || movedItem.section_name !== neighbor.section_name)) {
      movedItem.section_code = neighbor.section_code
      movedItem.section_name = neighbor.section_name
      // Also adapt category if it's a cross-category move
      movedItem.category = neighbor.category
    }

    onReorder(reordered)
  }

  const handleAddBelow = useCallback((key) => {
    const idx = items.findIndex(i => i._ratecard_key === key)
    const item = items[idx]
    onAddCustom(
      item?.section_code || 'A',
      '',
      idx + 1,
      item?.category,
      item?.sub_category
    )
  }, [items, onAddCustom])

  const itemIndexMap = useMemo(() => {
    const map = {}
    items.forEach((it, idx) => { map[it._ratecard_key] = idx })
    return map
  }, [items])

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
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={e => setActiveId(e.active.id)}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis]}
    >
      <div 
        ref={containerRef}
        style={{
          flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden',
          background: 'var(--bg)', borderRadius: 12, border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)', margin: 0
        }}>
        <CartHeader itemCount={items.length} />
        <GroupByToggle 
          value={groupBy} 
          onChange={setGroupBy} 
          zoom={zoom} 
          onZoomIn={handleZoomIn} 
          onZoomOut={handleZoomOut} 
          onFit={handleFit}
          showFinancials={showFinancials}
          onToggleFinancials={() => setShowFinancials(!showFinancials)}
          onResetLayout={handleResetLayout}
        />

        <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
          <table 
            ref={tableRef}
            className="quotation-table" 
            style={{ 
              width: '100%', borderCollapse: 'collapse', 
              transform: `scale(${zoom})`,
              transformOrigin: 'top left',
              width: zoom < 1 ? `${100/zoom}%` : '100%'
            }}>
            <thead>
              <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                <ColH w={40} center noResize>#</ColH>
                <ColH w={colWidths.zone} onResize={(e) => handleResizeStart(e, 'zone')}>Zone</ColH>
                <ColH w={colWidths.item} onResize={(e) => handleResizeStart(e, 'item')}>Service / Item</ColH>
                <ColH w={colWidths.qty} center onResize={(e) => handleResizeStart(e, 'qty')}>Qty</ColH>
                <ColH w={colWidths.freq} center onResize={(e) => handleResizeStart(e, 'freq')}>Freq</ColH>
                {showFinancials && (
                  <>
                    <ColH w={colWidths.hpp} right onResize={(e) => handleResizeStart(e, 'hpp')}>Cost (HPP)</ColH>
                    <ColH w={colWidths.tax} center onResize={(e) => handleResizeStart(e, 'tax')}>Tax WHT</ColH>
                    <ColH w={colWidths.margin} center onResize={(e) => handleResizeStart(e, 'margin')}>Margin</ColH>
                  </>
                )}
                <ColH w={colWidths.sell} right onResize={(e) => handleResizeStart(e, 'sell')}>Unit Sell</ColH>
                <ColH w={colWidths.subtotal} right onResize={(e) => handleResizeStart(e, 'subtotal')}>Subtotal</ColH>
                <ColH w={colWidths.actions} center noResize />
              </tr>
            </thead>
            <tbody className="quotation-body">
              <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
                {(groupBy === 'pure_section' || (groupBy === 'hybrid' && zones.length === 0)) && (
                  uniqueSections.map(s => {
                    const sec = s.code
                    const secItems = items.filter(i => (i.section_code || i.section || '_') === sec)

                    // Group by subcategory
                    const subGroups = secItems.reduce((acc, item) => {
                      const sub = item.subcategory || item.sub_category || ''
                      if (!acc[sub]) acc[sub] = []
                      acc[sub].push(item)
                      return acc
                    }, {})

                    return (
                      <Fragment key={sec}>
                        <SectionHeaderRow
                          sec={sec}
                          secTotal={sectionTotals[sec] || 0}
                          sectionName={s.name || secItems[0]?.section_name || ''}
                          onAddToSection={() => onAddCustom(sec)}
                          onRenameSection={onRenameSection}
                          showFinancials={showFinancials}
                        />
                        {Object.entries(subGroups).map(([subName, subItems]) => (
                          <Fragment key={`${sec}-${subName}`}>
                            {subName && <SubcategoryHeaderRow name={subName} showFinancials={showFinancials} />}
                            {subItems.map(item => {
                              const globalIdx = itemIndexMap[item._ratecard_key]
                                const rowCursors = cursorsByRow[item._ratecard_key] || []
                                const rowComments = commentsByRow[item._ratecard_key] || []
                                return (
                                  <SortableRow key={item._ratecard_key} id={item._ratecard_key}
                                    item={item} rowIndex={globalIdx}
                                    isActive={activeIndex === globalIdx}
                                    onSetActive={onSetActive}
                                    onUpdate={onUpdate} onCommit={onCommit} onRemove={onRemove}
                                    onDuplicate={onDuplicate}
                                    onAddBelow={() => handleAddBelow(item._ratecard_key)}
                                    onEnterKey={() => handleAddBelow(item._ratecard_key)}
                                    colWidths={colWidths}
                                    onKeyDown={handleKeyDown}
                                    rowCursors={rowCursors}
                                    onFocusCell={onFocusCell}
                                    rowComments={rowComments}
                                    onComment={onComment}
                                    onEditingKey={onEditingKey}
                                    zones={zones}
                                    onSetItemZone={onSetItemZone}
                                    onIndent={(k) => {
                                      const idx = items.findIndex(it => it._ratecard_key === k)
                                      const prev = items[idx - 1]
                                      if (prev) onUpdate(k, { parent_id: prev._ratecard_key })
                                    }}
                                  />
                                )
                            })}
                          </Fragment>
                        ))}
                      </Fragment>
                    )
                  })
                )}

                {groupBy === 'hybrid' && zones.length > 0 && (
                  uniqueSections.map(s => {
                    const sec = s.code
                    const secItems = items.filter(i => (i.section_code || i.section || '_') === sec)
                    const sectionZones = getUniqueZones(secItems, zones)
                    const zoneTotalsInSection = calcAllZoneSellTotals(secItems)

                    return (
                      <Fragment key={sec}>
                        <SectionHeaderRow
                          sec={sec}
                          secTotal={sectionTotals[sec] || 0}
                          sectionName={s.name || secItems[0]?.section_name || ''}
                          onAddToSection={() => onAddCustom(sec)}
                          onRenameSection={onRenameSection}
                        />
                        {sectionZones.map(z => {
                          const zoneItems = secItems.filter(i => (i.zone_name || null) === z.name)
                          if (zoneItems.length === 0) return null
                          return (
                            <Fragment key={`${sec}-${z.name || '_unallocated'}`}>
                              <ZoneHeaderRow
                                zoneName={z.name}
                                subtotal={zoneTotalsInSection[z.name || '_unallocated']}
                                indent={true}
                                isOrphan={z.isOrphan}
                              />
                              {(() => {
                                const subGroups = zoneItems.reduce((acc, item) => {
                                  const sub = item.subcategory || item.sub_category || ''
                                  if (!acc[sub]) acc[sub] = []
                                  acc[sub].push(item)
                                  return acc
                                }, {})
                                return Object.entries(subGroups).map(([subName, subItems]) => (
                                  <Fragment key={`${sec}-${z.name || '_unallocated'}-${subName}`}>
                                    {subName && <SubcategoryHeaderRow name={subName} showFinancials={showFinancials} />}
                                    {subItems.map(item => {
                                      const globalIdx = itemIndexMap[item._ratecard_key]
                                        const rowCursors = cursorsByRow[item._ratecard_key] || []
                                        const rowComments = commentsByRow[item._ratecard_key] || []
                                        return (
                                          <SortableRow key={item._ratecard_key} id={item._ratecard_key}
                                            item={item} rowIndex={globalIdx}
                                            isActive={activeIndex === globalIdx}
                                            onSetActive={onSetActive}
                                            onUpdate={onUpdate} onCommit={onCommit} onRemove={onRemove}
                                            onDuplicate={onDuplicate}
                                            onAddBelow={() => handleAddBelow(item._ratecard_key)}
                                            onEnterKey={() => handleAddBelow(item._ratecard_key)}
                                            colWidths={colWidths}
                                            onKeyDown={handleKeyDown}
                                            rowCursors={rowCursors}
                                            onFocusCell={onFocusCell}
                                            rowComments={rowComments}
                                            onComment={onComment}
                                            onEditingKey={onEditingKey}
                                            zones={zones}
                                            onSetItemZone={onSetItemZone}
                                            onIndent={(k) => {
                                              const idx = items.findIndex(it => it._ratecard_key === k)
                                              const prev = items[idx - 1]
                                              if (prev) onUpdate(k, { parent_id: prev._ratecard_key })
                                            }}
                                            showFinancials={showFinancials}
                                          />
                                        )
                                    })}
                                  </Fragment>
                                ))
                              })()}
                            </Fragment>
                          )
                        })}
                      </Fragment>
                    )
                  })
                )}

                {groupBy === 'pure_zone' && (() => {
                  const allZones = getUniqueZones(items, zones)
                  const zoneTotals = calcAllZoneSellTotals(items)
                  return allZones.map(z => {
                    const zoneItems = items.filter(i => (i.zone_name || null) === z.name)
                    if (zoneItems.length === 0) return null
                    return (
                      <Fragment key={z.name || '_unallocated'}>
                        <ZoneHeaderRow
                          zoneName={z.name}
                          subtotal={zoneTotals[z.name || '_unallocated']}
                          isOrphan={z.isOrphan}
                          showFinancials={showFinancials}
                        />
                        {(() => {
                          const subGroups = zoneItems.reduce((acc, item) => {
                            const sub = item.subcategory || item.sub_category || ''
                            if (!acc[sub]) acc[sub] = []
                            acc[sub].push(item)
                            return acc
                          }, {})
                          return Object.entries(subGroups).map(([subName, subItems]) => (
                            <Fragment key={`${z.name || '_unallocated'}-${subName}`}>
                              {subName && <SubcategoryHeaderRow name={subName} showFinancials={showFinancials} />}
                              {subItems.map(item => {
                                const globalIdx = itemIndexMap[item._ratecard_key]
                                  const rowCursors = cursorsByRow[item._ratecard_key] || []
                                  const rowComments = commentsByRow[item._ratecard_key] || []
                                  return (
                                    <SortableRow key={item._ratecard_key} id={item._ratecard_key}
                                      item={item} rowIndex={globalIdx}
                                      isActive={activeIndex === globalIdx}
                                      onSetActive={onSetActive}
                                      onUpdate={onUpdate} onCommit={onCommit} onRemove={onRemove}
                                      onDuplicate={onDuplicate}
                                      onAddBelow={() => handleAddBelow(item._ratecard_key)}
                                      onEnterKey={() => handleAddBelow(item._ratecard_key)}
                                      colWidths={colWidths}
                                      onKeyDown={handleKeyDown}
                                      rowCursors={rowCursors}
                                      onFocusCell={onFocusCell}
                                      rowComments={rowComments}
                                      onComment={onComment}
                                      onEditingKey={onEditingKey}
                                      zones={zones}
                                      onSetItemZone={onSetItemZone}
                                      onIndent={(k) => {
                                        const idx = items.findIndex(it => it._ratecard_key === k)
                                        const prev = items[idx - 1]
                                        if (prev) onUpdate(k, { parent_id: prev._ratecard_key })
                                      }}
                                    />
                                  )
                              })}
                            </Fragment>
                          ))
                        })()}
                      </Fragment>
                    )
                  })
                })()}
              </SortableContext>
            </tbody>
          </table>
        </div>
        <AddBar onAdd={onAddCustom} />
      </div>

      <DragOverlay
        dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.3' } } }) }}
        style={{ pointerEvents: 'none' }}
      >
        {activeId ? (
          <div style={{ width: '100%', minWidth: 800 }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              tableLayout: 'fixed',
              background: 'var(--surface)',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)',
              border: '1px solid var(--vercel-blue)',
              opacity: 0.9,
              margin: 0
            }}>
              <tbody>
                <tr>
                  <ItemRowCells
                    item={items.find(i => i._ratecard_key === activeId)}
                    rowIndex={items.findIndex(i => i._ratecard_key === activeId)}
                    dragHandleProps={{}}
                    colWidths={colWidths}
                    masterZones={[]}
                    onUpdate={() => { }}
                    onCommit={() => { }}
                    onRemove={() => { }}
                    onDuplicate={() => { }}
                    onAddBelow={() => { }}
                    onEnterKey={() => { }}
                    onKeyDown={() => { }}
                    items={items}
                    zones={zones}
                    onSetItemZone={() => { }}
                  />
                </tr>
              </tbody>
            </table>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
})

const CartHeader = memo(function CartHeader({ itemCount }) {
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
})
export default QuotationCart
