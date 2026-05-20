import { useRef, useEffect } from 'react'

export default function ActivitySidebar({ activities, onClose }) {
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0
    }
  }, [activities])

  const getTypeColor = (type) => {
    switch (type) {
      case 'add': return 'var(--vercel-blue)';
      case 'delete': return 'var(--red)';
      case 'edit': return 'var(--yellow)';
      case 'status': return 'var(--vercel-green)';
      default: return 'var(--text-3)';
    }
  }

  const getTypeIcon = (type) => {
    return null; // No icon, just text color
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
          <h4 style={{ fontSize: 13, fontWeight: 700 }}>Activity Log</h4>
          <p style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 4 }}>Real-time audit trail</p>
        </div>
        <button onClick={onClose} className="btn btn-ghost" style={{ padding: 4 }}>✕</button>
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
        {activities.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: 40, opacity: 0.3 }}>
            <p style={{ fontSize: 11 }}>No activities yet</p>
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {activities.map((a, i) => (
            <div key={i} style={{ 
              background: 'var(--surface)', 
              border: '1px solid var(--border)',
              borderRadius: 8, padding: 12,
              position: 'relative',
              animation: 'fadeIn 0.3s ease-out'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ 
                  fontSize: 9, fontWeight: 700, 
                  color: getTypeColor(a.type),
                  textTransform: 'uppercase',
                  display: 'flex', alignItems: 'center', gap: 4
                }}>
                  {getTypeIcon(a.type)} {a.type}
                </span>
                <span style={{ fontSize: 9, color: 'var(--text-3)' }}>
                  {new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text)', lineHeight: 1.4 }}>
                <strong style={{ color: 'var(--text-2)' }}>{a.user_name}</strong> {a.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
