import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import StepBar from '../components/StepBar'
import EventForm from '../components/EventForm'
import RatecardBrowser from '../components/RatecardBrowser'
import QuotationCart from '../components/QuotationCart'
import SummaryTable from '../components/SummaryTable'
import PrintDocument from '../components/PrintDocument'
import { getQuotation, createQuotation, updateQuotation } from '../lib/quotationRepo'
import { generateQuotNumber } from '../utils/fmt'
import { calcLineSell, calcLineCost, calcSummary, calcSellFromMargin, getQuotationLines } from '../utils/calc'
import { EVENT_TEMPLATES, findItemsInRatecard } from '../utils/templates'
import { getAllRatecardItems, createMasterItem, getCategories, ensureCategoryExists } from '../lib/ratecardRepo'
import { exportToExcelSync, importFromExcelSync } from '../utils/excelSync'
import { diceCoefficient, predictCategory } from '../utils/stringUtils'
import { useRef } from 'react'

const STEPS = [
  { label: 'Details', sub: 'Client & event info' },
  { label: 'Items',  sub: 'Browse ratecard' },
  { label: 'Review',        sub: 'Finalize & save' },
]

const defaultEvent = {
  client: '', event_title: '', event_date: '', venue: '', city: '',
  quot_number: '', signatory: 'Eka Marutha Yuswardana',
  discount: 0, discount_type: 'pct', discount_value: 0,
  ppn_rate: 0.12,
  mgmt_fee_rate: 0.10,
  notes: [
    'The offer price above valid as long as the term specified',
    'The Offer Price Included Rehearsal D-1',
  ],
  status: 'draft',
}

