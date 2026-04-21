import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllQuotations, deleteQuotation, duplicateQuotation } from '../lib/quotationRepo'
import { calcSummary } from '../utils/calc'
import { fmtRp, fmtDate } from '../utils/fmt'
import { importFromExcelSync } from '../utils/excelSync'
import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const [quotations, setQuotations] = useState([])
  const [loading, setLoading] = useState(true)
  const fileInputRef = useRef(null)
  const navigate = useNavigate()
  const [confirmState, setConfirmState] = useState(null) // { title, message, onConfirm, onCancel, confirmLabel, cancelLabel, type }

  const load = () => {
    getAllQuotations().then(data => { setQuotations(data); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id, name) => {
    setConfirmState({
      title: 'Hapus Quotation?',
      message: `Apakah Anda yakin ingin menghapus "${name}"? Tindakan ini tidak bisa dibatalkan.`,
      confirmLabel: 'Ya, Hapus',
      cancelLabel: 'Batal',
      type: 'danger',
      onConfirm: async () => {
        await deleteQuotation(id)
        setConfirmState(null)
        load()
      },
      onCancel: () => setConfirmState(null)
    })
  }

  const handleNewQuotation = () => {
    const draft = localStorage.getItem('juara_quotation_draft')
    if (draft) {
      const { eventData } = JSON.parse(draft)
      const draftName = eventData?.event_title || 'Untitled'
      setConfirmState({
        title: 'Draft Belum Tersimpan',
        message: `Anda memiliki draft "${draftName}" yang belum disimpan ke daftar resmi. Ingin membuang draft tersebut dan membuat yang baru?`,
        confirmLabel: 'Buat Baru (Hapus Draft)',
        cancelLabel: 'Lanjutkan Draft Tadi',
        type: 'warning',
        onConfirm: () => {
          localStorage.removeItem('juara_quotation_draft')
          setConfirmState(null)
          navigate('/new')
        },
        onCancel: () => {
          setConfirmState(null)
          navigate('/new') // The Builder will then show the Restore prompt
        }
      })
    } else {
      navigate('/new')
    }
  }

  const handleDuplicate = async (id) => {
    await duplicateQuotation(id)
    load()
  }

  const handleDirectImport = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    try {
      let items = []
      if (file.name.toLowerCase().endsWith('.pdf')) {
        const { importFromPDFSync } = await import('../utils/pdfSync')
        items = await importFromPDFSync(file)
      } else {
        items = await importFromExcelSync(file)
      }
      
      if (items.length === 0) throw new Error('No items found in file')
      
      // Auto-extract metadata if possible (first item's section/category name as title)
      const eventTitle = items[0].section_name || items[0].category || 'Imported Quotation'
      
      // Create new quotation record
      const newQ = await createQuotation({
        event_title: eventTitle,
        client_name: 'Imported',
        status: 'draft',
        quotation_items: items
      })
      
      // Clear any leftover local drafts and set skip-restore flag
      localStorage.removeItem('juara_quotation_draft')
      sessionStorage.setItem('juara_skip_draft_restore', 'true')
      
      navigate(`/edit/${newQ.id}`, { 
        state: { 
          importSuccess: true, 
          itemCount: items.length,
          sections: [...new Set(items.map(i => i.section_name))].length
        } 
      })
    } catch (err) {
      setConfirmState({
        title: 'Import Gagal',
        message: 'Tidak dapat membaca file Anda. Pastikan formatnya sesuai. Error: ' + err.message,
        confirmLabel: 'Tutup',
        type: 'danger',
        onConfirm: () => setConfirmState(null),
        onCancel: () => setConfirmState(null)
      })
    } finally {
      setLoading(false)
      // Reset the input so the same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <main style={{ paddingBottom: 80 }}>
      {/* Hero / Header Row */}
      <div style={{ borderBottom: '1px solid var(--border)', padding: '48px 0' }}>
        <div className="page-wrap">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="fade-in">
              <h1 style={{ fontSize: '2.5rem', marginBottom: 8, fontWeight: 800 }}>
                Dashboard
              </h1>
              <p className="text-muted" style={{ fontSize: '1.1rem' }}>
                Manage and track your project estimations.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleDirectImport} 
                accept=".xlsx,.xls,.csv,.pdf" 
                style={{ display: 'none' }} 
              />
              <button 
                className="btn btn-surface btn-lg" 
                onClick={() => fileInputRef.current.click()}
                disabled={loading}
              >
                📥 Import Excel
              </button>
              <button 
                className="btn btn-primary btn-lg" 
                style={{ fontWeight: 600 }}
                onClick={handleNewQuotation}
              >
                New Quotation
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="page-wrap" style={{ marginTop: 40 }}>
        {/* Stats Row — Vercel Metrics Style */}
        {quotations.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 0, marginBottom: 48, border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            {[
              { label: 'Total Projects', value: quotations.length, color: 'var(--text)' },
              { label: 'Drafts', value: quotations.filter(q => q.status === 'draft').length, color: 'var(--yellow)' },
              { label: 'Finalized', value: quotations.filter(q => q.status === 'final').length, color: 'var(--vercel-green)' },
            ].map((stat, idx) => (
              <div key={stat.label} style={{ 
                padding: '24px 32px', 
                borderLeft: idx === 0 ? 'none' : '1px solid var(--border)',
                background: 'var(--bg)',
                display: 'flex',
                flexDirection: 'column',
                gap: 4
              }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
                <div style={{ fontSize: 32, fontWeight: 700, color: stat.color }}>{stat.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Quotation List Header */}
        <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>Recent Quotations</h2>
          <div style={{ height: 1, flex: 1, background: 'var(--border)' }} />
        </div>

        {/* Quotation List */}
        {loading ? (
          <div className="empty-state">
            <div style={{ width: 40, height: 40, border: '2px solid var(--border)', borderTopColor: 'var(--text)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : quotations.length === 0 ? (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '100px 0', borderStyle: 'dashed' }}>
            <h2 style={{ marginBottom: 8 }}>No quotations found</h2>
            <p className="text-muted" style={{ marginBottom: 24 }}>Create your first project estimation to get started.</p>
            <Link to="/new" className="btn btn-primary">
              Create New Quotation
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {/* Using a border-collapse-like gap with 1px and background: border */}
            <div style={{ background: 'var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)' }}>
              {quotations.map(q => {
                const items = q.quotation_items || q.lines || []
                const eventName   = q.event_name   || q.event_title || 'Untitled'
                const clientName  = q.client_name  || q.client      || '—'
                const eventDate   = q.event_date_start || q.event_date || null
                const quotNo      = q.quotation_no || q.quot_number  || ''
                
                const opts = {
                  discount_type:  q.discount_type  || 'pct',
                  discount_value: q.discount_value ?? 0,
                  mgmt_type:      'pct',
                  mgmt_value:     q.management_fee_value ?? Math.round((q.mgmt_fee_rate || 0.10) * 100),
                  ppn_rate:       q.ppn_rate ? (q.ppn_rate > 1 ? q.ppn_rate : Math.round(q.ppn_rate * 100)) : 12,
                }
                const { grandTotal } = calcSummary(items, opts)
                const isDraft = q.status !== 'final'
                
                return (
                  <div key={q.id} style={{
                    display: 'flex', alignItems: 'center', gap: 24, padding: '24px 32px',
                    background: 'var(--bg)',
                    marginBottom: 1, // Visual separator
                    transition: 'background 0.1s',
                  }} className="quot-row">
                    <style>{`.quot-row:hover { background: var(--surface) !important; }`}</style>
                    
                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                        <Link to={`/edit/${q.id}`} style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>
                          {eventName}
                        </Link>
                        <span className={`badge ${isDraft ? 'badge-yellow' : 'badge-green'}`} style={{ fontSize: 10, padding: '2px 8px' }}>
                          {isDraft ? 'Draft' : 'Final'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-2)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ color: 'var(--text-3)' }}>Client:</span> {clientName}
                        </span>
                        {eventDate && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ color: 'var(--text-3)' }}>Date:</span> {fmtDate(eventDate)}
                          </span>
                        )}
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ color: 'var(--text-3)' }}>Items:</span> {items.length}
                        </span>
                      </div>
                    </div>

                    {/* Total */}
                    <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 160 }}>
                      <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                        {fmtRp(grandTotal)}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{quotNo || 'Ref: NONE'}</div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      <Link to={`/preview/${q.id}`} className="btn btn-ghost btn-sm">Preview</Link>
                      <Link to={`/edit/${q.id}`}    className="btn btn-surface btn-sm">Edit</Link>
                      <div style={{ width: 1, height: 24, background: 'var(--border)' }} />
                      <button className="btn btn-ghost btn-sm" onClick={() => handleDuplicate(q.id)} title="Duplicate">⧉</button>
                      <button className="btn btn-danger btn-sm" style={{ border: 'none' }} onClick={() => handleDelete(q.id, eventName)}>Delete</button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal Confirmation (Custom) */}
      {confirmState && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 24 }}
             onClick={() => confirmState.onCancel()}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 40, maxWidth: 480, width: '100%', textAlign: 'center', boxShadow: '0 32px 100px rgba(0,0,0,0.6)' }}
               onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 48, marginBottom: 24 }}>
              {confirmState.type === 'danger' ? '🗑️' : '⚠️'}
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 16, letterSpacing: '-0.02em' }}>{confirmState.title}</h2>
            <p style={{ color: 'var(--text-2)', marginBottom: 40, fontSize: 16, lineHeight: 1.6 }}>{confirmState.message}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button 
                className={`btn ${confirmState.type === 'danger' ? 'btn-danger' : 'btn-primary'} btn-lg`} 
                style={{ width: '100%', height: 56, fontSize: 16, fontWeight: 700, background: confirmState.type === 'danger' ? 'var(--red)' : '', borderColor: confirmState.type === 'danger' ? 'var(--red)' : '' }} 
                onClick={() => confirmState.onConfirm()}
              >
                {confirmState.confirmLabel || 'Confirm'}
              </button>
              <button 
                className="btn btn-ghost btn-lg" 
                style={{ width: '100%', height: 56, fontSize: 16 }} 
                onClick={() => confirmState.onCancel()}
              >
                {confirmState.cancelLabel || 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
