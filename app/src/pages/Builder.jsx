import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import StepBar from '../components/StepBar'
import EventForm from '../components/EventForm'
import RatecardBrowser from '../components/RatecardBrowser'
import QuotationCart from '../components/QuotationCart'
import SummaryTable from '../components/SummaryTable'
import PrintDocument from '../components/PrintDocument'
import { generateQuotNumber } from '../utils/fmt'
import { calcLineSell, calcLineCost, calcSummary, calcSellFromMargin, getQuotationLines } from '../utils/calc'
import { EVENT_TEMPLATES, findItemsInRatecard } from '../utils/templates'
import { useQuery, useMutation, useConvex } from "convex/react";
import { api } from "../../convex/_generated/api";
import { exportToExcelSync, importFromExcelSync } from '../utils/excelSync'
import { exportQuotationToXls } from '../utils/exportXls'
import { diceCoefficient, predictCategory } from '../utils/stringUtils'
import { usePresence } from '../hooks/usePresence'
import AIEstimatorPanel from '../components/AIEstimatorPanel'
import { suggestBundlesAI } from '../lib/aiEstimator'
import { useRef } from 'react'
import ActivitySidebar from '../components/ActivitySidebar'


const STEPS = [
  { label: 'Details', sub: 'Client & event info' },
  { label: 'Items', sub: 'Browse ratecard' },
  { label: 'Review', sub: 'Finalize & save' },
]

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

