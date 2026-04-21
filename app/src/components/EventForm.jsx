import { generateQuotNumber, fmtDate } from '../utils/fmt'

export default function EventForm({ data, onChange }) {
  const set = (field, val) => onChange({ ...data, [field]: val })

  const handleAutoNumber = () => {
    if (data.client && data.event_title && data.event_date) {
      set('quot_number', generateQuotNumber(data.client, data.event_title, data.event_date))
    }
  }

  return (
    <div className="card" style={{ padding: '32px 40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
         <div style={{ width: 32, height: 32, background: 'var(--text)', borderRadius: 8, color: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>#</div>
         <h2 style={{ fontSize: 20 }}>Project Information</h2>
      </div>

      <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px 32px' }}>
        <div className="form-group">
          <label className="form-label">Client Name <span style={{ color: 'var(--red)' }}>*</span></label>
          <input className="form-input" value={data.client || ''} onChange={e => set('client', e.target.value)} placeholder="e.g. Disney / Netflix" />
        </div>
        
        <div className="form-group">
          <label className="form-label">Event / Project Title <span style={{ color: 'var(--red)' }}>*</span></label>
          <input className="form-input" value={data.event_title || ''} onChange={e => set('event_title', e.target.value)} placeholder="e.g. Music Festival 2026" />
        </div>

        <div className="form-group">
          <label className="form-label">Event Date <span style={{ color: 'var(--red)' }}>*</span></label>
          <input className="form-input" type="date" value={data.event_date || ''} onChange={e => set('event_date', e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">Signatory & Role</label>
          <input className="form-input" value={data.signatory || ''} onChange={e => set('signatory', e.target.value)} placeholder="Eka Marutha — Technical Director" />
        </div>

        <div className="form-group">
          <label className="form-label">Venue / Location</label>
          <input className="form-input" value={data.venue || ''} onChange={e => set('venue', e.target.value)} placeholder="e.g. JIExpo Kemayoran" />
        </div>

        <div className="form-group">
          <label className="form-label">City</label>
          <input className="form-input" value={data.city || ''} onChange={e => set('city', e.target.value)} placeholder="e.g. Jakarta" />
        </div>

        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">Official Quotation Number</label>
          <div style={{ display: 'flex', gap: 12 }}>
            <input className="form-input" style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: 13 }} 
              value={data.quot_number || ''}
              onChange={e => set('quot_number', e.target.value)}
              placeholder="01/QUOT/JBBS/CLIENT-EVENT/V/2026" />
            <button className="btn btn-surface" onClick={handleAutoNumber} style={{ fontWeight: 600 }}>
              Auto Generate
            </button>
          </div>
          <p className="text-xs text-muted" style={{ marginTop: 8 }}>
            Will generate a professional reference based on client, project title, and date.
          </p>
        </div>

        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">Notes & Terms (One per line)</label>
          <textarea className="form-input" rows={4}
            style={{ resize: 'vertical', lineHeight: 1.6 }}
            value={(data.notes || []).join('\n')}
            onChange={e => set('notes', e.target.value.split('\n'))}
            placeholder="— Prices are valid for 7 days&#10;— Includes 1x Tech Run&#10;— Excludes loading transportation"
          />
        </div>
      </div>
    </div>
  )
}
