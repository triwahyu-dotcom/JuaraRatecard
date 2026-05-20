import React, { useState, useEffect } from 'react'
import { calcLineSell } from '../utils/calc'
import { fmt } from '../utils/fmt'
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const TD_STYLE = {
  padding: '0',
  borderBottom: '1px solid var(--border)',
  borderRight: '1px solid var(--border)',
  verticalAlign: 'middle',
  fontSize: 12,
}

const TH_STYLE = {
  padding: '8px 10px',
  borderBottom: '2px solid var(--border)',
  borderRight: '1px solid var(--border)',
  fontSize: 11,
  fontWeight: 700,
  textAlign: 'left',
  background: 'var(--surface-2)',
  color: 'var(--text-2)',
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  position: 'sticky',
  top: 0,
  zIndex: 10,
}

function CellInput({ value, onChange, onBlur, type = 'text', align = 'left', style = {}, ...props }) {
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
    <input
      type={type}
      value={localValue ?? ''}
      onChange={e => setLocalValue(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={handleBlur}
      onKeyDown={e => {
        if (e.key === 'Enter') {
          handleBlur()
          e.currentTarget.blur()
        }
      }}
      style={{
        width: '100%', height: 34, padding: '0 8px',
        background: 'transparent', border: 'none', outline: 'none',
        fontSize: 12, color: 'var(--text)', textAlign: align,
        fontFamily: align === 'right' ? 'var(--font-mono, monospace)' : 'inherit',
        ...style,
      }}
      {...props}
    />
  )
}

function AutocompleteCell({ value, onChange, onSelect, placeholder = '', style = {}, onBlur, onFocus }) {
  const [focused, setFocused] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const ratecard = useQuery(api.masterData.listItems) || []
  
  const suggestions = value && focused ? ratecard.filter(item => 
    item.item_name?.toLowerCase().includes(value.toLowerCase()) ||
    item.item_code?.toLowerCase().includes(value.toLowerCase())
  ).slice(0, 10) : []

  useEffect(() => {
    if (selectedIndex >= suggestions.length) setSelectedIndex(0)
  }, [suggestions.length])

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev + 1) % suggestions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (suggestions[selectedIndex]) {
        onSelect(suggestions[selectedIndex])
        setShowSuggestions(false)
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        value={value || ''}
        placeholder={placeholder}
        onChange={e => {
          onChange(e.target.value)
          setShowSuggestions(true)
          setSelectedIndex(0)
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => { 
          setFocused(true)
          setShowSuggestions(true)
          onFocus?.() 
        }}
        onBlur={() => { 
          setFocused(false)
          // Delayed hide to allow clicking suggestions
          setTimeout(() => setShowSuggestions(false), 200)
          onBlur?.() 
        }}
        autoComplete="off"
        style={{
          width: '100%', height: 34, padding: '0 8px',
          background: 'transparent', border: 'none', outline: 'none',
          fontSize: 12, color: 'var(--text)',
          ...style,
        }}
      />
      {showSuggestions && suggestions.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, width: 320,
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 10, boxShadow: 'var(--shadow-lg)', zIndex: 1000,
          marginTop: 6, overflow: 'hidden', padding: 4,
          backdropFilter: 'blur(10px)', animation: 'slideDown 0.2s ease'
        }}>
          {suggestions.map((s, idx) => (
            <div 
              key={s._id}
              onClick={() => {
                onSelect(s)
                setShowSuggestions(false)
              }}
              onMouseEnter={() => setSelectedIndex(idx)}
              style={{
                padding: '10px 12px', fontSize: 11, cursor: 'pointer',
                borderRadius: 6,
                background: selectedIndex === idx ? 'var(--accent)' : 'transparent',
                color: selectedIndex === idx ? 'white' : 'var(--text)',
                display: 'flex', flexDirection: 'column', gap: 2,
                transition: 'all 0.1s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700 }}>{s.item_name}</span>
                <span style={{ fontSize: 9, opacity: selectedIndex === idx ? 0.8 : 0.5 }}>{s.item_code}</span>
              </div>
              <div style={{ 
                fontSize: 10, 
                color: selectedIndex === idx ? 'rgba(255,255,255,0.8)' : 'var(--text-3)', 
                display: 'flex', justifyContent: 'space-between' 
              }}>
                <span>{s.category}</span>
                <span style={{ fontWeight: 700 }}>Rp {s.unit_sell?.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

function ItemRow({ item, rowNum, onUpdate, onRemove, onDuplicate, onAddBelow }) {
  const sell = calcLineSell(item)
  const [hovered, setHovered] = useState(false)

  return (
    <tr
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ background: hovered ? 'var(--surface)' : 'transparent', transition: 'background 0.05s' }}
    >
      <td style={{ ...TD_STYLE, width: 40, textAlign: 'center', color: 'var(--text-4)', fontSize: 10, background: 'var(--bg)' }}>
        {rowNum}
      </td>
      <td style={{ ...TD_STYLE, minWidth: 250 }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <AutocompleteCell
            value={item.item_name || ''}
            onChange={v => onUpdate({ item_name: v })}
            onSelect={s => {
              onUpdate({
                item_name: s.item_name,
                specification: s.specification,
                unit_sell: s.unit_sell,
                category: s.category,
                sub_category: s.sub_category,
                item_code: s.item_code,
                unit_cost: s.unit_cost
              })
            }}
            placeholder="Item Name"
          />
          <input
            value={item.category || ''}
            onChange={e => onUpdate({ category: e.target.value })}
            placeholder="Category..."
            style={{
              fontSize: 10, color: 'var(--text-4)', background: 'transparent',
              border: 'none', outline: 'none', padding: '0 8px', marginTop: -4,
              height: 14, fontStyle: 'italic'
            }}
          />
        </div>
      </td>
      <td style={{ ...TD_STYLE, minWidth: 180 }}>
        <CellInput
          value={item.specification || ''}
          onChange={v => onUpdate({ specification: v })}
          placeholder="Specification"
          style={{ color: 'var(--text-3)', fontSize: 11 }}
        />
      </td>
      <td style={{ ...TD_STYLE, width: 70 }}>
        <CellInput
          type="number"
          value={item.qty || ''}
          onChange={v => onUpdate({ qty: v })}
          align="right"
        />
      </td>
      <td style={{ ...TD_STYLE, width: 70 }}>
        <CellInput
          type="number"
          value={item.frequency_qty || ''}
          onChange={v => onUpdate({ frequency_qty: v })}
          align="right"
        />
      </td>
      <td style={{ ...TD_STYLE, width: 140 }}>
        <CellInput
          type="number"
          value={item.unit_sell || ''}
          onChange={v => onUpdate({ unit_sell: v })}
          align="right"
        />
      </td>
      <td style={{ ...TD_STYLE, width: 140, textAlign: 'right', padding: '0 12px', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
        {fmt(sell)}
      </td>
      <td style={{ ...TD_STYLE, width: 80, borderRight: 'none', textAlign: 'center' }}>
        {hovered && (
          <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
            <button onClick={onAddBelow} title="Add below" style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: 14 }}>+</button>
            <button onClick={onDuplicate} title="Duplicate" style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: 12 }}>⎘</button>
            <button onClick={onRemove} title="Delete" style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--red)', fontSize: 14 }}>×</button>
          </div>
        )}
      </td>
    </tr>
  )
}

function SectionHeaderInput({ sCode, initialName, onRename }) {
  const [val, setVal] = useState(initialName)
  useEffect(() => { setVal(initialName) }, [initialName])
  const handleCommit = () => { if (val !== initialName) onRename(sCode, val) }

  return (
    <input
      value={val || ''}
      onChange={e => setVal(e.target.value)}
      onBlur={handleCommit}
      onKeyDown={e => e.key === 'Enter' && handleCommit()}
      style={{
        fontSize: 12, fontWeight: 700, color: 'var(--text)', 
        textTransform: 'uppercase', letterSpacing: '0.02em',
        background: 'transparent', border: 'none', outline: 'none',
        width: 'auto', flex: 1
      }}
      placeholder="Enter Section Name..."
    />
  )
}

export default function SimpleTableView({ items, onUpdate, onRemove, onDuplicate, onAddCustom, onRenameSection }) {
  // Hierarchy: Section -> Category
  const sections = {}
  items.forEach(item => {
    const sCode = item.section_code || 'A'
    const sName = item.section_name || 'Unsectioned'
    if (!sections[sCode]) sections[sCode] = { name: sName, categories: {} }
    
    const cat = item.category || 'Uncategorized'
    if (!sections[sCode].categories[cat]) sections[sCode].categories[cat] = []
    sections[sCode].categories[cat].push(item)
  })

  const grandTotal = items.reduce((s, i) => s + calcLineSell(i), 0)
  let rowNum = 1

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflow: 'hidden' }}>
      {/* Header Info */}
      <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface)' }}>
        <div style={{ display: 'flex', gap: 20 }}>
          <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase' }}>Items: {items.length}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600 }}>GRAND TOTAL</span>
          <span style={{ fontSize: 18, fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>{fmt(grandTotal)}</span>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <thead>
            <tr>
              <th style={{ ...TH_STYLE, width: 40, textAlign: 'center' }}>#</th>
              <th style={{ ...TH_STYLE, width: 'auto' }}>Item / Description</th>
              <th style={{ ...TH_STYLE, width: 220 }}>Specification</th>
              <th style={{ ...TH_STYLE, width: 70, textAlign: 'right' }}>Qty</th>
              <th style={{ ...TH_STYLE, width: 70, textAlign: 'right' }}>Freq</th>
              <th style={{ ...TH_STYLE, width: 140, textAlign: 'right' }}>Unit Price</th>
              <th style={{ ...TH_STYLE, width: 140, textAlign: 'right' }}>Amount</th>
              <th style={{ ...TH_STYLE, width: 80, borderRight: 'none' }}></th>
            </tr>
          </thead>
          
          {Object.entries(sections).sort().map(([sCode, section]) => (
            <tbody key={sCode}>
              {/* Section Header */}
              <tr style={{ background: 'var(--bg-2)' }}>
                <td colSpan={8} style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', borderTop: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-4)' }}>{sCode}</span>
                    <SectionHeaderInput 
                      sCode={sCode} 
                      initialName={section.name} 
                      onRename={onRenameSection} 
                    />
                  </div>
                </td>
              </tr>

              {Object.entries(section.categories).map(([catName, catItems]) => {
                const catTotal = catItems.reduce((s, i) => s + calcLineSell(i), 0)
                return (
                  <React.Fragment key={catName}>
                    {/* Category Header */}
                    <tr style={{ background: 'var(--surface)' }}>
                      <td style={{ ...TD_STYLE, background: 'var(--bg)' }}></td>
                      <td colSpan={5} style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase' }}>{catName}</span>
                      </td>
                      <td style={{ ...TD_STYLE, textAlign: 'right', padding: '0 12px', color: 'var(--text-3)', fontSize: 11 }}>
                        {fmt(catTotal)}
                      </td>
                      <td style={{ ...TD_STYLE, borderRight: 'none' }}></td>
                    </tr>

                    {/* Items */}
                    {catItems.map(item => (
                      <ItemRow
                        key={item._ratecard_key}
                        item={item}
                        rowNum={rowNum++}
                        onUpdate={(updates) => onUpdate(item._ratecard_key, updates)}
                        onRemove={() => onRemove(item._ratecard_key)}
                        onDuplicate={() => onDuplicate(item)}
                        onAddBelow={() => {
                          const idx = items.findIndex(i => i._ratecard_key === item._ratecard_key)
                          onAddCustom(sCode, '', idx + 1, catName === 'Uncategorized' ? undefined : catName)
                        }}
                      />
                    ))}
                    
                    {/* Add Item in Category */}
                    <tr>
                      <td style={{ ...TD_STYLE, background: 'var(--bg)' }}></td>
                      <td colSpan={7} style={{ padding: 0, borderBottom: '1px solid var(--border)' }}>
                        <button 
                          onClick={() => onAddCustom(sCode, '', items.length, catName === 'Uncategorized' ? undefined : catName)}
                          style={{ width: '100%', padding: '6px 12px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'var(--text-4)' }}
                          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-2)'}
                          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-4)'}
                        >
                          + Add item to {catName}
                        </button>
                      </td>
                    </tr>
                  </React.Fragment>
                )
              })}
            </tbody>
          ))}

          {/* Add Section Button */}
          <tbody>
            <tr>
              <td colSpan={8} style={{ padding: '20px' }}>
                <button 
                  onClick={() => {
                    const name = prompt('New Section Name:')
                    if (name) onAddCustom(String.fromCharCode(65 + Object.keys(sections).length), '', items.length, undefined)
                  }}
                  className="btn btn-ghost" style={{ width: '100%', border: '1px dashed var(--border)' }}
                >
                  + Add New Section
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