export default function Builder() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [step, setStep] = useState(0)
  const [eventData, setEventData] = useState(defaultEvent)
  const [items, setItems] = useState([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(!!id)
  const [ratecardData, setRatecardData] = useState([])
  const [pendingTemplate, setPendingTemplate] = useState(null)
  const [successMsg, setSuccessMsg] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isDraggingFile, setIsDraggingFile] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [confirmState, setConfirmState] = useState(null) // { title, message, onConfirm, onCancel, confirmLabel, cancelLabel }
  const [history, setHistory] = useState([])
  const [redoStack, setRedoStack] = useState([])
  const [lastSavedItems, setLastSavedItems] = useState(null)
  const [saveStatus, setSaveStatus] = useState('idle') // idle | saving | saved
  const fileInputRef = useRef(null)

  // Load ratecard for templates
  useEffect(() => {
    getAllRatecardItems().then(setRatecardData)
    
    // Check for import success from Dashboard
    if (location.state?.importSuccess) {
      setSuccessMsg(`Imported ${location.state.itemCount} items across ${location.state.sections} sections successfully.`)
      // Clear location state so it doesn't show again on refresh
      window.history.replaceState({}, document.title)
    }
  }, [])

  // Load/Reset existing quotation
  useEffect(() => {
    if (!id) {
      setEventData({...defaultEvent, quot_number: ''})
      setItems([])
      const draft = localStorage.getItem('juara_quotation_draft')
      if (draft) {
        try {
          const { items: dItems, eventData: dEvent } = JSON.parse(draft)
          // Use custom modal for Restoration
          const skipRestore = sessionStorage.getItem('juara_skip_draft_restore')
          if (dItems.length > 0 && !skipRestore) {
            setConfirmState({
              title: 'Restore Unsaved Draft?',
              message: 'We found a draft from your previous session. Would you like to restore your items and event details?',
              confirmLabel: 'Restore Data',
              cancelLabel: 'Discard & Start New',
              onConfirm: () => {
                setItems(dItems)
                setEventData(dEvent)
                setConfirmState(null)
              },
              onCancel: () => {
                localStorage.removeItem('juara_quotation_draft')
                setConfirmState(null)
              }
            })
          } else if (dItems.length === 0 || skipRestore) {
            localStorage.removeItem('juara_quotation_draft')
            sessionStorage.removeItem('juara_skip_draft_restore')
          }
        } catch (e) { localStorage.removeItem('juara_quotation_draft') }
      }
      setLoading(false)
      return
    }
    
    setLoading(true)
    getQuotation(id).then(q => {
      if (!q) {
        console.warn(`Quotation with ID "${id}" not found.`);
        return navigate('/')
      }
      
      const qLines = getQuotationLines(q)
      
      // Data Normalization (Legacy field mapping)
      const normalizedData = {
        ...q,
        client: q.client || q.client_name || '',
        event_title: q.event_title || q.project_name || '',
        event_date: q.event_date || q.event_date_start || '',
        venue: q.venue || q.venue_name || '',
        // Normalize rates to decimals if they come in as integers
        ppn_rate: (q.ppn_rate > 1) ? q.ppn_rate / 100 : (q.ppn_rate || 0.12),
        mgmt_fee_rate: (q.mgmt_fee_rate > 1) ? q.mgmt_fee_rate / 100 : (q.mgmt_fee_rate || 0.10),
      }
      
      setEventData(normalizedData)
      setItems(qLines.map(i => ({ 
        ...i, 
        _ratecard_key: i._ratecard_key || i.id || `${i.section_code || i.section}-${i.item_name}-${i.category}-${Math.random()}` 
      })))
      setLoading(false)
    }).catch(err => {
      console.error('Failed to load quotation:', err)
      navigate('/')
    })

  }, [id])

  // --- AUTO-SAVE & NAVIGATION GUARD ---
  useEffect(() => {
    if (items.length > 0) {
      setSaveStatus('saving')
      localStorage.setItem('juara_quotation_draft', JSON.stringify({ items, eventData }))
      const timer = setTimeout(() => setSaveStatus('saved'), 500)
      const timer2 = setTimeout(() => setSaveStatus('idle'), 6000) // Double the duration to 6s
      return () => { clearTimeout(timer); clearTimeout(timer2); }
    }
  }, [items, eventData])

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (items.length > 0) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [items])

  // --- UNDO / REDO LOGIC ---
  const saveHistory = (newItems) => {
    setHistory(prev => [lastSavedItems || items, ...prev].slice(0, 100))
    setRedoStack([])
    setLastSavedItems(newItems)
  }

  const undo = () => {
    if (history.length === 0) return
    const prev = history[0]
    setRedoStack(rs => [items, ...rs])
    setHistory(h => h.slice(1))
    setItems(prev)
    setLastSavedItems(prev)
  }

  const redo = () => {
    if (redoStack.length === 0) return
    const next = redoStack[0]
    setHistory(h => [items, ...h])
    setRedoStack(rs => rs.slice(1))
    setItems(next)
    setLastSavedItems(next)
  }

  // Keyboard shortcuts for Undo/Redo
  useEffect(() => {
    const handleKeys = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault()
        if (e.shiftKey) redo()
        else undo()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault()
        redo()
      }
    }
    window.addEventListener('keydown', handleKeys)
    return () => window.removeEventListener('keydown', handleKeys)
  }, [items, history, redoStack])

  // Add item from ratecard
  const handleAdd = (ratecardItem) => {
    const key = ratecardItem.item_code || `item-${Date.now()}-${Math.random()}`
    if (items.some(i => i._ratecard_key === key)) return

    const mCost = ratecardItem.unit_cost || (ratecardItem.unit_price ? Math.round(ratecardItem.unit_price / 1.25) : 0)
    const mSell = ratecardItem.unit_sell || ratecardItem.unit_price || calcSellFromMargin(mCost, 20)

    const newItem = {
      _ratecard_key: key,
      item_code: ratecardItem.item_code,
      section_code: ratecardItem.section || 'A',
      section_name: ratecardItem.section_name,
      category: ratecardItem.category,
      sub_category: '',
      item_name: ratecardItem.item_name,
      spec: ratecardItem.description || '',
      qty: 1,
      qty_unit: ratecardItem.default_unit || 'unit',
      duration_qty: 1,
      duration_unit: 'day',
      frequency_qty: 1,
      frequency_unit: 'event',
      unit_cost: mCost,
      unit_sell: mSell,
      is_complimentary: false,
      variant_name: ratecardItem.variants?.length ? ratecardItem.variants[0].name : null,
      zone_name: null,
      sort_order: items.length,
    }

    saveHistory([...items, newItem])
    setItems(prev => [...prev, newItem])
  }

  const handleApplyTemplate = (templateId) => {
    const template = EVENT_TEMPLATES.find(t => t.id === templateId)
    if (!template) return
    
    // If quote already has items, ask for confirmation
    if (items.length > 0) {
      setPendingTemplate(template)
    } else {
      executeTemplate(template)
    }
  }

  const executeTemplate = (template) => {
    const matched = findItemsInRatecard(template.items, ratecardData)
    const newItems = []
    
    matched.forEach((item, idx) => {
      if (item.item_code) {
        const rcItem = ratecardData.find(r => r.item_code === item.item_code)
        if (rcItem) {
          const key = `${rcItem.item_code}-${Date.now()}-${idx}`
          const mCost = rcItem.unit_cost ?? 0
          const mSell = rcItem.unit_sell ?? rcItem.unit_price ?? 0
          
          newItems.push({
            _ratecard_key: key,
            item_code: rcItem.item_code,
            section_code: rcItem.section || 'A',
            section_name: rcItem.section_name || rcItem.section || 'A',
            category: rcItem.category || 'Standard',
            sub_category: '',
            item_name: rcItem.item_name,
            spec: rcItem.description || '',
            qty: rcItem.qty_default || 1,
            qty_unit: rcItem.qty_unit || 'unit',
            duration_qty: rcItem.freq_default || 1,
            duration_unit: rcItem.freq_unit || 'day',
            frequency_qty: 1,
            frequency_unit: 'event',
            unit_cost: mCost,
            unit_sell: mSell,
            is_complimentary: false,
            variant_name: rcItem.variants?.length ? rcItem.variants[0].name : null,
            zone_name: null,
            sort_order: items.length + idx,
          })
        }
      } else {
        const key = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
        newItems.push({
          _ratecard_key: key,
          section_code: item.section || 'A',
          section_name: item.section || 'A',
          category: item.category || 'Standard',
          sub_category: '',
          item_name: item.item_name,
          spec: '',
          qty: 1, qty_unit: 'unit',
          duration_qty: 1, duration_unit: 'day',
          frequency_qty: 1, frequency_unit: 'event',
          unit_cost: 0, unit_sell: 0,
          is_complimentary: false,
          sort_order: items.length + idx,
          _is_placeholder: true
        })
      }
    })

    if (newItems.length > 0) {
      const updated = [...items, ...newItems]
      saveHistory(updated)
      setItems(updated)
      setSuccessMsg(`${newItems.length} items from "${template.name}" added to quotation.`)
    }
    setPendingTemplate(null)
  }

  const handleAddBundle = (bundle) => {
    const newAddition = []
    bundle.items.forEach((bi, idx) => {
      const rcItem = ratecardData.find(r => r.item_code === bi.item_code)
      if (rcItem) {
        const key = `bundle-${bundle.id}-${bi.item_code}-${Date.now()}-${idx}`
        // Calculate costs if missing (standard JUARA margin)
        const mCost = rcItem.unit_cost || (rcItem.unit_price ? Math.round(rcItem.unit_price / 1.25) : 0)
        const mSell = rcItem.unit_sell || rcItem.unit_price || 0

        newAddition.push({
          _ratecard_key: key,
          item_code: rcItem.item_code,
          section_code: rcItem.section || 'A',
          section_name: rcItem.section_name || 'B. PRODUKSI',
          category: rcItem.category || 'Standard',
          sub_category: '',
          item_name: rcItem.item_name,
          spec: rcItem.description || '',
          qty: bi.quantity || 1,
          qty_unit: rcItem.default_unit || bi.qty_unit || 'unit',
          duration_qty: bi.duration || 1,
          duration_unit: bi.dur_unit || 'day',
          frequency_qty: 1,
          frequency_unit: 'event',
          unit_cost: mCost,
          unit_sell: mSell,
          note: bi.note || '',
          is_complimentary: false,
          sort_order: items.length + newAddition.length,
        })
      }
    })
    
    if (newAddition.length > 0) {
      const updated = [...items, ...newAddition]
      saveHistory(updated)
      setItems(updated)
      setSuccessMsg(`Berhasil menambahkan paket "${bundle.name}" (${newAddition.length} item)`)
    }
  }

  const handleRemove = (key) => {
    const updated = items.filter(i => i._ratecard_key !== key)
    saveHistory(updated)
    setItems(updated)
  }

  const handleUpdate = (key, updates) => {
    // We don't save history on EVERY keystroke here, 
    // it's handled by the debounced effects or specific save triggers if needed.
    // However, for single field updates (blur), it's better to save.
    const updated = items.map(i => i._ratecard_key === key ? { ...i, ...updates } : i)
    // Note: handleUpdate is often called on every keystroke in InlineText.
    // For Undo, we might want to only push to history on blur or after delay.
    // For now, let's just update state.
    setItems(updated)
  }
  
  // Specific handler for "finalizing" a text edit to save history
  const handleCommitUpdate = () => {
    saveHistory(items)
  }

  const handleAddCustomItem = (sectionCode = 'A', prefillName = '', insertAfterIdx = null, prefillCategory = 'custom', prefillSubCategory = '') => {
    const key = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const newItem = {
      _ratecard_key: key,
      section_code: sectionCode,
      section_name: items.find(i => i.section_code === sectionCode)?.section_name || sectionCode,
      category: prefillCategory,
      sub_category: prefillSubCategory,
      item_name: prefillName,
      spec: '',
      qty: 1, qty_unit: 'unit',
      freq: 1, freq_unit: 'event',
      unit_cost: null, unit_sell: null,
      is_complimentary: false, children: [],
      sort_order: insertAfterIdx ?? items.length,
    }
    if (insertAfterIdx !== null) {
      setItems(prev => {
        const next = [...prev]
        next.splice(insertAfterIdx, 0, newItem)
        return next
      })
    } else {
      setItems(prev => [...prev, newItem])
    }
  }

  const handleDuplicate = (item) => {
    const key = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const idx = items.findIndex(i => i._ratecard_key === item._ratecard_key)
    const copy = { ...item, _ratecard_key: key, sort_order: idx + 1 }
    const next = [...items]
    next.splice(idx + 1, 0, copy)
    saveHistory(next)
    setItems(next)
  }

  const handleReorder = (reorderedItems) => setItems(reorderedItems)

  const handleRenameSection = (sectionCode, newName) => {
    setItems(prev => prev.map(i =>
      i.section_code === sectionCode ? { ...i, section_name: newName } : i
    ))
  }

  const handleSave = async (status = 'draft') => {
    setSaving(true)
    try {
      const payload = { ...eventData, status, quotation_items: items }
      if (id) await updateQuotation(id, payload)
      else {
        const created = await createQuotation(payload)
        navigate(`/edit/${created.id}`, { replace: true })
      }
      localStorage.removeItem('juara_quotation_draft') // Clear draft on successful remote save
      if (status === 'final') navigate(`/preview/${id || 'new'}`)
    } catch (e) {
      setConfirmState({
        title: 'Save Failed',
        message: 'An error occurred while saving: ' + e.message,
        confirmLabel: 'Understood',
        onConfirm: () => setConfirmState(null)
      })
    } finally {
      setSaving(false)
    }
  }

  const handleExportExcel = () => {
    const fileName = `${eventData.quot_number || 'draft'}_${eventData.event_title || 'quotation'}.xlsx`.replace(/\s+/g, '_')
    exportToExcelSync(items, fileName)
  }

  const handleImportExcel = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // If there are existing items, ask for confirmation via custom modal
    if (items.length > 0) {
      setConfirmState({
        title: 'Overwrite Current Items?',
        message: 'Importing this file will replace all existing line items in your current quotation. This action cannot be undone.',
        confirmLabel: 'Overwrite & Import',
        cancelLabel: 'Cancel',
        onConfirm: () => {
          setConfirmState(null)
          processImport(file)
        },
        onCancel: () => setConfirmState(null)
      })
    } else {
      processImport(file)
    }
  }

  const processImport = async (file) => {
    setLoading(true)
    try {
      let importedItems = []
      if (file.name.toLowerCase().endsWith('.pdf')) {
        const { importFromPDFSync } = await import('../utils/pdfSync')
        importedItems = await importFromPDFSync(file)
      } else {
        importedItems = await importFromExcelSync(file)
      }
      
      if (importedItems.length === 0) {
        setConfirmState({
          title: 'Empty File',
          message: 'No valid line items were found in the uploaded file. Please check the spreadsheet or PDF format.',
          confirmLabel: 'Try Again',
          onConfirm: () => setConfirmState(null)
        })
        setLoading(false)
        return
      }

      // --- NEW: Ratecard Data Enrichment (v2 Smart Matching) ---
      const enrichedItems = importedItems.map(item => {
        // 1. Try Exact Match (Fastest)
        let match = ratecardData.find(r => 
          r.item_name.toLowerCase().trim() === item.item_name.toLowerCase().trim()
        );

        // 2. Try Fuzzy Match if no exact match
        if (!match) {
          let bestScore = 0;
          ratecardData.forEach(r => {
            const score = diceCoefficient(item.item_name, r.item_name);
            if (score > bestScore) {
              bestScore = score;
              match = r;
            }
          });
          // Reject fuzzy match if score is too low
          if (bestScore < 0.75) match = null;
        }

        if (match) {
          return {
            ...item,
            category: match.category || item.category,
            section_code: match.section || item.section_code,
            section_name: match.section_name || item.section_name,
            unit_cost: match.unit_cost || 0,
            qty_unit: match.default_unit || item.qty_unit,
            unit_sell: item.unit_sell || match.unit_price || 0,
            _matched_fuzzy: !ratecardData.includes(match) // flag if it was a fuzzy match
          };
        } else {
          // 3. Fallback: Smart Category Prediction
          const predicted = predictCategory(item.item_name);
          return {
            ...item,
            category: predicted,
            section_name: item.section_name || predicted,
          };
        }
      });

      // Auto-Category Creation
      const existingCats = await getCategories()
      const newCats = [...new Set(enrichedItems.map(i => i.section_name || i.category).filter(Boolean))]
      
      for (const catName of newCats) {
        await ensureCategoryExists(catName)
      }

      saveHistory(enrichedItems)
      setItems(enrichedItems)
      
      const sections = [...new Set(enrichedItems.map(i => i.section_name))].length
      setSuccessMsg(`Successfully imported ${enrichedItems.length} items across ${sections} sections. Matched ${enrichedItems.filter(i => i.unit_cost > 0).length} items with Ratecard database.`)
      localStorage.removeItem('juara_quotation_draft') // Prevent 'Restore Draft' on next session

      // Auto-save to remote if we have an ID
      if (id) {
        setSaving(true)
        updateQuotation(id, { quotation_items: importedItems }).finally(() => setSaving(false))
      }
    } catch (err) {
      setConfirmState({
        title: 'Import Failed',
        message: 'Could not parse the file: ' + err.message,
        confirmLabel: 'Understood',
        onConfirm: () => setConfirmState(null)
      })
    } finally {
      setLoading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDraggingFile(true)
  }

  const handleDragLeave = () => {
    setIsDraggingFile(false)
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    setIsDraggingFile(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      // Create a mock event object to reuse handleImportExcel logic
      handleImportExcel({ target: { files: [file] } })
    }
  }

  const handleFinalize = async () => {
    setSaving(true)
    try {
      const payload = { ...eventData, status: 'final', quotation_items: items }
      let targetId = id
      if (id) await updateQuotation(id, payload)
      else {
        const created = await createQuotation(payload)
        targetId = created.id
      }
      navigate(`/preview/${targetId}`)
    } catch (e) {
      alert('Save failed: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="empty-state" style={{ marginTop: 80 }}>
      <div style={{ width: 40, height: 40, border: '2px solid var(--border)', borderTopColor: 'var(--text)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p className="mt-4">Loading quotation...</p>
    </div>
  )

  const summary = calcSummary(items, {
    discount_type:  eventData.discount_type,
    discount_value: eventData.discount_value,
    mgmt_value:     Math.round((eventData.mgmt_fee_rate || 0.1) * 100),
    ppn_rate:       Math.round((eventData.ppn_rate || 0.12) * 100),
  })

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }} className="fade-in">
      {/* ── BUILDER HEADER ── */}
      <header style={{ 
        padding: '32px 0 0 0', 
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg)',
      }}>
        <div className="page-fluid">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <button 
                  onClick={() => navigate('/')} 
                  className="btn-ghost" 
                  style={{ padding: '0 8px 0 0', display: 'flex', alignItems: 'center', color: 'var(--text-3)' }}
                >
                  ← Back
                </button>
                <span className="badge" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {id ? 'Project Editor' : 'New Project'}
                </span>
                <span style={{ fontSize: 13, color: 'var(--text-3)' }}>—</span>
                <span style={{ fontSize: 13, color: 'var(--text-3)' }}>{eventData.quot_number || 'REF-PENDING'}</span>
              </div>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 4 }}>
                {eventData.event_title || 'Untitled Project'}
              </h1>
              <p className="text-muted text-sm">
                {eventData.client ? `Client: ${eventData.client}` : 'Configure event details and line items'}
              </p>
            </div>
            <div style={{ minWidth: 460 }}>
              <StepBar steps={STEPS} current={step} />
            </div>
          </div>
        </div>
      </header>

      {/* ── CONTENT AREA ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Step 1 — Form */}
        {step === 0 && (
          <div style={{ padding: '64px 0', overflowY: 'auto', flex: 1 }}>
            <div className="page-wrap" style={{ maxWidth: 1000 }}>
              <div style={{ marginBottom: 32, padding: 24, background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>Start with a Template</h3>
                <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 16 }}>Choose an event type to pre-fill standard line items.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                  {EVENT_TEMPLATES.map(t => (
                    <button key={t.id} className="btn btn-surface" style={{ textAlign: 'left', padding: 12, height: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}
                      onClick={() => handleApplyTemplate(t.id)}>
                      <span style={{ fontWeight: 700, fontSize: 13 }}>{t.name}</span>
                      <span style={{ fontSize: 10, opacity: 0.6, fontWeight: 450, lineHeight: 1.4 }}>{t.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              <EventForm data={eventData} onChange={setEventData} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 48, gap: 12 }}>
                <button 
                  className="btn btn-surface btn-lg" 
                  onClick={() => fileInputRef.current?.click()}
                  title="Import from Excel directly into this draft"
                >
                  📥 Quick Import
                </button>
                <button className="btn btn-primary btn-lg"
                  disabled={!eventData.client || !eventData.event_title || !eventData.event_date}
                  onClick={() => setStep(1)}>
                  Add Line Items →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2 — Builder */}
        {step === 1 && (
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden', flexDirection: 'column' }}>
            
            {/* Vercel-style Metrics Bar */}
            <div style={{ 
              background: 'var(--bg)', borderBottom: '1px solid var(--border)',
              position: 'sticky', top: 0, zIndex: 10
            }}>
              <div className="page-fluid" style={{ display: 'flex', gap: 48, padding: '16px 0', alignItems: 'center', overflowX: 'auto' }}>
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 160 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Grand Total</span>
                  <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(summary.grandTotal)}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Modal (HPP)</span>
                  <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(summary.totalHPP)}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Net Profit</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--vercel-green)', fontFamily: 'var(--font-mono)' }}>
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(summary.netProfit || 0)}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--vercel-green)', opacity: 0.8 }}>
                      {Math.round(summary.netMarginPct || 0)}%
                    </span>
                  </div>
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {saveStatus === 'saving' && <span style={{ fontSize: 11, color: 'var(--text-3)', fontStyle: 'italic' }}>Saving draft...</span>}
                  {saveStatus === 'saved' && (
                    <span style={{ 
                      fontSize: 11, 
                      color: 'var(--vercel-green)', 
                      fontWeight: 600,
                      background: 'rgba(0, 223, 216, 0.1)',
                      padding: '2px 8px',
                      borderRadius: 4,
                      border: '1px solid rgba(0, 223, 216, 0.2)'
                    }}>
                      ✓ Draft Saved
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 4, marginRight: 16 }}>
                  <button className="btn-ghost" onClick={undo} disabled={history.length === 0} title="Undo (Ctrl+Z)" style={{ opacity: history.length === 0 ? 0.3 : 1 }}>↩️</button>
                  <button className="btn-ghost" onClick={redo} disabled={redoStack.length === 0} title="Redo (Ctrl+Y)" style={{ opacity: redoStack.length === 0 ? 0.3 : 1 }}>↪️</button>
                </div>
                <button 
                  className={`btn ${sidebarOpen ? 'btn-surface' : 'btn-primary'}`} 
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  style={{ marginRight: 8, display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  {sidebarOpen ? '← Hide Database' : '📁 Open Database'}
                </button>
                <button 
                  className="btn btn-surface" 
                  onClick={() => setShowPreview(true)}
                  style={{ marginRight: 12, display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  👁️ Preview
                </button>
                
                {/* Method 2: Excel Workflow */}
                <div style={{ display: 'flex', gap: 4, marginRight: 16, borderLeft: '1px solid var(--border)', paddingLeft: 16 }}>
                  <button className="btn btn-surface" onClick={handleExportExcel} title="Download Excel Sample/Draft">
                    📥 Export
                  </button>
                  <button className="btn btn-surface" onClick={() => fileInputRef.current?.click()} title="Import from Excel/Sheets/PDF">
                    📤 Import
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    style={{ display: 'none' }} 
                    accept=".xlsx, .xls, .csv, .pdf" 
                    onChange={handleImportExcel} 
                  />
                </div>

                <button className="btn btn-primary" onClick={() => setStep(2)}>Review Invoice →</button>
              </div>
            </div>

            <div 
              className="builder-main" 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}
            >
              {isDraggingFile && (
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  background: 'rgba(var(--vercel-blue-rgb), 0.1)',
                  border: '4px dashed var(--vercel-blue)',
                  zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backdropFilter: 'blur(4px)', pointerEvents: 'none'
                }}>
                  <div style={{ background: 'var(--bg)', padding: '24px 48px', borderRadius: 12, boxShadow: 'var(--shadow-lg)', textAlign: 'center' }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>Drop Excel file to Import</div>
                    <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 8 }}>Supports Flat & Hierarchical formats</div>
                  </div>
                </div>
              )}

              {/* Sidebar – Ratecard Browser */}
              {sidebarOpen && (
                <div style={{
                  width: 300, flexShrink: 0,
                  borderRight: '1px solid var(--border)',
                  display: 'flex', flexDirection: 'column',
                  background: 'var(--bg)',
                }}>
                  <div style={{ padding: '24px 24px 16px 0', flexShrink: 0 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                      Ratecard Database
                    </span>
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden', paddingRight: 24 }}>
                    <RatecardBrowser 
                      selectedItems={items} 
                      onAdd={handleAdd} 
                      onRemove={handleRemove} 
                      onAddBulk={(groupItems) => groupItems.forEach(handleAdd)}
                      onAddBundle={handleAddBundle}
                    />
                  </div>
                </div>
              )}

              {/* Main – Quotation Cart */}
              <div style={{ flex: 1, overflow: 'auto', padding: sidebarOpen ? '0 0 0 32px' : '0' }}>
                <QuotationCart
                  items={items}
                  onUpdate={handleUpdate}
                  onCommit={handleCommitUpdate}
                  onRemove={handleRemove}
                  onDuplicate={handleDuplicate}
                  onAddCustom={handleAddCustomItem}
                  onReorder={handleReorder}
                  onRenameSection={handleRenameSection}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3 — Summary */}
        {step === 2 && (
          <div style={{ padding: '64px 0', overflowY: 'auto', flex: 1 }}>
            <div className="page-fluid">
              <SummaryTable items={items} eventData={eventData} onEventDataChange={setEventData} />
              <div style={{ display: 'flex', gap: 16, justifyContent: 'space-between', marginTop: 48, paddingBottom: 64 }}>
                <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back to Items</button>
                <div style={{ display: 'flex', gap: 16 }}>
                  <button className="btn btn-surface btn-lg" disabled={saving} onClick={() => handleSave('draft')}>
                    Save Draft
                  </button>
                  <button className="btn btn-primary btn-lg" disabled={saving || items.length === 0} onClick={handleFinalize}>
                    {saving ? 'Saving...' : 'Finalize & Preview Export'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER NAV (Simple) */}
      {step === 1 && (
        <div style={{
          padding: '16px 0',
          borderTop: '1px solid var(--border)', background: 'var(--bg)',
        }}>
          <div className="page-fluid" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button className="btn btn-ghost" onClick={() => setStep(0)}>← Event Details</button>
            <div style={{ display: 'flex', gap: 12 }}>
               <button className="btn btn-ghost" onClick={() => handleSave('draft')}>Save Progress</button>
            </div>
          </div>
        </div>
      )}
      {/* Modal Confirmation */}
      {pendingTemplate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }}
          onClick={() => setPendingTemplate(null)}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 32, maxWidth: 440, width: '100%', boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}
            onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>Load Template?</h2>
            <p style={{ color: 'var(--text-2)', marginBottom: 24, lineHeight: 1.6 }}>
              You already have items in this quotation. Loading <strong style={{ color: 'var(--text)' }}>"{pendingTemplate.name}"</strong> will add its preset items to your current list.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-ghost flex-1" onClick={() => setPendingTemplate(null)}>Cancel</button>
              <button className="btn btn-primary flex-1" onClick={() => executeTemplate(pendingTemplate)}>Add Items Now</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmation (Custom) */}
      {confirmState && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 24 }}
             onClick={() => confirmState.onCancel()}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 40, maxWidth: 480, width: '100%', textAlign: 'center', boxShadow: '0 32px 100px rgba(0,0,0,0.6)' }}
               onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 48, marginBottom: 24 }}>⚠️</div>
            <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 16, letterSpacing: '-0.02em' }}>{confirmState.title}</h2>
            <p style={{ color: 'var(--text-2)', marginBottom: 40, fontSize: 16, lineHeight: 1.6 }}>{confirmState.message}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button 
                className="btn btn-primary btn-lg" 
                style={{ width: '100%', height: 56, fontSize: 16, fontWeight: 700 }} 
                onClick={() => confirmState.onConfirm()}
              >
                {confirmState.confirmLabel || 'Confirm'}
              </button>
              {confirmState.onCancel && (
                <button 
                  className="btn btn-ghost btn-lg" 
                  style={{ width: '100%', height: 56, fontSize: 16 }} 
                  onClick={() => confirmState.onCancel()}
                >
                  {confirmState.cancelLabel || 'Cancel'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Success */}
      {successMsg && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001, padding: 24 }}
          onClick={() => setSuccessMsg(null)}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 32, maxWidth: 400, width: '100%', textAlign: 'center', boxShadow: '0 24px 80px rgba(0,0,0,0.4)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>Success!</h2>
            <p style={{ color: 'var(--text-2)', marginBottom: 24 }}>{successMsg}</p>
            <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={() => setSuccessMsg(null)}>OK, Continue</button>
          </div>
        </div>
      )}

      {/* Live Preview Modal */}
      {showPreview && (
        <div style={{ 
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', 
          backdropFilter: 'blur(8px)', zIndex: 1100,
          display: 'flex', flexDirection: 'column'
        }}>
          <header style={{ 
            height: 64, borderBottom: '1px solid var(--border)', 
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 24px', background: 'var(--bg)'
          }}>
            <h2 style={{ fontSize: 16, fontWeight: 700 }}>Live Print Preview</h2>
            <button className="btn btn-surface" onClick={() => setShowPreview(false)}>Close Preview</button>
          </header>
          <div style={{ flex: 1, overflowY: 'auto', padding: '40px 0' }}>
            <PrintDocument quotation={{ ...eventData, quotation_items: items }} combinedMode={true} showSummary={true} />
          </div>
        </div>
      )}
    </main>
  )
}
