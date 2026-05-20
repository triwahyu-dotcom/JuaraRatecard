import { useState } from 'react'
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { fmtRp } from '../utils/fmt'
import { MASTER_CATEGORIES, CATEGORY_COLORS } from '../utils/constants'

export default function RatecardBrowser({ 
  selectedItems = [], 
  onAdd, 
  onRemove, 
  onAddBulk, 
  onAddBundle,
  zoneManagerContent
}) {
  const ratecard = useQuery(api.masterData.listItems) || [];
  const bundles = useQuery(api.masterData.listBundles) || [];
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('ALL')
  const [viewMode, setViewMode] = useState('ITEMS') // 'ITEMS' | 'ZONES' | 'PACKAGES'

  const categoriesList = ['ALL', ...MASTER_CATEGORIES]

  const filtered = ratecard.filter(item => {
    const matchCategory = activeCategory === 'ALL' || item.category === activeCategory
    const q = search.toLowerCase()
    const matchSearch = !q ||
      item.item_name?.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q) ||
      item.remarks?.toLowerCase().includes(q)
    return matchCategory && matchSearch
  })

  const filteredBundles = bundles.filter(b => {
    const q = search.toLowerCase()
    return !q || b.name.toLowerCase().includes(q) || b.description.toLowerCase().includes(q)
  })

  const isSelected = (item) => selectedItems.some(
    s => s.item_code === item.item_code
  )

  const grouped = filtered.reduce((acc, item) => {
    const key = `${item.category}||${item.sub_category || ''}`
    if (!acc[key]) acc[key] = { 
      category: item.category, 
      subcategory: item.sub_category || '', 
      items: [] 
    }
    acc[key].items.push(item)
    return acc
  }, {})

  const [collapsedGroups, setCollapsedGroups] = useState({})

  const toggleGroup = (key) => {
    setCollapsedGroups(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Sticky Header Section */}
      <div style={{ 
        display: 'flex', flexDirection: 'column', gap: 16, flexShrink: 0,
        background: 'var(--bg)', paddingBottom: 16, zIndex: 5,
        position: 'sticky', top: 0
      }}>
        {/* View Mode Switcher */}
        <div style={{ 
          display: 'flex', background: 'var(--surface-2)', padding: 4, borderRadius: 10,
          gap: 4
        }}>
          <button 
            onClick={() => setViewMode('ITEMS')}
            style={{
              flex: 1, padding: '8px 0', borderRadius: 8, fontSize: 11, fontWeight: 700,
              background: viewMode === 'ITEMS' ? 'var(--bg)' : 'transparent',
              color: viewMode === 'ITEMS' ? 'var(--text)' : 'var(--text-3)',
              border: 'none', cursor: 'pointer', transition: 'all 0.2s'
            }}>
            Items
          </button>
          <button 
            onClick={() => setViewMode('ZONES')}
            style={{
              flex: 1, padding: '8px 0', borderRadius: 8, fontSize: 11, fontWeight: 700,
              background: viewMode === 'ZONES' ? 'var(--bg)' : 'transparent',
              color: viewMode === 'ZONES' ? 'var(--text)' : 'var(--text-3)',
              border: 'none', cursor: 'pointer', transition: 'all 0.2s'
            }}>
            Zones
          </button>
        </div>

        {/* Search + Section Filter (Only for Items/Packages) */}
        {viewMode !== 'ZONES' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ position: 'relative' }}>
              <input
                className="form-input"
                style={{ width: '100%', paddingLeft: 36, height: 36, fontSize: 13 }}
                placeholder={viewMode === 'ITEMS' ? "Search items..." : "Search packages..."}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            
            {viewMode === 'ITEMS' && (
              <div style={{ 
                display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 4,
                scrollbarWidth: 'none'
              }}>
                {categoriesList.map(c => (
                  <button key={c} onClick={() => setActiveCategory(c)}
                    style={{
                      padding: '4px 10px', borderRadius: 6, fontSize: 10, fontWeight: 600,
                      border: '1px solid transparent',
                      whiteSpace: 'nowrap',
                      background: activeCategory === c ? 'var(--text)' : 'var(--surface)',
                      color: activeCategory === c ? 'var(--bg)' : 'var(--text-2)',
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}>
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content Area */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, overflowY: 'auto', paddingRight: 4 }}>
        {viewMode === 'ITEMS' ? (
          Object.entries(grouped).map(([key, group]) => {
            const isCollapsed = collapsedGroups[key]
            return (
              <div key={key} style={{ 
                background: 'rgba(255,255,255,0.02)', 
                borderRadius: 12, 
                border: '1px solid var(--border)',
                overflow: 'hidden'
              }}>
                <div 
                  onClick={() => toggleGroup(key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 12px', background: 'var(--surface)',
                    cursor: 'pointer', borderBottom: isCollapsed ? 'none' : '1px solid var(--border)'
                  }}>
                  <span style={{ fontSize: 10, opacity: 0.5 }}>{isCollapsed ? '▶' : '▼'}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {group.subcategory}
                  </span>
                  <span style={{ fontSize: 9, color: 'var(--text-3)' }}>({group.items.length})</span>
                  <div style={{ flex: 1 }} />
                  {onAddBulk && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); onAddBulk(group.items) }}
                      className="btn btn-ghost" 
                      style={{ 
                        padding: '2px 6px', height: 18, fontSize: 8, 
                        fontWeight: 700, borderRadius: 4, background: 'rgba(255,255,255,0.05)'
                      }}>
                      Add All
                    </button>
                  )}
                </div>

                {!isCollapsed && (
                  <div style={{ display: 'flex', flexDirection: 'column', padding: '4px 0' }}>
                    {group.items.map((item, idx) => {
                      const selected = isSelected(item)
                      const hasPrice = item.unit_sell !== null && item.unit_sell > 0
                      
                      return (
                        <div key={idx}
                          onClick={() => onAdd(item)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '8px 12px', cursor: 'pointer',
                            transition: 'all 0.15s',
                          }} className="rc-item">
                          <div style={{
                            width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                            border: '1px solid var(--border-2)',
                            background: 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 12, color: 'var(--text-3)',
                            fontWeight: 800,
                          }}>+</div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 500, color: selected ? 'var(--text)' : 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 6 }}>
                              {item.item_name}
                            </div>
                            {item.remarks && (
                              <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2, fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {item.remarks}
                              </div>
                            )}
                            <div style={{ fontSize: 9, color: 'var(--text-3)', marginTop: 1 }}>
                              {fmtRp(item.unit_sell || 0)} per {item.unit || 'unit'}
                            </div>
                          </div>
                          {!hasPrice && <span className="badge badge-yellow" style={{ fontSize: 7, padding: '1px 4px' }}>TBD</span>}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })
        ) : viewMode === 'ZONES' ? (
          <div style={{ marginTop: -16 }}>
            {zoneManagerContent}
          </div>
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
                    Add Bundle
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