export default function Builder() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [step, setStep] = useState(() => {
    const saved = localStorage.getItem('juara_builder_step')
    return saved ? parseInt(saved, 10) : 0
  })

  // Persistence for Step
  useEffect(() => {
    localStorage.setItem('juara_builder_step', step.toString())
  }, [step])

  const [eventData, setEventData] = useState(defaultEvent)
  const { userName, activeUsers, setSelection } = usePresence(id)
  
  const [items, setItems] = useState([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(!!id)
  const [ratecardData, setRatecardData] = useState([])
  const [pendingTemplate, setPendingTemplate] = useState(null)
  const [successMsg, setSuccessMsg] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [leftSidebarTab, setLeftSidebarTab] = useState('DB') // 'DB' | 'CONFIG'
  const [isDraggingFile, setIsDraggingFile] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [confirmState, setConfirmState] = useState(null) // { title, message, onConfirm, onCancel, confirmLabel, cancelLabel }
  const [history, setHistory] = useState([])
  const [redoStack, setRedoStack] = useState([])
  const [lastSavedItems, setLastSavedItems] = useState(null)
  const [saveStatus, setSaveStatus] = useState('idle') // idle | saving | saved
  const [activeIndex, setActiveIndex] = useState(null)
  const [comments, setComments] = useState([])
  const [commentTarget, setCommentTarget] = useState(null) // row_key
  const [showHistory, setShowHistory] = useState(false)

  const [historyLogs, setHistoryLogs] = useState([])
  const [showActivities, setShowActivities] = useState(false)
  const fileInputRef = useRef(null)
  // Track which row keys are actively being typed in — protect from remote sync overwrite
  const editingKeysRef = useRef(new Set())
  const setEditingKey = (key, isEditing) => {
    if (isEditing) editingKeysRef.current.add(key)
    else editingKeysRef.current.delete(key)
  }

  // --- COLLABORATION STATE ---
  const [currentUser] = useState(() => {
    const saved = localStorage.getItem('juara_user')
    if (saved) return JSON.parse(saved)
    const newUser = {
      id: crypto.randomUUID(),
      name: 'User ' + Math.floor(Math.random() * 1000),
      color: ['#0070f3', '#00e676', '#f50057', '#ff9100', '#7c4dff', '#00bcd4', '#ffeb3b'][Math.floor(Math.random() * 7)]
    }
    localStorage.setItem('juara_user', JSON.stringify(newUser))
    return newUser
  })

  // --- CONVEX DATA FETCHING ---
  // If id is present, fetch the quotation from Convex
  const quotation = useQuery(api.quotations.get, id ? { id: id } : "skip");
  const updateQuotationMutation = useMutation(api.quotations.update);
  const createRevisionMutation = useMutation(api.revisions.create);
  const logActivityMutation = useMutation(api.activities.log);
  const fetchedActivities = useQuery(api.activities.listByQuotation, id ? { quotationId: id } : "skip") || [];
  
  const createBundleMutation = useMutation(api.masterData.createBundle);
  const addCommentMutation = useMutation(api.collaboration.addComment);
  const createCategoryMutation = useMutation(api.masterData.createCategory);
  const ratecardItems = useQuery(api.masterData.listItems) || [];
  const fetchedComments = useQuery(api.collaboration.getComments, id ? { quotationId: id } : "skip") || [];
  const fetchedRevisions = useQuery(api.revisions.list, id ? { quotationId: id } : "skip") || [];
  const convex = useConvex();

  useEffect(() => {
    if (ratecardItems.length > 0) setRatecardData(ratecardItems);
  }, [ratecardItems]);

  useEffect(() => {
    if (fetchedComments.length > 0) setComments(fetchedComments);
  }, [fetchedComments]);

  useEffect(() => {
    if (fetchedRevisions.length > 0) setHistoryLogs(fetchedRevisions);
  }, [fetchedRevisions]);

  useEffect(() => {
    if (quotation && !saving) {
      // SMART SYNC V4: Key-based merging with per-row edit lock
      setItems(prev => {
        const remoteItems = quotation.items || []
        if (prev.length === 0) return remoteItems
        
        // 1. Create a map of remote items for quick lookup
        const remoteMap = new Map(remoteItems.map(it => [it._ratecard_key, it]))
        
        // 2. Map existing local items: update with remote data unless actively being edited
        const updatedLocal = prev.map((localIt, idx) => {
          const remoteIt = remoteMap.get(localIt._ratecard_key)
          if (!remoteIt) return localIt // Item only exists locally (newly added)
          // Protect row if: it's the active table row OR user is actively typing in it
          if (idx === activeIndex) return localIt
          if (editingKeysRef.current.has(localIt._ratecard_key)) return localIt
          return remoteIt
        })

        // 3. Find items that exist on remote but not locally (added by others)
        const localKeys = new Set(prev.map(it => it._ratecard_key))
        const itemsFromRemote = remoteItems.filter(it => !localKeys.has(it._ratecard_key))

        // 4. Combine and sort
        return [...updatedLocal, ...itemsFromRemote].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      })

      setEventData(prev => ({
        ...prev,
        title: quotation.title || prev.title,
        client_name: quotation.client_name || prev.client_name,
        event_date: quotation.event_date || prev.event_date,
        venue: quotation.venue || prev.venue,
        city: quotation.city || prev.city,
        signatory: quotation.signatory || prev.signatory,
        quot_number: quotation.quot_number || prev.quot_number,
        discount_type: quotation.discount_type || prev.discount_type,
        discount_value: quotation.discount_value || prev.discount_value,
        ppn_rate: quotation.ppn_rate ?? prev.ppn_rate,
        mgmt_fee_rate: quotation.mgmt_fee_rate ?? prev.mgmt_fee_rate,
        notes: quotation.notes || prev.notes,
        status: quotation.status || prev.status,
      }))
      setLoading(false)
      setSaveStatus('saved')
    }
  }, [quotation, activeIndex, saving])

  useEffect(() => {
    // Check for import success from Dashboard
    if (location.state?.importSuccess) {
      setSuccessMsg(`Imported ${location.state.itemCount} items across ${location.state.sections} sections successfully.`)
      // Clear location state so it doesn't show again on refresh
      window.history.replaceState({}, document.title)
    }
  }, [id])

  // --- AUTO-SAVE DEBOUNCED ---
  useEffect(() => {
    if (items.length === 0 || loading || saving) return
    
    const timer = setTimeout(() => {
      console.log('[Sync] Auto-saving changes...')
      handleCommitUpdate(items)
    }, 1500) // Save after 1.5s of inactivity

    return () => clearTimeout(timer)
  }, [items])

  // --- REAL-TIME STATUS ---
  // --- REAL-TIME STATUS ENGINE ---
  const realtimeStatus = quotation === undefined ? 'connecting' : (quotation ? 'online' : 'error');
  // Optional: check convex client status if needed for deeper info
  // const isConvexConnected = convex.status === "connected";

  // --- BUNDLE MANAGEMENT ---
  const handleSaveAsBundle = async (name, description) => {
    if (items.length === 0) return
    const bundle = {
      name,
      description,
      items: items.map(it => ({
        item_code: it.item_code,
        item_name: it.item_name,
        quantity: it.qty,
        note: it.spec
      }))
    }
    await createBundleMutation(bundle)
    setSuccessMsg('Saved as Global Bundle!')
  }

  // --- AUTO-SAVE & NAVIGATION GUARD ---
  const handleCommitUpdate = async (latestItems = items) => {
    if (!id) return
    setSaveStatus('saving')
    try {
      // Calculate summary locally based on latest data to ensure totals are correct
      const currentSummary = calcSummary(latestItems, {
        discount_type: eventData.discount_type,
        discount_value: eventData.discount_value,
        ppn_rate: eventData.ppn_rate,
        mgmt_fee_rate: eventData.mgmt_fee_rate
      })

      const payload = {
        items: latestItems,
        title: eventData.title || 'Untitled Project',
        client_name: eventData.client_name || '',
        event_date: eventData.event_date || '',
        venue: eventData.venue || '',
        city: eventData.city || '',
        signatory: eventData.signatory || '',
        quot_number: eventData.quot_number || '',
        total_cost: currentSummary.totalHPP || 0,
        total_sell: currentSummary.grandTotal || 0,
        margin: currentSummary.grossMarginPct || 0,
        discount_type: eventData.discount_type || 'amt',
        discount_value: eventData.discount_value || 0,
        ppn_rate: eventData.ppn_rate || 0.12,
        mgmt_fee_rate: eventData.mgmt_fee_rate || 0.10,
        notes: eventData.notes || []
      }

      await updateQuotationMutation({
        id: id,
        updates: payload
      })
      
      setSaveStatus('saved')
      console.log('[Sync] Successfully saved to cloud')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (err) {
      setSaveStatus('idle')
      console.error('[Sync] Save error:', err)
    }
  }

  // --- AUTO-JUMP TO ITEMS IF DATA EXISTS ---
  useEffect(() => {
    if (items.length > 0 && step === 0) {
      setStep(1) // Jump to Items Builder if we already have items
    }
  }, [items.length, step])

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
    const key = `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

    const sectionName = ratecardItem.category || 'A. SETUP & SYSTEM'
    const sectionCode = sectionName.split('.')[0] || 'A'

    const newItem = {
      _ratecard_key: key,
      item_code: ratecardItem.item_code,
      section_code: sectionCode,
      section_name: sectionName,
      category: ratecardItem.category,
      sub_category: ratecardItem.sub_category || '',
      item_name: ratecardItem.item_name,
      spec: ratecardItem.remarks || '',
      qty: 1,
      qty_unit: ratecardItem.unit || 'unit',
      freq: 1,
      freq_unit: 'evt',
      unit_cost: ratecardItem.unit_cost || 0,
      unit_sell: ratecardItem.unit_sell || 0,
      is_complimentary: false,
    }

    if (activeIndex !== null && activeIndex >= 0) {
      const newItems = [...items]
      newItems.splice(activeIndex + 1, 0, newItem)
      saveHistory(newItems)
      setItems(newItems)
      setActiveIndex(activeIndex + 1) // Move selection to newly added item
    } else {
      saveHistory([...items, newItem])
      setItems(prev => [...prev, newItem])
    }

    if (id) {
      logActivityMutation({
        quotationId: id,
        userName: userName,
        type: 'add',
        description: `added item "${ratecardItem.item_name}"`
      })
    }
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

          const sectionName = rcItem.category || 'A. SETUP & SYSTEM'
          const sectionCode = sectionName.split('.')[0] || 'A'

          newItems.push({
            _ratecard_key: key,
            item_code: rcItem.item_code,
            section_code: sectionCode,
            section_name: sectionName,
            category: rcItem.category || 'Standard',
            sub_category: rcItem.sub_category || '',
            item_name: rcItem.item_name,
            spec: rcItem.remarks || '',
            qty: item.quantity || 1,
            qty_unit: rcItem.unit || 'unit',
            freq: 1,
            freq_unit: 'evt',
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
    const bundleParentKey = `bundle-parent-${bundle.id}-${Date.now()}`
    const newAddition = []

    // 1. Create a "Parent Heading" for the Bundle
    const parentRow = {
      _ratecard_key: bundleParentKey,
      item_name: bundle.name,
      spec: bundle.description || 'Package Bundle',
      section_code: 'A', // Default, user can change
      section_name: 'A. PREPARATIONS',
      category: 'Package',
      qty: 1,
      qty_unit: 'pkg',
      duration_qty: 1,
      duration_unit: 'event',
      unit_cost: 0,
      unit_sell: 0,
      is_bundle_parent: true,
      sort_order: items.length
    }

    newAddition.push(parentRow)

    // 2. Add children items
    bundle.items.forEach((bi, idx) => {
      const rcItem = ratecardData.find(r => r.item_code === bi.item_code)
      if (rcItem) {
        const key = `bundle-item-${bundle.id}-${bi.item_code}-${Date.now()}-${idx}`
        const mCost = rcItem.unit_cost || (rcItem.unit_price ? Math.round(rcItem.unit_price / 1.25) : 0)
        const mSell = rcItem.unit_sell || rcItem.unit_price || 0

        newAddition.push({
          _ratecard_key: key,
          parent_id: bundleParentKey, // Link to parent
          item_code: rcItem.item_code,
          section_code: parentRow.section_code,
          section_name: parentRow.section_name,
          category: rcItem.category || 'Component',
          item_name: rcItem.item_name,
          spec: rcItem.description || bi.note || '',
          qty: bi.quantity || 1,
          qty_unit: rcItem.default_unit || bi.qty_unit || 'unit',
          duration_qty: bi.duration || 1,
          duration_unit: bi.dur_unit || 'day',
          frequency_qty: 1,
          frequency_unit: 'event',
          unit_cost: mCost,
          unit_sell: mSell,
          is_complimentary: false,
          sort_order: items.length + newAddition.length,
        })
      }
    })

    if (newAddition.length > 0) {
      const updated = [...items, ...newAddition]
      saveHistory(updated)
      setItems(updated)
      setSuccessMsg(`Berhasil menambahkan paket "${bundle.name}" ke tabel.`)
    }
  }

  const handleRemove = (key) => {
    const removedItem = items.find(i => i._ratecard_key === key)
    const updated = items.filter(i => i._ratecard_key !== key)
    saveHistory(updated)
    setItems(updated)
    if (id) {
      logActivityMutation({
        quotationId: id,
        userName: userName,
        type: 'delete',
        description: `removed item "${removedItem?.item_name || 'unknown'}"`
      })
    }
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

  const handleSaveRevision = async () => {
    if (!id || !quotation) return;

    const note = window.prompt('Enter a note for this revision:', 'Draft update');
    if (note === null) return;

    setSaving(true);
    try {
      await createRevisionMutation({
        quotationId: id,
        note: note || 'Manual Revision',
        snapshot: {
          items: items,
          eventData: eventData,
        },
        changedBy: currentUser.name
      });
      setSuccessMsg('Revision created successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Failed to create revision:', err);
      alert('Error saving revision');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (status = 'draft') => {
    setSaving(true)
    try {
      const payload = {
        status,
        items,
        title: eventData.title || 'Untitled Project',
        client_name: eventData.client_name || '',
        event_date: eventData.event_date || '',
        venue: eventData.venue || '',
        city: eventData.city || '',
        signatory: eventData.signatory || '',
        quot_number: eventData.quot_number || `QUOT-${Date.now().toString().slice(-6)}`,
        total_cost: summary.totalHPP || 0,
        total_sell: summary.grandTotal || 0,
        margin: summary.grossMarginPct || 0,
        discount_type: eventData.discount_type || 'amt',
        discount_value: eventData.discount_value || 0,
        ppn_rate: eventData.ppn_rate || 0.12,
        mgmt_fee_rate: eventData.mgmt_fee_rate || 0.10,
        notes: eventData.notes || []
      }

      if (id) {
        await updateQuotationMutation({
          id,
          updates: payload
        })
        setSuccessMsg('Changes saved')
      } else {
        const createdId = await convex.mutation(api.quotations.create, payload)
        navigate(`/edit/${createdId}`)
        setSuccessMsg('New quotation created and saved')
      }
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) {
      console.error(err)
      alert('Save failed: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleExportExcel = () => {
    exportQuotationToXls({ ...eventData, items })
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
          const sectionName = match.category || item.section_name || 'A. SETUP & SYSTEM'
          const sectionCode = sectionName.split('.')[0] || 'A'

          return {
            ...item,
            category: match.category || item.category,
            section_code: sectionCode,
            section_name: sectionName,
            unit_cost: match.unit_cost || 0,
            qty_unit: match.unit || item.qty_unit,
            unit_sell: item.unit_sell || match.unit_sell || 0,
            _matched_fuzzy: true // simplify flag
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

      const migrationMap = {
        'Per Diem': { category: 'Manpower / Crew', sub: 'Crew Welfare' },
        'Transport': { category: 'Transportation / Logistics', sub: 'Logistics Support' },
        'Konsumsi': { category: 'Accommodation / Consumption', sub: 'Catering' },
        'ATK': { category: 'Venue / Setup / System', sub: 'Secretariat Support' },
        'Laptop': { category: 'Venue / Setup / System', sub: 'Secretariat Support' },
        'Printer': { category: 'Venue / Setup / System', sub: 'Secretariat Support' },
        'HT': { category: 'Venue / Setup / System', sub: 'Communication System' },
        'Ongkir': { category: 'Transportation / Logistics', sub: 'Shipping' },
        'Ongkos Pasang': { category: 'Production / Fabrication', sub: 'Installation' },
        'Lem dan Double Tape': { category: 'Production / Fabrication', sub: 'Consumables' }
      };

      const finalEnrichedItems = enrichedItems.map(i => {
        const isLegacyCat =
          (i.section_name || '').toLowerCase().includes('misc') ||
          (i.category || '').toLowerCase().includes('misc') ||
          i.section_code === 'Misc';

        if (isLegacyCat) {
          const match = migrationMap[i.item_name] || { category: 'Venue / Setup / System', sub: 'Additional Items' };
          return {
            ...i,
            section_code: match.category.split(' ')[0].toUpperCase().slice(0, 3),
            section_name: match.category,
            category: match.category,
            sub_category: match.sub || i.sub_category
          };
        }
        return i;
      });

      // Auto-Category Creation
      const newCats = [...new Set(finalEnrichedItems.map(i => i.section_name || i.category).filter(Boolean))]
      const categories = await convex.query(api.masterData.listCategories)
      const existingCatsList = categories.map(c => c.name)

      for (const catName of newCats) {
        if (!existingCatsList.includes(catName)) {
          await createCategoryMutation({ name: catName })
        }
      }

      if (id) {
        await updateQuotationMutation({
          id: id,
          updates: { items: finalEnrichedItems }
        })
      }
      setSaving(false)

      saveHistory(finalEnrichedItems)
      setItems(finalEnrichedItems)

      const sections = [...new Set(enrichedItems.map(i => i.section_name))].length
      setSuccessMsg(`Successfully imported ${enrichedItems.length} items across ${sections} sections. Matched ${enrichedItems.filter(i => i.unit_cost > 0).length} items with Ratecard database.`)
      localStorage.removeItem('juara_quotation_draft')
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
      const payload = {
        status: 'final',
        items,
        title: eventData.title || 'Untitled Project',
        client_name: eventData.client_name || '',
        event_date: eventData.event_date || '',
        venue: eventData.venue || '',
        city: eventData.city || '',
        signatory: eventData.signatory || '',
        quot_number: eventData.quot_number || `QUOT-${Date.now().toString().slice(-6)}`,
        total_cost: summary.totalHPP || 0,
        total_sell: summary.grandTotal || 0,
        margin: summary.grossMarginPct || 0,
        discount_type: eventData.discount_type || 'amt',
        discount_value: eventData.discount_value || 0,
        ppn_rate: eventData.ppn_rate || 0.12,
        mgmt_fee_rate: eventData.mgmt_fee_rate || 0.10,
        notes: eventData.notes || []
      }

      let targetId = id
      if (id) {
        await updateQuotationMutation({
          id: id,
          updates: payload
        })
      } else {
        const createdId = await convex.mutation(api.quotations.create, payload)
        navigate(`/edit/${createdId}`)
        targetId = createdId
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
    discount_type: eventData.discount_type,
    discount_value: eventData.discount_value,
    mgmt_value: Math.round((eventData.mgmt_fee_rate || 0.1) * 100),
    ppn_rate: Math.round((eventData.ppn_rate || 0.12) * 100),
  })

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }} className="fade-in">
      {/* EMERGENCY CLEANUP BANNER */}
      {(items || []).some(i => (i.section_name || '').toLowerCase().includes('misc') || (i.category || '').toLowerCase().includes('misc')) && (
        <div style={{
          background: '#fef3c7', padding: '12px 24px', borderBottom: '1px solid #fde68a',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 1000
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#92400e' }}>
            ⚠️ Deteksi Kategori Lama: Beberapa item Anda masih menggunakan kategori "Miscellaneous".
          </span>
          <button
            onClick={() => {
              const migrationMap = {
                'Per Diem': { category: 'Manpower / Crew', sub: 'Crew Welfare' },
                'Transport': { category: 'Transportation / Logistics', sub: 'Logistics Support' },
                'Konsumsi': { category: 'Accommodation / Consumption', sub: 'Catering' },
                'ATK': { category: 'Venue / Setup / System', sub: 'Secretariat Support' },
                'Laptop': { category: 'Venue / Setup / System', sub: 'Secretariat Support' },
                'Printer': { category: 'Venue / Setup / System', sub: 'Secretariat Support' },
                'HT': { category: 'Venue / Setup / System', sub: 'Communication System' },
                'Ongkir': { category: 'Transportation / Logistics', sub: 'Shipping' },
                'Ongkos Pasang': { category: 'Production / Fabrication', sub: 'Installation' },
                'Lem dan Double Tape': { category: 'Production / Fabrication', sub: 'Consumables' }
              };
              const cleaned = items.map(i => {
                const isLegacy = (i.section_name || '').toLowerCase().includes('misc') || (i.category || '').toLowerCase().includes('misc');
                if (isLegacy) {
                  const match = migrationMap[i.item_name] || { category: 'Venue / Setup / System', sub: 'Additional Items' };
                  return {
                    ...i,
                    section_code: match.category.split(' ')[0].toUpperCase().slice(0, 3),
                    section_name: match.category,
                    category: match.category,
                    sub_category: match.sub || i.sub_category
                  };
                }
                return i;
              });
              setItems(cleaned);
              saveHistory(cleaned);
              setSuccessMsg('Kategori lama berhasil dibersihkan!');
            }}
            className="btn btn-primary btn-sm" style={{ padding: '6px 16px', fontSize: 12, background: '#d97706', border: 'none' }}>
            Klik untuk Bersihkan Sekarang
          </button>
        </div>
      )}
      {/* ── BUILDER HEADER ── */}
      <header style={{
        padding: '32px 0 0 0',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg)',
      }}>
        <div className="page-fluid" style={{ padding: '0 32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <button
                  onClick={() => navigate('/')}
                  className="btn-ghost"
                  style={{ padding: '0 8px 0 0', display: 'flex', alignItems: 'center', color: 'var(--text-3)', fontSize: 13 }}
                >
                  ← Back
                </button>
                <span className="badge" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {id ? 'Project Editor' : 'New Project'}
                </span>
                
                {/* Presence List */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 8 }}>
                  <div style={{ 
                    width: 24, height: 24, borderRadius: '50%', background: 'var(--accent)', 
                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    fontSize: 10, fontWeight: 700, border: '2px solid var(--bg)'
                  }} title={`You (${userName})`}>
                    {userName[0]?.toUpperCase()}
                  </div>
                  {activeUsers.map(u => (
                    <div 
                      key={u._id} 
                      onClick={() => {
                        if (u.selection) {
                          const [rowKey] = u.selection.split(':')
                          const el = document.querySelector(`[data-row-key="${rowKey}"]`)
                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
                        }
                      }}
                      style={{ 
                        width: 24, height: 24, borderRadius: '50%', background: 'var(--surface)', 
                        color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        fontSize: 10, fontWeight: 700, border: '2px solid var(--vercel-green)',
                        cursor: 'pointer'
                      }} 
                      title={`Click to Follow ${u.user_name}`}
                    >
                      {u.user_name[0]?.toUpperCase()}
                    </div>
                  ))}
                  {activeUsers.length > 0 && (
                    <span style={{ fontSize: 9, color: 'var(--vercel-green)', fontWeight: 700, marginLeft: 4 }}>
                      • LIVE
                    </span>
                  )}
                </div>

                <span style={{ fontSize: 13, color: 'var(--text-3)', marginLeft: 8 }}>—</span>
                <span style={{ fontSize: 13, color: 'var(--text-3)' }}>{eventData.quot_number || 'REF-PENDING'}</span>
                <span className="badge badge-success" style={{ marginLeft: 12, fontSize: 9, background: 'rgba(0, 112, 243, 0.1)', color: 'var(--vercel-blue)', border: '1px solid rgba(0, 112, 243, 0.2)' }}>
                  V2.4 COLLABORATIVE
                </span>
              </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.03em' }}>
                    {eventData.title || 'Untitled Quotation'}
                  </h1>
                  <span style={{ 
                    fontSize: 10, background: 'var(--bg-2)', padding: '2px 8px', 
                    borderRadius: 4, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' 
                  }}>
                    ID: {id?.slice(-6)}
                  </span>
                </div>
              <p className="text-muted text-sm">
                {eventData.client_name ? `Client: ${eventData.client_name}` : 'Configure event details and line items'}
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
                  disabled={!eventData.client_name || !eventData.title || !eventData.event_date}
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
              <div className="page-fluid" style={{ display: 'flex', gap: 24, padding: '12px 32px', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 1 }}>Grand Total</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(summary.grandTotal)}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 1 }}>Modal (HPP)</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(summary.totalHPP)}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 1 }}>Net Profit</span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--vercel-green)', fontFamily: 'var(--font-mono)' }}>
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(summary.netProfit || 0)}
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--vercel-green)', opacity: 0.8 }}>
                      {Math.round(summary.netMarginPct || 0)}%
                    </span>
                  </div>
                </div>

                {/* Collaboration Avatars (Disabled for now) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="badge badge-surface" style={{ padding: '6px 12px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)' }} />
                    <span>Real-time Sync Active</span>
                  </div>
                </div>

                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'flex-end' }}>
                  <div style={{ 
                    display: 'flex', alignItems: 'center', gap: 6, 
                    padding: '4px 10px', borderRadius: 6,
                    background: 'var(--bg-2)', border: '1px solid var(--border)',
                    opacity: saveStatus === 'idle' ? 0.3 : 1,
                    transition: 'opacity 0.3s ease'
                  }}>
                    {saveStatus === 'saving' ? (
                      <div className="saving-spinner" style={{ width: 10, height: 10, borderWeight: 1.5 }} />
                    ) : (
                      <span style={{ fontSize: 12, color: saveStatus === 'saved' ? 'var(--vercel-green)' : 'var(--text-3)' }}>
                        ☁️
                      </span>
                    )}
                    <span style={{ fontSize: 9, fontWeight: 500, color: 'var(--text-3)', letterSpacing: '0.02em' }}>
                      {saveStatus === 'saving' ? 'SYNCING' : 'SYNCED'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 2, marginRight: 8, borderLeft: '1px solid var(--border)', paddingLeft: 12 }}>
                    <button className="btn-ghost" onClick={undo} disabled={history.length === 0} title="Undo (Ctrl+Z)" style={{ opacity: history.length === 0 ? 0.3 : 1, padding: '4px' }}>↩️</button>
                    <button className="btn-ghost" onClick={redo} disabled={redoStack.length === 0} title="Redo (Ctrl+Y)" style={{ opacity: redoStack.length === 0 ? 0.3 : 1, padding: '4px' }}>↪️</button>
                    <button className="btn-ghost" onClick={() => {
                      setShowHistory(true)
                    }} title="Version History" style={{ padding: '4px' }}>🕒</button>
                    <button className="btn-ghost" onClick={() => {
                      setShowActivities(!showActivities)
                    }} title="Activity Log" style={{ padding: '4px', filter: showActivities ? 'drop-shadow(0 0 2px var(--vercel-green))' : 'none' }}>📜</button>
                  </div>

                  <button
                    className={`btn btn-sm ${sidebarOpen ? 'btn-surface' : 'btn-primary'}`}
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    style={{ fontSize: 11, padding: '4px 10px' }}
                  >
                    {sidebarOpen ? 'Hide DB' : '📁 DB'}
                  </button>

                  <button
                    className="btn btn-sm btn-surface"
                    onClick={() => handleSave('draft')}
                    disabled={saving}
                    style={{ fontSize: 11, padding: '4px 10px', color: 'var(--vercel-blue)', fontWeight: 700 }}
                  >
                    {saving ? 'Saving...' : '💾 Save'}
                  </button>

                  <button
                    className="btn btn-sm btn-surface"
                    onClick={() => setShowPreview(true)}
                    style={{ fontSize: 11, padding: '4px 10px' }}
                  >
                    👁️ Preview
                  </button>

                  <div style={{ display: 'flex', gap: 4, borderLeft: '1px solid var(--border)', paddingLeft: 12 }}>
                    <button className="btn btn-sm btn-surface" onClick={handleExportExcel} style={{ fontSize: 11, padding: '4px 10px' }}>
                      📥 Exp
                    </button>
                    <button className="btn btn-sm btn-surface" onClick={() => fileInputRef.current?.click()} style={{ fontSize: 11, padding: '4px 10px' }}>
                      📤 Imp
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      accept=".xlsx, .xls, .csv, .pdf"
                      onChange={handleImportExcel}
                    />
                  </div>

                  <button className="btn btn-sm btn-primary" onClick={() => setStep(2)} style={{ fontSize: 11, padding: '4px 12px', marginLeft: 8 }}>
                    Invoice →
                  </button>
                </div>
              </div>
            </div>

            <div
              className="builder-main"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative', padding: '0 32px 32px 32px' }}
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

              {/* Left Sidebar (Database & Config) */}
              {sidebarOpen && (
                <div style={{
                  width: 320,
                  borderRight: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'var(--bg-2)',
                  flexShrink: 0
                }}>
                  <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
                    <button
                      onClick={() => setLeftSidebarTab('DB')}
                      style={{
                        flex: 1, padding: '12px 0', fontSize: 11, fontWeight: 700,
                        color: leftSidebarTab === 'DB' ? 'var(--text)' : 'var(--text-3)',
                        border: 'none', borderBottom: leftSidebarTab === 'DB' ? '2px solid var(--text)' : '2px solid transparent',
                        background: 'transparent', cursor: 'pointer'
                      }}
                    >
                      DATABASE
                    </button>
                    <button
                      onClick={() => setLeftSidebarTab('CONFIG')}
                      style={{
                        flex: 1, padding: '12px 0', fontSize: 11, fontWeight: 700,
                        color: leftSidebarTab === 'CONFIG' ? 'var(--text)' : 'var(--text-3)',
                        border: 'none', borderBottom: leftSidebarTab === 'CONFIG' ? '2px solid var(--text)' : '2px solid transparent',
                        background: 'transparent', cursor: 'pointer'
                      }}
                    >
                      CONFIG
                    </button>
                  </div>

                  <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                    {leftSidebarTab === 'DB' ? (
                      <RatecardBrowser selectedItems={items} onAdd={handleAdd} onAddBundle={handleAddBundle} />
                    ) : (
                      <div style={{ padding: '24px' }}>
                        {/* Financial Config */}
                        <div style={{ marginBottom: 32 }}>
                          <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-3)', marginBottom: 16 }}>Financial Config</h3>

                          <div className="form-group" style={{ marginBottom: 16 }}>
                            <label className="form-label" style={{ fontSize: 10 }}>Management Fee (%)</label>
                            <input type="number"
                              value={Math.round((eventData.mgmt_fee_rate ?? 0.10) * 100)}
                              onChange={e => setEventData({ ...eventData, mgmt_fee_rate: Number(e.target.value) / 100 })}
                              className="form-input" style={{ fontSize: 13, height: 32, fontFamily: 'var(--font-mono)' }} />
                          </div>

                          <div className="form-group" style={{ marginBottom: 16 }}>
                            <label className="form-label" style={{ fontSize: 10 }}>VAT / PPN (%)</label>
                            <input type="number"
                              value={Math.round((eventData.ppn_rate ?? 0.12) * 100)}
                              onChange={e => setEventData({ ...eventData, ppn_rate: Number(e.target.value) / 100 })}
                              className="form-input" style={{ fontSize: 13, height: 32, fontFamily: 'var(--font-mono)' }} />
                          </div>

                          <div className="form-group">
                            <label className="form-label" style={{ fontSize: 10 }}>Discount (Nominal)</label>
                            <input type="number"
                              value={eventData.discount_value ?? 0}
                              onChange={e => setEventData({ ...eventData, discount_value: Number(e.target.value) })}
                              className="form-input" style={{ fontSize: 13, height: 32, fontFamily: 'var(--font-mono)' }} />
                          </div>
                        </div>

                        {/* Project Header */}
                        <div style={{ marginBottom: 32 }}>
                          <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-3)', marginBottom: 16 }}>Project Header</h3>
                          <div className="form-group" style={{ marginBottom: 12 }}>
                            <label className="form-label" style={{ fontSize: 10 }}>Client</label>
                            <input value={eventData.client_name || ''}
                              onChange={e => setEventData({ ...eventData, client_name: e.target.value })}
                              className="form-input" style={{ fontSize: 12, height: 32 }} />
                          </div>
                          <div className="form-group" style={{ marginBottom: 12 }}>
                            <label className="form-label" style={{ fontSize: 10 }}>Title</label>
                            <input value={eventData.title || ''}
                              onChange={e => setEventData({ ...eventData, title: e.target.value })}
                              className="form-input" style={{ fontSize: 12, height: 32 }} />
                          </div>
                          <div className="form-group">
                            <label className="form-label" style={{ fontSize: 10 }}>Terms & Conditions</label>
                            <textarea
                              value={(eventData.notes || []).join('\n')}
                              onChange={e => setEventData({ ...eventData, notes: e.target.value.split('\n') })}
                              className="form-input"
                              style={{ fontSize: 11, lineHeight: 1.4, resize: 'vertical', minHeight: 80 }}
                              placeholder="One term per line..."
                            />
                          </div>
                        </div>

                        {/* BUNDLE ACTIONS */}
                        <div style={{ marginBottom: 32, padding: 16, background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)' }}>
                          <h3 style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 12 }}>Save as Template</h3>
                          <p style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 12 }}>Save all current items as a shared bundle for future use.</p>
                          <button
                            onClick={() => {
                              const name = prompt('Enter Bundle Name:', eventData.title + ' Package')
                              if (name) handleSaveAsBundle(name, 'Shared from ' + (eventData.client_name || 'Project'))
                            }}
                            className="btn btn-ghost" style={{ width: '100%', fontSize: 11, border: '1px dashed var(--border)' }}>
                            📦 Save as Global Bundle
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <QuotationCart
                  items={items}
                  activeIndex={activeIndex}
                  onSetActive={setActiveIndex}
                  onUpdate={handleUpdate}
                  onCommit={() => handleCommitUpdate(items)}
                  onRemove={handleRemove}
                  onDuplicate={handleDuplicate}
                  onAddCustom={handleAddCustomItem}
                  onReorder={handleReorder}
                  onRenameSection={handleRenameSection}
                  onEditingKey={setEditingKey}
                  remoteCursors={activeUsers.reduce((acc, u) => {
                    if (u.selection) {
                      const [rowId, colId] = u.selection.split(':')
                      acc[u._id] = { 
                        userName: u.user_name, 
                        userColor: u.user_name === 'Rama' ? '#ff0055' : '#0070f3',
                        rowId, colId 
                      }
                    }
                    return acc
                  }, {})}
                  onFocusCell={(rowId, colId) => setSelection(`${rowId}:${colId}`)}
                  comments={comments}
                  onComment={(key) => setCommentTarget(key)}
                />
              </div>
            </div>
          </div>
        )}

        {/* COMMENT SIDEBAR */}
        {commentTarget && (
          <CommentSidebar
            rowKey={commentTarget}
            itemName={items.find(i => i._ratecard_key === commentTarget)?.item_name}
            comments={comments.filter(c => c.row_key === commentTarget)}
            currentUser={currentUser}
            onAdd={async (content) => {
              await addCommentMutation({
                quotationId: id,
                rowKey: commentTarget,
                userName: currentUser.name,
                text: content
              })
            }}
            onClose={() => setCommentTarget(null)}
          />
        )}

        {/* ACTIVITY SIDEBAR */}
        {showActivities && (
          <ActivitySidebar
            activities={fetchedActivities}
            onClose={() => setShowActivities(false)}
          />
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
                  <button className="btn btn-surface btn-lg" onClick={() => exportQuotationToXls({ ...eventData, items })}>
                    📊 Export XLS
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
              <button className="btn btn-ghost" onClick={handleSaveRevision} disabled={saving}>💾 Create Revision</button>
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
      {/* VERSION HISTORY MODAL (Vercel Style Activity) */}
      {showHistory && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: 'var(--bg)', borderRadius: 20, border: '1px solid var(--border)', width: '100%', maxWidth: 520, maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 30px 100px rgba(0,0,0,0.7)' }}>
            <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-2)' }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 900, letterSpacing: '-0.02em' }}>Activity & Versions</h2>
                <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Audit log of all changes to this quotation</p>
              </div>
              <button onClick={() => setShowHistory(false)} className="btn btn-ghost" style={{ fontSize: 20 }}>✕</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '32px', position: 'relative' }}>
              {/* Vertical Line */}
              <div style={{ position: 'absolute', left: 47, top: 40, bottom: 40, width: 2, background: 'var(--border)', opacity: 0.5 }}></div>

              {historyLogs.length === 0 && <p style={{ textAlign: 'center', padding: 60, opacity: 0.5, fontSize: 13 }}>No history records found.</p>}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                {historyLogs.map((log, idx) => (
                  <div key={log.id} style={{ display: 'flex', gap: 20, position: 'relative', zIndex: 1 }}>
                    {/* User Avatar / Icon */}
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: idx === 0 ? 'var(--vercel-blue)' : 'var(--surface)',
                      color: idx === 0 ? 'white' : 'var(--text-2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 900, border: '4px solid var(--bg)',
                      flexShrink: 0, boxShadow: '0 0 0 1px var(--border)'
                    }}>
                      {idx === 0 ? '✨' : (log.changed_by?.charAt(0) || 'U')}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 13, fontWeight: 800 }}>{idx === 0 ? 'Current Snapshot' : `Version ${log.version_no}`}</span>
                            {idx === 0 && <span className="badge" style={{ fontSize: 8, background: 'rgba(0, 230, 118, 0.1)', color: 'var(--vercel-green)', border: 'none' }}>LATEST</span>}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
                            {log.changed_by} • {new Date(log.changed_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        {idx !== 0 && (
                          <button className="btn btn-surface btn-sm" style={{ padding: '4px 12px', fontSize: 10, fontWeight: 700 }} onClick={() => {
                            if (confirm('Restore this version? Current changes will be overwritten.')) {
                              setItems(log.snapshot_data)
                              setShowHistory(true) // keep it open to show success
                              setSuccessMsg(`Restored to Version ${log.version_no}`)
                            }
                          }}>Restore</button>
                        )}
                      </div>

                      <div style={{
                        marginTop: 12, padding: '10px 14px', borderRadius: 10,
                        background: 'var(--bg-2)', border: '1px solid var(--border)',
                        fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5
                      }}>
                        {log.change_note}
                        <div style={{ fontSize: 9, opacity: 0.5, marginTop: 4, fontStyle: 'italic' }}>
                          {Array.isArray(log.snapshot_data) ? `${log.snapshot_data.length} items captured` : 'Full state snapshot'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding: 24, borderTop: '1px solid var(--border)', background: 'var(--bg-2)', display: 'flex', justifyContent: 'center' }}>
              <button className="btn btn-ghost" onClick={() => setShowHistory(false)} style={{ fontSize: 12, fontWeight: 600 }}>Close Activity Log</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

function CommentSidebar({ rowKey, itemName, comments, currentUser, onAdd, onClose }) {
  const [text, setText] = useState('')
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [comments])

  const submit = () => {
    if (!text.trim()) return
    onAdd(text)
    setText('')
  }

  return (
    <div style={{
      position: 'fixed', right: 0, top: 0, bottom: 0, width: 320,
      background: 'var(--bg)', borderLeft: '1px solid var(--border)',
      boxShadow: '-10px 0 30px rgba(0,0,0,0.3)', zIndex: 1000,
      display: 'flex', flexDirection: 'column'
    }}>
      <div style={{ padding: 20, borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h4 style={{ fontSize: 13, fontWeight: 700 }}>Item Comments</h4>
          <p style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 4 }}>{itemName}</p>
        </div>
        <button onClick={onClose} className="btn btn-ghost" style={{ padding: 4 }}>✕</button>
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {comments.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: 40, opacity: 0.3 }}>
            <div style={{ fontSize: 32 }}>💬</div>
            <p style={{ fontSize: 11 }}>No comments yet</p>
          </div>
        )}
        {comments.map((c, i) => {
          const isMe = c.user_name === currentUser.name
          return (
            <div key={i} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
              <div style={{ fontSize: 9, color: 'var(--text-3)', marginBottom: 4, textAlign: isMe ? 'right' : 'left' }}>
                {c.user_name} • {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div style={{
                background: isMe ? 'var(--vercel-blue)' : 'var(--surface)',
                color: isMe ? 'white' : 'var(--text)',
                padding: '8px 12px', borderRadius: 12, fontSize: 11, lineHeight: 1.4,
                boxShadow: 'var(--shadow-sm)'
              }}>
                {c.text}
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ padding: 20, borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), submit())}
          placeholder="Write a comment..."
          className="form-input"
          style={{ width: '100%', fontSize: 12, minHeight: 60, padding: 10, marginBottom: 10, resize: 'none' }}
        />
        <button onClick={submit} className="btn btn-primary" style={{ width: '100%', height: 36, fontSize: 12 }}>
          Send Message
        </button>
      </div>
    </div>
  )
}

