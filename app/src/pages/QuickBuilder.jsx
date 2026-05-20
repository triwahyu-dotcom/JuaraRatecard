import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { calcSummary } from '../utils/calc'
import { usePresence } from '../hooks/usePresence'
import Header from '../components/Header'
import SimpleTableView from '../components/SimpleTableView'
import PrintDocument from '../components/PrintDocument'
import { exportQuotationToXls } from '../utils/exportXls'
import { generateQuotNumber } from '../utils/fmt'

const defaultEvent = {
  client_name: '', title: '', event_date: '', venue: '', city: '',
  quot_number: '', signatory: 'Eka Marutha Yuswardana',
  discount_type: 'amt', discount_value: 0,
  ppn_rate: 0.12,
  mgmt_fee_rate: 0.10,
  notes: [
    'The offer price above valid as long as the term specified',
    'The Offer Price Included Rehearsal D-1',
  ],
  status: 'draft',
}

export default function QuickBuilder() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [eventData, setEventData] = useState(defaultEvent)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(!!id)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState('idle')
  const [showPreview, setShowPreview] = useState(false)
  
  const { activeUsers } = usePresence(id)
  
  const quotation = useQuery(api.quotations.get, id ? { id: id } : "skip");
  const updateQuotationMutation = useMutation(api.quotations.update);
  const logActivityMutation = useMutation(api.activities.log);
  const createQuotationMutation = useMutation(api.quotations.create);

  // Load initial data
  useEffect(() => {
    if (quotation) {
      setItems(quotation.items || [])
      setEventData(prev => ({
        ...prev,
        ...quotation
      }))
      setLoading(false)
      setSaveStatus('saved')
    }
  }, [quotation])

  // Simple auto-save logic
  useEffect(() => {
    if (items.length === 0 || loading || saving) return
    const timer = setTimeout(() => handleCommitUpdate(items), 2000)
    return () => clearTimeout(timer)
  }, [items, eventData])

  const handleCommitUpdate = async (latestItems = items) => {
    if (!id) return
    setSaveStatus('saving')
    try {
      const currentSummary = calcSummary(latestItems, eventData)
      await updateQuotationMutation({
        id,
        items: latestItems,
        ...eventData,
        total_sell: currentSummary.grandTotal,
        profit_estimate: currentSummary.totalMargin,
      })
      setSaveStatus('saved')
    } catch (err) {
      console.error('Save failed:', err)
      setSaveStatus('idle')
    }
  }

  const handleUpdate = (key, updates) => {
    setItems(prev => prev.map(it => it._ratecard_key === key ? { ...it, ...updates } : it))
    setSaveStatus('idle')
  }

  const handleRemove = (key) => {
    setItems(prev => prev.filter(it => it._ratecard_key !== key))
    setSaveStatus('idle')
  }

  const handleDuplicate = (item) => {
    const newItem = { ...item, _ratecard_key: crypto.randomUUID() }
    setItems(prev => [...prev, newItem])
    setSaveStatus('idle')
  }

  const handleAddCustomItem = (sectionCode, name = '', insertIdx = -1, category = 'Uncategorized') => {
    const newItem = {
      _ratecard_key: crypto.randomUUID(),
      item_name: name,
      section_code: sectionCode,
      category: category,
      qty: 1,
      frequency_qty: 1,
      unit_sell: 0,
      unit_cost: 0,
      specification: '',
      sort_order: items.length
    }
    
    if (insertIdx >= 0) {
      const newItems = [...items]
      newItems.splice(insertIdx, 0, newItem)
      setItems(newItems)
    } else {
      setItems(prev => [...prev, newItem])
    }
    setSaveStatus('idle')
  }

  const handleCreateNew = async () => {
    setSaving(true)
    try {
      const quotNum = generateQuotNumber()
      const newId = await createQuotationMutation({
        ...eventData,
        quot_number: quotNum,
        items: [],
        total_sell: 0,
        profit_estimate: 0
      })
      navigate(`/quick-edit/${newId}`)
    } catch (err) {
      alert('Failed to create quotation')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div style={{ padding: 100, textAlign: 'center', color: 'var(--text-3)' }}>Loading Quick Builder...</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', background: 'var(--bg)' }}>
      {/* Quick Builder Toolbar */}
      <div style={{ 
        height: 56, borderBottom: '1px solid var(--border)', 
        background: 'var(--surface)', display: 'flex', alignItems: 'center', 
        padding: '0 24px', justifyContent: 'space-between', flexShrink: 0 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => navigate('/')} className="btn btn-ghost btn-sm">← Back</button>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 13, fontWeight: 800 }}>{eventData.title || 'New Quick Quotation'}</span>
            <span style={{ fontSize: 10, color: 'var(--text-4)', fontWeight: 600 }}>QUICK BUILDER MODE</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: saveStatus === 'saved' ? 'var(--green)' : 'var(--text-4)', fontWeight: 700 }}>
            {saveStatus === 'saving' ? 'SAVING...' : (saveStatus === 'saved' ? '● SAVED' : 'CHANGES DETECTED')}
          </span>
          <button onClick={() => setShowPreview(true)} className="btn btn-ghost btn-sm" style={{ border: '1px solid var(--border)' }}>Print Preview</button>
          {!id ? (
            <button onClick={handleCreateNew} disabled={saving} className="btn btn-primary btn-sm">Create & Save</button>
          ) : (
             <button onClick={() => navigate(`/edit/${id}`)} className="btn btn-ghost btn-sm" style={{ color: 'var(--accent)' }}>Switch to Advanced</button>
          )}
        </div>
      </div>

      {!id ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 400, padding: 32, background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
            <h2 style={{ marginBottom: 20, fontSize: 18, fontWeight: 800 }}>Project Details</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label style={{ fontSize: 11, fontWeight: 700, marginBottom: 4, display: 'block' }}>Project Title</label>
                <input 
                  className="form-input" 
                  value={eventData.title} 
                  onChange={e => setEventData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Wedding Concert 2024"
                />
              </div>
              <div className="form-group">
                <label style={{ fontSize: 11, fontWeight: 700, marginBottom: 4, display: 'block' }}>Client Name</label>
                <input 
                  className="form-input" 
                  value={eventData.client_name} 
                  onChange={e => setEventData(prev => ({ ...prev, client_name: e.target.value }))}
                  placeholder="Client/Company Name"
                />
              </div>
              <button onClick={handleCreateNew} disabled={saving || !eventData.title} className="btn btn-primary" style={{ marginTop: 8 }}>
                {saving ? 'Creating...' : 'Start Building'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <SimpleTableView
          items={items}
          onUpdate={handleUpdate}
          onRemove={handleRemove}
          onDuplicate={handleDuplicate}
          onAddCustom={handleAddCustomItem}
        />
      )}

      {showPreview && id && (
        <div style={{ 
          position: 'fixed', inset: 0, zIndex: 10000, 
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
          display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px' }}>
            <h3 style={{ color: 'white', fontWeight: 800 }}>Print Preview</h3>
            <button onClick={() => setShowPreview(false)} className="btn btn-ghost" style={{ color: 'white' }}>Close</button>
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: '0 0 60px 0' }}>
             <PrintDocument
               eventData={eventData}
               items={items}
               summary={calcSummary(items, eventData)}
               layout="existing"
               showSummary={true}
               combineSameItems={false}
             />
          </div>
        </div>
      )}
    </div>
  )
}
