export default function StepBar({ steps, current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, width: '100%' }}>
      {steps.map((step, i) => {
        const done = i < current
        const active = i === current
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'unset' }}>
            {/* Step Node */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
              <div style={{
                width: 24, height: 24, borderRadius: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700,
                background: done ? 'var(--text)' : active ? 'var(--text)' : 'var(--bg)',
                color: done || active ? 'var(--bg)' : 'var(--text-3)',
                border: `1px solid ${done || active ? 'var(--text)' : 'var(--border)'}`,
                transition: 'all 0.2s',
              }}>
                {done ? '✓' : i + 1}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{
                  fontSize: 13, fontWeight: active ? 700 : 500,
                  color: active ? 'var(--text)' : 'var(--text-3)',
                  transition: 'color 0.15s'
                }}>{step.label}</div>
              </div>
            </div>
            
            {/* Connector Line */}
            {i < steps.length - 1 && (
              <div style={{
                flex: 1, height: 1, margin: '0 20px',
                background: done ? 'var(--text)' : 'var(--border)',
                transition: 'background 0.3s',
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}
