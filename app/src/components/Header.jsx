import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const NAV_LINKS = [
  { to: '/', label: 'Dashboard' },
  { to: '/ratecard', label: 'Ratecard', adminOnly: true },
]

export default function Header() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, profile, isAdmin, signOut, loading } = useAuth()

  const isBuilder = pathname.startsWith('/new') || pathname.startsWith('/edit')
  const isPreview = pathname.startsWith('/preview')
  const isLogin = pathname === '/login'

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  // Minimal header for Login page
  if (isLogin) {
    return (
      <header style={{
        background: 'transparent',
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100, height: 80,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <svg width="24" height="24" viewBox="0 0 75 65" fill="none">
            <path d="M37.5 0L75 65H0L37.5 0Z" fill="white"/>
          </svg>
          <span style={{ fontWeight: 700, fontSize: 20, letterSpacing: '0.1em' }}>JUARA</span>
        </div>
      </header>
    )
  }

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
            <svg width="24" height="24" viewBox="0 0 75 65" fill="none">
              <path d="M37.5 0L75 65H0L37.5 0Z" fill="white"/>
            </svg>
            <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-.02em', color: 'var(--text)' }}>
              JUARA
            </span>
          </Link>
          <div style={{ width: 1, height: 24, background: 'var(--border)', margin: '0 4px' }} />
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-3)' }}>Quotation Builder</span>
        </div>

        {/* Main Nav — Filtered by Role */}
        {!isBuilder && !isPreview && user && (
          <nav style={{ 
            display: 'flex', 
            alignItems: 'center', 
            height: '100%',
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)'
          }}>
            {NAV_LINKS.filter(l => !l.adminOnly || isAdmin).map(link => {
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
                      position: 'absolute', bottom: -1, left: 0, right: 0, height: 2,
                      background: 'var(--text)', borderRadius: '2px 2px 0 0'
                    }} />
                  )}
                </Link>
              )
            })}
          </nav>
        )}

        {/* Right Actions & User Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ textAlign: 'right', display: 'none', md: 'block' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{user.email.split('@')[0]}</div>
                <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase' }}>{profile?.role || 'viewer'}</div>
              </div>
              <button 
                onClick={handleLogout}
                className="btn btn-ghost btn-sm" 
                style={{ border: '1px solid var(--border)', padding: '4px 10px', height: 28 }}
              >
                Sign Out
              </button>
            </div>
          )}

          {(isBuilder || isPreview) && (
            <Link to="/" className="btn btn-ghost btn-sm">Back</Link>
          )}
          
          {!isBuilder && !isPreview && user && (
            <Link to="/new" className="btn btn-primary btn-sm" style={{ fontWeight: 600 }}>
              Create New
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
