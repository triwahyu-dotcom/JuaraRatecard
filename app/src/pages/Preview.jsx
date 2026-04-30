import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import PrintDocument from '../components/PrintDocument'
import { exportQuotationToXls } from '../utils/exportXls'

export default function Preview() {
  const { id } = useParams()
  const navigate = useNavigate()
  const quotation = useQuery(api.quotations.get, id ? { id: id } : "skip");
  const loading = quotation === undefined;
  const [showSummary, setShowSummary] = useState(true)
  const [combinedMode, setCombinedMode] = useState(false)

  const handlePrint = () => window.print()

  if (loading) return (
    <div className="empty-state" style={{ marginTop: 80 }}>
      <div className="empty-icon">⏳</div><p>Loading...</p>
    </div>
  )

  if (!quotation) return (
    <div className="empty-state" style={{ marginTop: 80 }}>
      <div className="empty-icon">⚠️</div><p>Quotation not found.</p>
      <Link to="/" className="btn btn-primary mt-4">Back to Dashboard</Link>
    </div>
  )

  return (
    <>
      {/* Toolbar — hidden on print */}
      <div className="no-print" style={{
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        padding: '12px 24px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', position: 'sticky', top: 64, zIndex: 90,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to={`/edit/${id}`} className="btn btn-ghost btn-sm">← Edit</Link>
          <Link to="/" className="btn btn-ghost btn-sm">Dashboard</Link>
          <div style={{ marginLeft: 8 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{quotation.event_title}</div>
            <div style={{ fontSize: 11, color: 'var(--text-2)' }}>{quotation.quot_number}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ display: 'flex', background: 'var(--surface-2)', padding: '4px', borderRadius: 8, border: '1px solid var(--border)', marginRight: 12 }}>
            <button 
              onClick={() => setShowSummary(!showSummary)}
              className={`btn btn-sm ${showSummary ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: 10, padding: '4px 10px' }}>
              {showSummary ? '✓ Summary' : 'No Summary'}
            </button>
            <button 
              onClick={() => setCombinedMode(!combinedMode)}
              className={`btn btn-sm ${combinedMode ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: 10, padding: '4px 10px', marginLeft: 4 }}>
              {combinedMode ? 'Combined List' : 'Sectioned'}
            </button>
          </div>

          <button className="btn btn-ghost" onClick={() => exportQuotationToXls(quotation)} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            📊 Export XLS
          </button>
          <button className="btn btn-primary" onClick={handlePrint}>
            🖨 Print / Save PDF
          </button>
        </div>
      </div>

      {/* Document */}
      <div style={{ background: '#e8e8e8', minHeight: 'calc(100vh - 120px)', paddingTop: 8 }}>
        <PrintDocument quotation={quotation} showSummary={showSummary} combinedMode={combinedMode} />
      </div>
    </>
  )
}
