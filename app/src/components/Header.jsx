import { Link, useLocation } from 'react-router-dom'

const NAV_LINKS = [
  { to: '/', label: 'Dashboard' },
  { to: '/ratecard', label: 'Ratecard' },
]

export default function Header() {
  const { pathname } = useLocation()

  const isBuilder = pathname.startsWith('/new') || pathname.startsWith('/edit')
  const isPreview = pathname.startsWith('/preview')

  return (
    <header style={{
      background: 'rgba(0,0,0,0.8)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, zIndex: 100,
      backdropFilter: 'saturate(180%) blur(20px)',
    }}>
      <div className={isBuilder ? "page-fluid" : "page-wrap"} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>

        {/* Logo Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Vercel-like Triangle Logo (Simplified) */}
            <svg width="24" height="24" viewBox="0 0 75 65" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M37.5 0L75 65H0L37.5 0Z" fill="white"/>
            </svg>
            <span style={{
              fontWeight: 700, fontSize: 18,
              letterSpacing: '-.02em', color: 'var(--text)',
            }}>
              JUARA
            </span>
          </Link>
          <div style={{ width: 1, height: 24, background: 'var(--border)', margin: '0 4px' }} />
          <span style={{
            fontSize: 13, fontWeight: 500, color: 'var(--text-3)',
          }}>Quotation Builder</span>
        </div>

        {/* Main Nav — Center focus like Vercel */}
        {!isBuilder && !isPreview && (
          <nav style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 0, 
            height: '100%',
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)'
          }}>
            {NAV_LINKS.map(link => {
              const active = pathname === link.to
              return (
                <Link key={link.to} to={link.to}
                  style={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 16px',
                    fontSize: 14, 
                    fontWeight: 500,
                    color: active ? 'var(--text)' : 'var(--text-2)',
                    transition: 'color 0.15s',
                    position: 'relative',
                  }}>
                  {link.label}
                  {active && (
                    <div style={{
                      position: 'absolute',
                      bottom: -1,
                      left: 0,
                      right: 0,
                      height: 2,
                      background: 'var(--text)',
                      borderRadius: '2px 2px 0 0'
                    }} />
                  )}
                </Link>
              )
            })}
          </nav>
        )}

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {(isBuilder || isPreview) && (
            <Link to="/" className="btn btn-ghost btn-sm" style={{ border: 'none' }}>Back</Link>
          )}
          {!isBuilder && !isPreview && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Link to="/new" className="btn btn-primary btn-sm" style={{ fontWeight: 600 }}>
                Create New
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
