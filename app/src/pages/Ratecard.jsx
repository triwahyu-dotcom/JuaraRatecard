import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import * as XLSX from 'xlsx'
import { ITEM_BUNDLES } from '../data/bundles'

// Utility to generate consistent pastel colors for random section codes
// Utility to generate vibrant, readable colors for dark mode (HSL 70-85% Lightness)
function getColorForSection(str) {
  if (!str) return '#888888';
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Hue 0-360, Saturation 70%, Lightness 75%
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 75%, 75%)`;
}

function SectionBadge({ code }) {
  const color = getColorForSection(code?.charAt(0));
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      minWidth: 22, height: 22, padding: '0 6px', borderRadius: 6, fontSize: 11, fontWeight: 800,
      background: color + '22', color: color,
      border: `1px solid ${color}44`,
    }}>{code || '?'}</span>
  )
}

function CellInput({ value, onChange, onBlur, onKeyDown, type="text", placeholder="", style={}, inputMode }) {
  return (
    <input 
      type={type} 
      value={value ?? ''} 
      onChange={e => onChange(e.target.value)}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      inputMode={inputMode}
      style={{
        width: '100%',
        background: 'transparent', border: '1px solid transparent',
        padding: '6px 8px', margin: '-6px -8px', borderRadius: 6,
        fontSize: 'inherit', color: 'inherit', fontWeight: 'inherit',
        outline: 'none', transition: 'background 0.1s, border 0.1s',
        ...style
      }}
      onFocus={e => {
        e.target.style.background = 'var(--surface-2)';
        e.target.style.border = '1px solid var(--border)';
      }}
      onMouseLeave={e => {
        if (document.activeElement !== e.target) {
          e.target.style.background = 'transparent';
          e.target.style.border = '1px solid transparent';
        }
      }}
    />
  )
}

function fmtNum(v) {
  if (v === null || v === undefined || v === '') return '';
  const num = Number(v);
  if (isNaN(num)) return v;
  return new Intl.NumberFormat('id-ID').format(num);
}

function NumCellInput({ value, onChange, onBlur, onKeyDown, placeholder="", style={} }) {
  return (
    <input 
      type="text" 
      value={fmtNum(value)} 
      onChange={e => {
        const raw = e.target.value.replace(/\./g, '');
        onChange(raw === '' ? null : (isNaN(Number(raw)) ? raw : Number(raw)));
      }}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      style={{
        width: '100%',
        background: 'transparent', border: '1px solid transparent',
        padding: '6px 8px', margin: '-6px -8px', borderRadius: 6,
        fontSize: 'inherit', color: 'inherit', fontWeight: 'inherit',
        outline: 'none', transition: 'background 0.1s, border 0.1s',
        ...style
      }}
      onFocus={e => {
        e.target.style.background = 'var(--surface-2)';
        e.target.style.border = '1px solid var(--border)';
      }}
      onMouseLeave={e => {
        if (document.activeElement !== e.target) {
          e.target.style.background = 'transparent';
          e.target.style.border = '1px solid transparent';
        }
      }}
    />
  )
}

/* ── Column Header with Resizer ── */
const ColH = ({ children, w, onResize, noResize }) => (
  <th style={{ 
    width: w, padding: '12px 14px', textAlign: 'left', background: 'var(--surface)', 
    fontSize: 11, fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', 
    letterSpacing: '0.05em', borderBottom: '1px solid var(--border)', cursor: 'default',
    position: 'relative'
  }}>
    {children}
    {!noResize && (
      <div 
        onMouseDown={onResize}
        style={{ 
          position: 'absolute', right: 0, top: 0, bottom: 0, width: 4, 
          cursor: 'col-resize', transition: 'background 0.2s',
          zIndex: 5
        }} 
        className="resizer"
      />
    )}
    <style>{`.resizer:hover { background: var(--text-3); }`}</style>
  </th>
)

export default function Ratecard() {
  const items = useQuery(api.masterData.listItems) || []
  const createItemMutation = useMutation(api.masterData.createItem)
  const updateItemMutation = useMutation(api.masterData.updateItem)
  const removeItemMutation = useMutation(api.masterData.removeItem)
  
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [filterSection, setFilterSection] = useState('ALL')
  const [filterPriced, setFilterPriced] = useState('ALL')
  const [sortBy, setSortBy] = useState('section')

  // Stats & Dynamic Sections
  const stats = useMemo(() => {
    const total = items.length
    const priced = items.filter(i => i.unit_sell != null && i.unit_sell > 0).length
    const sections = [...new Set(items.map(i => i.category))].sort()
    return { total, priced, tbd: total - priced, sections }
  }, [items])

  // Filtered + sorted items
  const filtered = useMemo(() => {
    let list = items
    if (filterSection !== 'ALL') list = list.filter(i => i.category === filterSection)
    if (filterPriced === 'PRICED') list = list.filter(i => i.unit_sell > 0)
    if (filterPriced === 'TBD') list = list.filter(i => !i.unit_sell)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(i =>
        i.item_name?.toLowerCase().includes(q) ||
        i.sub_category?.toLowerCase().includes(q) ||
        i.remarks?.toLowerCase().includes(q)
      )
    }
    // Sort
    list = [...list].sort((a, b) => {
      if (sortBy === 'section') return (a.category || '').localeCompare(b.category || '') || (a.sub_category || '').localeCompare(b.sub_category || '')
      if (sortBy === 'price_asc') return (a.unit_sell || 0) - (b.unit_sell || 0)
      if (sortBy === 'price_desc') return (b.unit_sell || 0) - (a.unit_sell || 0)
      if (sortBy === 'name') return (a.item_name || '').localeCompare(b.item_name || '')
      return 0
    })
    return list
  }, [items, filterSection, filterPriced, search, sortBy])

  // Grouped by section → category
  const grouped = useMemo(() => {
    const g = {}
    filtered.forEach(item => {
      const sk = item.category || 'Uncategorized'
      const ck = item.sub_category || 'General'
      if (!g[sk]) g[sk] = { section: item.category, section_name: item.category, categories: {} }
      if (!g[sk].categories[ck]) g[sk].categories[ck] = []
      g[sk].categories[ck].push(item)
    })
    return g
  }, [filtered])

  // ── Database Actions ──
  const handleUpdate = async (id, field, value) => {
    await updateItemMutation({ id, updates: { [field]: value } })
  }

  const handleDelete = async (item) => {
    if (!confirm(`Hapus baris "${item.item_name}"?`)) return
    await removeItemMutation({ id: item._id })
  }

  const handleCreate = async (newItem) => {
    await createItemMutation(newItem)
    setSearch('')
    setFilterSection('ALL')
    setFilterPriced('ALL')
    alert(`Success! "${newItem.item_name}" has been added to catalog.`)
  }

  const handleDuplicate = async (item) => {
    const { _id, _creationTime, ...rest } = item
    await createItemMutation({
      ...rest,
      item_name: `${item.item_name} (Copy)`
    })
  }

  const handleSectionRename = async (oldCode, newCode, newName) => {
    if (!newCode) return;
    await renameSection(oldCode, newCode, newName);
    load();
  }

  const handleReset = async () => {
    if (!confirm('Reset semua data ratecard ke default? Semua perubahan akan hilang.')) return
    await resetToDefault()
    load()
  }

  const handleExport = async () => {
    const data = await exportRatecardJSON()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ratecard-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
  }

  const handleExportExcel = () => {
    const exportData = items.map(item => ({
      'SECTION': item.section,
      'SUB CATEGORY': item.sub_category || 'General',
      'ITEM NAME': item.item_name,
      'SPECIFICATION': item.remarks || '',
      'QTY UNIT': item.unit,
      'PRICE': item.unit_sell || 0,
      'COA': item.coa_code || ''
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ratecard");
    XLSX.writeFile(wb, `Ratecard_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);

      if (confirm(`Import ${data.length} items dari Excel? Data akan ditambahkan ke katalog saat ini.`)) {
        setLoading(true);
        try {
          for (const row of data) {
            const newItem = {
              section: row['SECTION'] || 'Other',
              section_name: row['SECTION'] || 'Other',
              category: row['SECTION'] || 'Other',
              sub_category: row['SUB CATEGORY'] || 'General',
              item_name: row['ITEM NAME'],
              remarks: row['SPECIFICATION'] || '',
              unit: row['QTY UNIT'] || 'unit',
              unit_cost: 0,
              unit_sell: row['PRICE'] || 0,
              updated_at: new Date().toISOString()
            };
            if (newItem.item_name) {
              await createItemMutation(newItem);
            }
          }
          alert('Import selesai!');
        } catch (err) {
          console.error(err);
          alert('Terjadi kesalahan saat import.');
        } finally {
          setLoading(false);
        }
      }
    };
    reader.readAsBinaryString(file);
    // Reset input so same file can be picked again
    e.target.value = '';
  };

  const handleExportBundles = () => {
    const exportData = [];
    ITEM_BUNDLES.forEach(bundle => {
      bundle.items.forEach(item => {
        exportData.push({
          'PAKET ID': bundle.id,
          'NAMA PAKET': bundle.name,
          'DESKRIPSI PAKET': bundle.description,
          'ITEM CODE': item.item_code,
          'ITEM NAME': item.item_name || '',
          'QTY': item.quantity,
          'NOTE': item.remarks || ''
        });
      });
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Paket_Item");
    XLSX.writeFile(wb, `Paket_Item_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const [colWidths, setColWidths] = useState({
    sec: 60,
    cat: 150,
    item: 300,
    vendor: 150,
    desc: 300,
    vol: 120,
    hpp: 130,
    sell: 130,
    coa: 80,
    actions: 60
  })

  // Resize logic
  const resizingCol = useRef(null)
  const startX = useRef(0)
  const startWidth = useRef(0)

  const handleResizeStart = (e, col) => {
    resizingCol.current = col
    startX.current = e.clientX
    startWidth.current = colWidths[col]
    document.addEventListener('mousemove', handleResizeMove)
    document.addEventListener('mouseup', handleResizeEnd)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  const handleResizeMove = (e) => {
    if (!resizingCol.current) return
    const delta = e.clientX - startX.current
    const newWidth = Math.max(40, startWidth.current + delta)
    setColWidths(prev => ({ ...prev, [resizingCol.current]: newWidth }))
  }

  const handleResizeEnd = () => {
    resizingCol.current = null
    document.removeEventListener('mousemove', handleResizeMove)
    document.removeEventListener('mouseup', handleResizeEnd)
    document.body.style.cursor = 'default'
    document.body.style.userSelect = 'auto'
  }

  if (loading) return (
    <div className="empty-state" style={{ marginTop: 80 }}>
      <div className="empty-icon">⏳</div><p>Loading ratecard...</p>
    </div>
  )

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ── HEADER (Full Width) ── */}
      <header style={{ 
        padding: '24px 32px', 
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 6 }}>Ratecard Manager</h1>
            <p className="text-muted text-sm">Kelola harga dan item layanan PT Juara dengan antarmuka Grid Spreadsheet</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-primary btn-sm" onClick={() => document.getElementById('excel-import').click()}>⬆ Import Excel</button>
            <input type="file" id="excel-import" hidden accept=".xlsx, .xls" onChange={handleImportExcel} />
            
            <button className="btn btn-surface btn-sm" onClick={handleExportExcel}>⬇ Export Excel</button>
            <button className="btn btn-surface btn-sm" onClick={handleExportBundles}>📦 Export Paket</button>
            <button className="btn btn-ghost btn-sm" onClick={handleExport}>⬇ Export JSON</button>
            <button className="btn btn-ghost btn-sm" onClick={handleReset} style={{ color: 'var(--text-3)' }}>🔄 Reset Data Default</button>
          </div>
        </div>
      </header>

      <div style={{ flex: 1, padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        
        {/* ── Progress bar ── */}
        <div className="card card-sm" style={{ padding: '12px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
            <span style={{ color: 'var(--text-2)' }}>Kelengkapan Harga</span>
            <span style={{ fontWeight: 700 }}>{stats.total > 0 ? Math.round(stats.priced / stats.total * 100) : 0}%</span>
          </div>
          <div style={{ background: 'var(--surface-2)', borderRadius: 999, height: 8, overflow: 'hidden' }}>
            <div style={{
              width: `${stats.total > 0 ? (stats.priced / stats.total * 100) : 0}%`, height: '100%',
              background: 'linear-gradient(90deg, var(--green), #16a34a)',
              borderRadius: 999, transition: 'width 0.5s ease',
            }} />
          </div>
        </div>

        {/* ── Filters ── */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <input className="form-input" style={{ maxWidth: 320 }}
            placeholder="🔍 Cari item, kategori, deskripsi..."
            value={search} onChange={e => setSearch(e.target.value)} />

          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {['ALL', ...stats.sections].map(s => {
              const isActive = filterSection === s;
              const color = s !== 'ALL' ? getColorForSection(s?.charAt(0)) : 'var(--accent)';
              return (
                <button key={s} onClick={() => setFilterSection(s)}
                  style={{
                    padding: '8px 14px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                    border: '1px solid', cursor: 'pointer', transition: 'all 0.15s',
                    borderColor: isActive ? color : 'var(--border)',
                    background: isActive ? color : 'var(--surface)',
                    color: isActive ? '#000' : 'var(--text-2)',
                  }}>{s}</button>
              )
            })}
          </div>

          <div style={{ display: 'flex', gap: 4 }}>
            {[
              { key: 'ALL', label: 'Semua' },
              { key: 'PRICED', label: '✅ Priced' },
              { key: 'TBD', label: '⚠ TBD' },
            ].map(f => (
              <button key={f.key} onClick={() => setFilterPriced(f.key)}
                className={filterPriced === f.key ? 'btn btn-surface btn-sm' : 'btn btn-ghost btn-sm'}
                style={{ fontWeight: filterPriced === f.key ? 700 : 400 }}>
                {f.label}
              </button>
            ))}
          </div>

          <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-3)' }}>
            {filtered.length} items
          </span>
        </div>

        {/* ── Tip ── */}
        <div style={{
          padding: '12px 16px', borderRadius: 10,
          background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.15)',
          fontSize: 12, color: 'var(--blue)',
        }}>
          💡 <strong>Grid Editor:</strong> Anda dapat mengklik teks apa saja di dalam tabel untuk langsung mengeditnya (seperti Microsoft Excel). Untuk menambahkan barang baru, cukup ketik di baris kosong paling bawah dan tekan Enter.
        </div>

        {/* ── Table ── */}
        <div style={{ 
          background: 'var(--surface)', 
          border: '1px solid var(--border)', 
          borderRadius: 12, 
          overflowX: 'auto', flex: 1, 
          maxHeight: 'calc(100vh - 280px)' 
        }}>
          <table style={{ 
            width: 'max-content', minWidth: '100%', 
            borderCollapse: 'separate', borderSpacing: 0,
            tableLayout: 'fixed',
            fontSize: 13 
          }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
              <tr>
                <ColH w={colWidths.sec} onResize={e => handleResizeStart(e, 'sec')}>Sec</ColH>
                <ColH w={colWidths.cat} onResize={e => handleResizeStart(e, 'cat')}>Kategori</ColH>
                <ColH w={colWidths.item} onResize={e => handleResizeStart(e, 'item')}>Item Name</ColH>
                <ColH w={colWidths.vendor} onResize={e => handleResizeStart(e, 'vendor')}>Vendor</ColH>
                <ColH w={colWidths.desc} onResize={e => handleResizeStart(e, 'desc')}>Keterangan / Spek</ColH>
                <ColH w={colWidths.vol} onResize={e => handleResizeStart(e, 'vol')}>Volume</ColH>
                <ColH w={colWidths.hpp} onResize={e => handleResizeStart(e, 'hpp')}>HPP</ColH>
                <ColH w={colWidths.sell} onResize={e => handleResizeStart(e, 'sell')}>Harga Jual</ColH>
                <ColH w={colWidths.coa} onResize={e => handleResizeStart(e, 'coa')}>COA</ColH>
                <ColH w={colWidths.actions} noResize></ColH>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-3)' }}>
                    Tidak ada baris data.
                  </td>
                </tr>
              )}

              {/* Group headers when sorted by section */}
              {sortBy === 'section'
                ? Object.entries(grouped).map(([sec, secData]) => (
                    <React.Fragment key={sec}>
                      <SectionHeaderRow sec={sec} secData={secData} onRename={() => {}} />
                      {Object.entries(secData.categories).map(([, catItems]) => (
                        catItems.map(item => (
                          <ItemRow key={item._id} item={item} onUpdate={handleUpdate} onDelete={() => handleDelete(item)} onDuplicate={() => handleDuplicate(item)} colWidths={colWidths} />
                        ))
                      ))}
                    </React.Fragment>
                  ))
                : filtered.map(item => (
                    <ItemRow key={item._id} item={item} onUpdate={handleUpdate} onDelete={() => handleDelete(item)} onDuplicate={() => handleDuplicate(item)} colWidths={colWidths} />
                  ))
              }

              {/* Ghost Row Insert */}
              <GhostRow onAdd={handleCreate} colWidths={colWidths} existingItems={items} />
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}

/* ── Section Header Row ─────────────────────────────────────────────── */
function SectionHeaderRow({ sec, secData, onRename }) {
  const [localCode, setLocalCode] = useState(sec)
  const [localName, setLocalName] = useState(secData.section_name || '')
  
  const handleCommit = () => {
    if (localCode !== sec || localName !== secData.section_name) {
      onRename(sec, localCode, localName)
    }
  }

  return (
    <tr style={{ background: getColorForSection(sec?.charAt(0)) + '08', borderTop: '2px solid var(--border)' }}>
      <td style={{ padding: '10px 14px', width: 60 }}>
        <input 
          value={localCode} 
          onChange={e => setLocalCode(e.target.value.toUpperCase())}
          onBlur={handleCommit}
          onKeyDown={e => e.key === 'Enter' && e.target.blur()}
          style={{ width: '100%', background: 'transparent', border: '1px dashed var(--border)', borderRadius: 4, padding: '4px', textAlign: 'center', fontWeight: 'bold', color: 'var(--text)' }}
          title="Ubah Kode Section"
        />
      </td>
      <td colSpan={7} style={{ padding: '10px 14px', fontWeight: 700, fontSize: 13, color: getColorForSection(sec?.charAt(0)) }}>
        <input 
          value={localName}
          onChange={e => setLocalName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && e.target.blur()}
          style={{ width: '100%', background: 'transparent', border: '1px dashed transparent', padding: '4px', fontWeight: 'bold', color: 'inherit' }}
          onFocus={e => { e.target.style.border = '1px dashed var(--border)'; e.target.style.color = 'var(--text)'; }}
          onBlur={e => { 
            e.target.style.border = '1px dashed transparent'; 
            e.target.style.color = 'inherit'; 
            handleCommit(); 
          }}
          title="Ubah Nama Section"
        />
    </td>
    </tr>
  )
}

/* ── Editable Item Row ─────────────────────────────────────────────── */
function ItemRow({ item, onUpdate, onDelete, onDuplicate, colWidths }) {
  const [local, setLocal] = useState(item);

  useEffect(() => { setLocal(item) }, [item]);

  const commit = (field) => {
    if (local[field] !== item[field]) {
      onUpdate(item._id, field, local[field]);
    }
  }

  const handleChange = (field, val) => {
    if (field === 'unit_cost' || field === 'unit_sell') {
      val = val === '' ? null : Number(val);
    }
    setLocal(prev => ({ ...prev, [field]: val }))
  }

  const hasPrice = local.unit_sell > 0;

  return (
    <tr className="item-row" style={{ borderBottom: '1px solid var(--border)', background: hasPrice ? 'transparent' : 'rgba(234,179,8,0.03)' }}>
      <td style={{ padding: '8px 14px', width: colWidths.sec }}>
        <div style={{ fontWeight: 800, fontSize: 10, color: 'var(--text-3)', textAlign: 'center' }}>
          {(local.category || '').split(' ')[0]}
        </div>
      </td>
      <td style={{ padding: '8px 14px', color: 'var(--text-2)', width: colWidths.cat }}>
        <CellInput value={local.sub_category} onChange={v => handleChange('sub_category', v)} onBlur={() => commit('sub_category')} placeholder="Kategori" />
      </td>
      
      {/* Item Name */}
      <td style={{ padding: '8px 14px', width: colWidths.item }}>
        <div style={{ fontWeight: 600 }}>
          <CellInput value={local.item_name} onChange={v => handleChange('item_name', v)} onBlur={() => commit('item_name')} placeholder="Nama Barang/Jasa" />
        </div>
      </td>
      
      {/* Vendor */}
      <td style={{ padding: '8px 14px', width: colWidths.vendor }}>
        <CellInput value={local.vendor_name} onChange={v => handleChange('vendor_name', v)} onBlur={() => commit('vendor_name')} placeholder="Vendor..." style={{fontSize: 12, color: 'var(--text-2)'}} />
      </td>

      {/* Description */}
      <td style={{ padding: '8px 14px', width: colWidths.desc }}>
        <textarea 
          value={local.remarks || ''} 
          onChange={e => handleChange('remarks', e.target.value)}
          onBlur={() => commit('remarks')}
          placeholder="Spek teknis..."
          style={{ width: '100%', padding: '4px 0', background: 'transparent', border: 'none', color: 'var(--text-3)', fontSize: 11, resize: 'none', height: 32, lineHeight: '1.2' }}
        />
      </td>

      <td style={{ padding: '8px 14px', whiteSpace: 'nowrap', width: colWidths.vol }}>
        <div style={{ display: 'flex', gap: 4 }}>
          <CellInput value={local.unit} onChange={v => handleChange('unit', v)} onBlur={() => commit('unit')} width={40} placeholder="unit" />
        </div>
      </td>
      <td style={{ padding: '8px 14px', width: colWidths.hpp }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'var(--text-3)', marginRight: 4 }}>Rp</span>
          <NumCellInput value={local.unit_cost} onChange={v => handleChange('unit_cost', v)} onBlur={() => commit('unit_cost')} placeholder="Cost" style={{fontWeight: 600, color: 'var(--text-2)'}} />
        </div>
      </td>
      <td style={{ padding: '8px 14px', width: colWidths.sell }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'var(--text-3)', marginRight: 4 }}>Rp</span>
          <NumCellInput value={local.unit_sell} onChange={v => handleChange('unit_sell', v)} onBlur={() => commit('unit_sell')} placeholder="Harga Jual" style={{fontWeight: 700, color: hasPrice ? 'var(--green)' : 'var(--yellow)', background: hasPrice ? 'transparent' : 'rgba(234,179,8,0.1)'}} />
        </div>
      </td>
      <td style={{ padding: '8px 14px', width: colWidths.coa }}>
        <CellInput value={local.coa_code} onChange={v => handleChange('coa_code', v)} onBlur={() => commit('coa_code')} placeholder="COA" style={{fontSize: 11, color: 'var(--text-3)'}} width={60} />
      </td>
      <td style={{ padding: '8px 14px', width: colWidths.actions }}>
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="btn btn-ghost btn-sm" onClick={onDuplicate} title="Duplicate Item" style={{ padding: '4px 6px', fontSize: 14 }}>⧉</button>
          <button className="btn btn-danger btn-sm" onClick={onDelete} title="Delete Item" style={{ padding: '4px 8px', fontSize: 12 }}>🗑</button>
        </div>
      </td>
    </tr>
  )
}

/* ── Ghost Row (Add Item) ─────────────────────────────────────────── */
function GhostRow({ onAdd, colWidths, existingItems }) {
  const blank = { item_code: '', item_name: '', category: '', sub_category: '', unit: 'unit', unit_cost: 0, unit_sell: 0, vendor_name: '', remarks: '', updated_at: '' };
  const [local, setLocal] = useState({ ...blank });

  const handleChange = (field, val) => {
    if (field === 'unit_cost' || field === 'unit_sell') val = val === '' ? 0 : Number(val);
    setLocal(prev => ({ ...prev, [field]: val }))
  }

  const commit = () => {
    if (!local.item_name) return; // name is required
    
    onAdd({
      ...local,
      item_code: local.item_code || `CUST-${Date.now()}`,
      category: local.category || 'General',
      sub_category: local.sub_category || 'General',
      updated_at: new Date().toISOString()
    });
    setLocal({ ...blank, category: local.category, sub_category: local.sub_category }); // keep input
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') commit();
  }

  return (
    <tr style={{ background: 'var(--bg)', borderTop: '2px solid var(--border)' }}>
      <td style={{ padding: '10px 14px', width: colWidths.sec }}>
        <CellInput value={local.category} onChange={v => handleChange('category', v)} placeholder="Sec" onKeyDown={handleKeyDown} style={{background: 'var(--surface)'}} />
      </td>
      <td style={{ padding: '10px 14px', width: colWidths.cat }}>
        <CellInput value={local.sub_category} onChange={v => handleChange('sub_category', v)} placeholder="+ Kategori" onKeyDown={handleKeyDown} style={{background: 'var(--surface)'}} />
      </td>
      <td style={{ padding: 0, width: colWidths.item }}>
        <input 
          value={local.item_name || ''} 
          onChange={e => handleChange('item_name', e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="+ Item Baru"
          style={{ width: '100%', padding: '10px 14px', background: 'var(--surface)', border: 'none', color: 'var(--text)', fontWeight: 600 }}
        />
      </td>
      <td style={{ padding: 0, width: colWidths.vendor }}>
        <input 
          value={local.vendor_name || ''} 
          onChange={e => handleChange('vendor_name', e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Vendor"
          style={{ width: '100%', padding: '10px 14px', background: 'var(--surface)', border: 'none', color: 'var(--text-2)', fontSize: 12 }}
        />
      </td>
      <td style={{ padding: 0, width: colWidths.desc }}>
        <input 
          value={local.remarks || ''} 
          onChange={e => handleChange('remarks', e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Spek..."
          style={{ width: '100%', padding: '10px 14px', background: 'var(--surface)', border: 'none', color: 'var(--text-3)', fontSize: 12 }}
        />
      </td>
      <td style={{ padding: '10px 14px', width: colWidths.vol }}>
        <div style={{ display: 'flex', gap: 4 }}>
          <CellInput value={local.unit} onChange={v => handleChange('unit', v)} placeholder="unit" onKeyDown={handleKeyDown} style={{background: 'var(--surface)'}} width={40} />
        </div>
      </td>
      <td style={{ padding: '10px 14px', width: colWidths.hpp }}>
        <NumCellInput value={local.unit_cost} onChange={v => handleChange('unit_cost', v)} placeholder="Cost" onKeyDown={handleKeyDown} style={{background: 'var(--surface)'}} />
      </td>
      <td style={{ padding: '10px 14px', width: colWidths.sell }}>
        <NumCellInput value={local.unit_sell} onChange={v => handleChange('unit_sell', v)} placeholder="Jual" onKeyDown={handleKeyDown} style={{background: 'var(--surface)'}} />
      </td>
      <td style={{ padding: '10px 14px', width: colWidths.coa }}>
        <CellInput value={local.coa_code} onChange={v => handleChange('coa_code', v)} placeholder="COA" onKeyDown={handleKeyDown} style={{background: 'var(--surface)'}} />
      </td>
      <td style={{ padding: '10px 14px', width: colWidths.actions }}>
        <button className="btn btn-primary btn-sm" onClick={commit} disabled={!local.item_name}>Add</button>
      </td>
    </tr>
  )
}
