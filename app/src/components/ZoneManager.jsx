import { useState, useEffect, useRef } from 'react'
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy,
  useSortable, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"

// Helper for generating unique IDs for new zones
const generateZoneId = () => `zone_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

export default function ZoneManager({
  quotationId,
  zones = [],
  items = [],
  activeZoneName,
  onActiveZoneChange,
}) {
  const updateZones = useMutation(api.quotations.updateZones)
  const renameZone = useMutation(api.quotations.renameZone)
  const deleteZone = useMutation(api.quotations.deleteZone)

  const [localZones, setLocalZones] = useState(zones || [])
  const [editingZoneName, setEditingZoneName] = useState(null)
  const [renameInput, setRenameInput] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [addInput, setAddInput] = useState('')
  const [deletingZone, setDeletingZone] = useState(null)
  const [reassignTo, setReassignTo] = useState(null)
  const [inlineError, setInlineError] = useState('')

  const isCommittingAdd = useRef(false)
  const isCommittingRename = useRef(false)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  // Sync local state with props from Convex
  useEffect(() => {
    setLocalZones(zones || [])
  }, [zones])

  // Auto-clear error banner after 4s
  useEffect(() => {
    if (!inlineError) return
    const t = setTimeout(() => setInlineError(''), 4000)
    return () => clearTimeout(t)
  }, [inlineError])

  const getItemCount = (name) => {
    if (name === null) {
      // Use == null to match both null and undefined (legacy items)
      return items.filter(i => i.zone_name == null).length
    }
    return items.filter(i => i.zone_name === name).length
  }

  // --- ACTIONS ---

  const handleAddZone = async () => {
    if (isCommittingAdd.current) return
    isCommittingAdd.current = true

    try {
      const name = addInput.trim()
      if (!name) {
        setIsAdding(false)
        return
      }

      if (localZones.some(z => z.name.toLowerCase() === name.toLowerCase())) {
        setInlineError('Nama zona sudah ada')
        return
      }

      const newZone = { id: generateZoneId(), name, order: localZones.length, color: null, note: null }
      const previousZones = localZones
      const newArr = [...localZones, newZone]

      setLocalZones(newArr)
      setAddInput('')
      setIsAdding(false)
      setInlineError('')

      try {
        await updateZones({ id: quotationId, zones: newArr })
      } catch (err) {
        setLocalZones(previousZones)
        setInlineError('Gagal tambah zona: ' + err.message)
      }
    } finally {
      isCommittingAdd.current = false
    }
  }

  const handleRenameCommit = async (oldName) => {
    if (isCommittingRename.current) return
    isCommittingRename.current = true

    try {
      const newName = renameInput.trim()
      if (!newName || oldName === newName) {
        setEditingZoneName(null)
        return
      }

      if (localZones.some(z => z.name !== oldName && z.name.toLowerCase() === newName.toLowerCase())) {
        setInlineError('Nama zona sudah digunakan')
        return
      }

      try {
        await renameZone({ id: quotationId, oldName, newName })
        if (activeZoneName === oldName) onActiveZoneChange(newName)
        setEditingZoneName(null)
        setInlineError('')
      } catch (err) {
        setInlineError(err.message)
      }
    } finally {
      isCommittingRename.current = false
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deletingZone) return
    const zoneName = deletingZone.name
    try {
      await deleteZone({ id: quotationId, zoneName, reassignTo })
      if (activeZoneName === zoneName) onActiveZoneChange(reassignTo || null)
      setDeletingZone(null)
      setReassignTo(null)
      setInlineError('')
    } catch (err) {
      setInlineError(err.message)
    }
  }

  const handleDragEnd = async (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const previousZones = localZones
    const oldIndex = localZones.findIndex(z => z.id === active.id)
    const newIndex = localZones.findIndex(z => z.id === over.id)
    const reordered = arrayMove(localZones, oldIndex, newIndex).map((z, idx) => ({ ...z, order: idx }))

    setLocalZones(reordered)
    try {
      await updateZones({ id: quotationId, zones: reordered })
    } catch (err) {
      setLocalZones(previousZones)
      setInlineError('Gagal mengubah urutan: ' + err.message)
    }
  }

  return (
    <div style={{
      position: 'fixed', left: 0, top: 0, bottom: 0, width: 280,
      background: 'var(--bg)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', zIndex: 100,
      fontSize: 13, color: 'var(--text)'
    }}>
      {/* Header */}
      <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Zones</h3>
        <button
          onClick={() => setIsAdding(true)}
          style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 4, cursor: 'pointer', padding: '4px 8px', color: 'var(--text)' }}
        >
          ➕
        </button>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis]}>
          <SortableContext items={localZones.map(z => z.id)} strategy={verticalListSortingStrategy}>
            {localZones.map((zone) => (
              <SortableZoneRow
                key={zone.id}
                zone={zone}
                isActive={activeZoneName === zone.name}
                itemCount={getItemCount(zone.name)}
                onSelect={() => onActiveZoneChange(zone.name)}
                isEditing={editingZoneName === zone.name}
                onStartRename={() => { setEditingZoneName(zone.name); setRenameInput(zone.name) }}
                renameInput={renameInput}
                onRenameChange={setRenameInput}
                onRenameCommit={() => handleRenameCommit(zone.name)}
                onRenameCancel={() => setEditingZoneName(null)}
                onDelete={() => setDeletingZone(zone)}
              />
            ))}
          </SortableContext>
        </DndContext>

        {isAdding && (
          <div style={{ padding: '8px 16px' }}>
            <input
              autoFocus
              value={addInput}
              onChange={(e) => setAddInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddZone();
                if (e.key === 'Escape') setIsAdding(false)
              }}
              onBlur={handleAddZone}
              placeholder="Nama zona baru..."
              style={{ width: '100%', padding: '6px 8px', background: 'var(--surface)', border: '1px solid var(--vercel-blue)', borderRadius: 4, color: 'var(--text)', outline: 'none' }}
            />
          </div>
        )}

        {localZones.length === 0 && !isAdding && (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-3)', fontSize: 12 }}>
            Belum ada zone. Buat zone untuk mengelompokkan item per aktivitas event.
          </div>
        )}

        {/* Unallocated Bucket */}
        <UnallocatedRow
          isActive={activeZoneName === null}
          itemCount={getItemCount(null)}
          onSelect={() => onActiveZoneChange(null)}
        />
      </div>

      {/* Error Footer */}
      {inlineError && (
        <div style={{ padding: '8px 16px', background: 'var(--red)', color: 'white', fontSize: 11, transition: 'all 0.3s' }}>
          ⚠️ {inlineError}
        </div>
      )}

      {/* Delete Modal */}
      {deletingZone && (
        <DeleteModal
          zone={deletingZone}
          otherZones={localZones.filter(z => z.name !== deletingZone.name)}
          reassignTo={reassignTo}
          onReassignChange={setReassignTo}
          onConfirm={handleDeleteConfirm}
          onCancel={() => { setDeletingZone(null); setReassignTo(null) }}
          itemCount={getItemCount(deletingZone.name)}
        />
      )}
    </div>
  )
}

function SortableZoneRow({ zone, isActive, itemCount, onSelect, isEditing, onStartRename, renameInput, onRenameChange, onRenameCommit, onRenameCancel, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: zone.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    background: isDragging ? 'var(--surface)' : isActive ? 'var(--surface)' : 'transparent',
    borderLeft: isActive ? '4px solid var(--vercel-blue)' : '4px solid transparent',
    display: 'flex', alignItems: 'center', padding: '8px 12px', cursor: 'pointer',
    borderBottom: '1px solid var(--border)',
    position: 'relative'
  }

  if (isEditing) {
    return (
      <div ref={setNodeRef} style={{ ...style, padding: '4px 12px' }}>
        <input
          autoFocus
          value={renameInput}
          onChange={(e) => onRenameChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onRenameCommit();
            if (e.key === 'Escape') onRenameCancel()
          }}
          onBlur={onRenameCommit}
          style={{ width: '100%', padding: '4px 8px', background: 'var(--bg)', border: '1px solid var(--vercel-blue)', borderRadius: 4, color: 'var(--text)' }}
        />
      </div>
    )
  }

  return (
    <div ref={setNodeRef} style={style} onClick={onSelect}>
      <div {...attributes} {...listeners} style={{ marginRight: 8, cursor: 'grab', opacity: 0.3, fontSize: 16 }}>⋮⋮</div>
      <div style={{ width: 16, marginRight: 4, color: 'var(--vercel-blue)' }}>{isActive ? '▶' : ''}</div>
      <div style={{ flex: 1, fontWeight: isActive ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {zone.name}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-3)', marginRight: 8 }}>{itemCount} items</div>
      <div className="zone-actions" style={{ display: 'flex', gap: 4 }}>
        <ActionBtn onClick={(e) => { e.stopPropagation(); onStartRename() }}>✏️</ActionBtn>
        <ActionBtn onClick={(e) => { e.stopPropagation(); onDelete() }} danger>🗑️</ActionBtn>
      </div>
    </div>
  )
}

function UnallocatedRow({ isActive, itemCount, onSelect }) {
  return (
    <div
      onClick={onSelect}
      style={{
        display: 'flex', alignItems: 'center', padding: '12px 16px', marginTop: 8,
        background: isActive ? 'var(--surface)' : 'transparent',
        borderLeft: isActive ? '4px solid var(--vercel-blue)' : '4px solid transparent',
        cursor: 'pointer', color: 'var(--text-3)', fontStyle: 'italic',
        borderTop: '1px solid var(--border)'
      }}
    >
      <div style={{ width: 16, marginRight: 4 }}>{isActive ? '▶' : ''}</div>
      <div style={{ flex: 1 }}> (Belum dialokasikan) </div>
      <div style={{ fontSize: 11 }}>{itemCount} items</div>
    </div>
  )
}

function ActionBtn({ children, onClick, danger }) {
  const [hover, setHover] = useState(false)
  return (
    <button
      onClick={onClick}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? (danger ? 'var(--red)' : 'var(--surface)') : 'transparent',
        border: '1px solid var(--border)',
        borderRadius: 4,
        padding: '2px 4px',
        fontSize: 12,
        cursor: 'pointer',
        color: hover && danger ? 'white' : 'var(--text-3)',
        transition: 'all 0.1s'
      }}
    >
      {children}
    </button>
  )
}

function DeleteModal({ zone, otherZones, reassignTo, onReassignChange, onConfirm, onCancel, itemCount }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: 24, width: '100%', maxWidth: 400, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
        <h4 style={{ margin: '0 0 16px 0', fontSize: 16 }}>Hapus zone "{zone.name}"?</h4>

        {itemCount > 0 && (
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 8 }}>
              {itemCount} item akan dipindahkan. Pilih zone tujuan:
            </p>
            <select
              value={reassignTo || ''}
              onChange={(e) => onReassignChange(e.target.value || null)}
              style={{ width: '100%', padding: '8px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 4 }}
            >
              <option value="">(Belum dialokasikan)</option>
              {otherZones.map(z => <option key={z.id} value={z.name}>{z.name}</option>)}
            </select>
          </div>
        )}

        {itemCount === 0 && <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 20 }}>Konfirmasi hapus zone ini?</p>}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button onClick={onCancel} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 4, cursor: 'pointer' }}>Batal</button>
          <button onClick={onConfirm} style={{ padding: '8px 16px', background: 'var(--red)', border: 'none', color: 'white', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}>Hapus</button>
        </div>
      </div>
    </div>
  )
}
