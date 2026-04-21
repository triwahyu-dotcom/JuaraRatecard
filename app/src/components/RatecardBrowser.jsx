import { useState, useEffect } from 'react'
import { getAllRatecardItems } from '../lib/ratecardRepo'
import { fmtRp } from '../utils/fmt'
import { MASTER_CATEGORIES, CATEGORY_COLORS } from '../utils/constants'
import { ITEM_BUNDLES } from '../data/bundles'

export default function RatecardBrowser({ selectedItems, onAdd, onRemove, onAddBulk, onAddBundle }) {
  const [ratecard, setRatecard] = useState([])
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('ALL')
  const [viewMode, setViewMode] = useState('ITEMS') // 'ITEMS' | 'PACKAGES'

  useEffect(() => {
    getAllRatecardItems().then(setRatecard)
  }, [])

  const categoriesList = ['ALL', ...MASTER_CATEGORIES]

  const filtered = ratecard.filter(item => {
    const matchCategory = activeCategory === 'ALL' || item.section_name === activeCategory
    const q = search.toLowerCase()
    const matchSearch = !q ||
      item.item_name?.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q)
    return matchCategory && matchSearch
  })

  const filteredBundles = ITEM_BUNDLES.filter(b => {
    const q = search.toLowerCase()
    return !q || b.name.toLowerCase().includes(q) || b.description.toLowerCase().includes(q)
  })

  const isSelected = (item) => selectedItems.some(
    s => s.item_code === item.item_code
  )

  const grouped = filtered.reduce((acc, item) => {
    const key = `${item.section_name}||${item.category}`
    if (!acc[key]) acc[key] = { 
      section_name: item.section_name, 
      category: item.category, 
      items: [] 
    }
    acc[key].items.push(item)
    return acc
  }, {})

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, height: '100%' }}>
      {/* View Mode Switcher */}
      <div style={{ 
        display: 'flex', background: 'var(--surface-2)', padding: 4, borderRadius: 10,
        gap: 4
      }}>
        <button 
          onClick={() => setViewMode('ITEMS')}
          style={{
            flex: 1, padding: '8px 0', borderRadius: 8, fontSize: 12, fontWeight: 700,
            background: viewMode === 'ITEMS' ? 'var(--bg)' : 'transparent',
            color: viewMode === 'ITEMS' ? 'var(--text)' : 'var(--text-3)',
            border: 'none', cursor: 'pointer', transition: 'all 0.2s'
          }}>
          All Items
        </button>
        <button 
          onClick={() => setViewMode('PACKAGES')}
          style={{
            flex: 1, padding: '8px 0', borderRadius: 8, fontSize: 12, fontWeight: 700,
            background: viewMode === 'PACKAGES' ? 'var(--bg)' : 'transparent',
            color: viewMode === 'PACKAGES' ? 'var(--text)' : 'var(--text-3)',
            border: 'none', cursor: 'pointer', transition: 'all 0.2s'
          }}>
          Packages <span style={{ opacity: 0.5, marginLeft: 4 }}>📦</span>
        </button>
      </div>

      {/* Search + Section Filter */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
          <input
            className="form-input"
            style={{ width: '100%', paddingLeft: 40, height: 42 }}
            placeholder={viewMode === 'ITEMS' ? "Search items..." : "Search packages..."}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        
        {viewMode === 'ITEMS' && (
          <div style={{ 
            display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 8,
            scrollbarWidth: 'none', msOverflowStyle: 'none'
          }} className="no-scrollbar">
            {categoriesList.map(c => (
              <button key={c} onClick={() => setActiveCategory(c)}
                style={{
                  padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                  border: '1px solid transparent',
                  whiteSpace: 'nowrap',
                  background: activeCategory === c ? 'var(--text)' : 'transparent',
                  color: activeCategory === c ? 'var(--bg)' : 'var(--text-3)',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}>
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content Area */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, flex: 1, overflowY: 'auto', paddingRight: 4 }}>
        {viewMode === 'ITEMS' ? (
          Object.values(grouped).map(group => (
            <div key={`${group.section_name}-${group.category}`}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                paddingBottom: 8, borderBottom: '1px solid var(--border)', marginBottom: 12
              }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {group.section_name} <span style={{ opacity: 0.3 }}>/</span> {group.category}
                </span>
                <div style={{ flex: 1 }} />
                {onAddBulk && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onAddBulk(group.items) }}
                    className="btn btn-surface" 
                    style={{ 
                      padding: '2px 8px', height: 20, fontSize: 9, 
                      fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4,
                      color: 'var(--vercel-blue)'
                    }}>
                    <span>+</span> Add Category
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {group.items.map((item, idx) => {
                  const selected = isSelected(item)
                  const hasPrice = item.unit_price !== null && item.unit_price > 0
                  
                  return (
                    <div key={idx}
                      onClick={() => selected ? onRemove(item.item_code) : onAdd(item)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                        background: selected ? 'var(--surface)' : 'transparent',
                        transition: 'all 0.15s',
                      }} className="rc-item">
                      <div style={{
                        width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                        border: `1px solid ${selected ? 'var(--text)' : 'var(--border-2)'}`,
                        background: selected ? 'var(--text)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, color: 'var(--bg)',
                      }}>{selected ? '✓' : ''}</div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: selected ? 'var(--text)' : 'var(--text-2)' }}>
                          {item.item_name}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>
                          {fmtRp(item.unit_price || 0)} per {item.default_unit}
                        </div>
                      </div>
                      {!hasPrice && <span className="badge badge-yellow" style={{ fontSize: 8 }}>TBD</span>}
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredBundles.map(bundle => (
              <div key={bundle.id} style={{
                padding: 16, borderRadius: 12, border: '1px solid var(--border)',
                background: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: 8
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{bundle.name}</div>
                  <button 
                    onClick={() => onAddBundle(bundle)}
                    className="btn btn-primary" style={{ padding: '4px 12px', height: 28, fontSize: 11 }}>
                    + Add Bundle
                  </button>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.4 }}>{bundle.description}</div>
                <div style={{ 
                  marginTop: 4, padding: 8, background: 'var(--bg)', borderRadius: 6,
                  display: 'flex', flexDirection: 'column', gap: 4
                }}>
                  {bundle.items.slice(0, 3).map((bi, i) => (
                    <div key={i} style={{ fontSize: 10, color: 'var(--text-2)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>• {bi.note || bi.item_code}</span>
                      <span style={{ opacity: 0.5 }}>{bi.quantity}x</span>
                    </div>
                  ))}
                  {bundle.items.length > 3 && (
                    <div style={{ fontSize: 9, opacity: 0.5, textAlign: 'center' }}>+ {bundle.items.length - 3} more items</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {((viewMode === 'ITEMS' && filtered.length === 0) || (viewMode === 'PACKAGES' && filteredBundles.length === 0)) && (
          <div style={{ paddingTop: 40, textAlign: 'center', color: 'var(--text-3)' }}>
            <p style={{ fontSize: 13 }}>No matches found</p>
          </div>
        )}
      </div>
    </div>
  )
}

