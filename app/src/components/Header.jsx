import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from 'react'
import { useTheme } from '../hooks/useTheme.jsx'


const NAV_LINKS = [
  { to: '/ratecard', label: 'Ratecard' },
  { to: '/', label: 'Dashboard' },
]

export default function Header() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const createQuotation = useMutation(api.quotations.create)
  const [isCreating, setIsCreating] = useState(false)
  const { theme, toggleTheme } = useTheme()

  const isBuilder = pathname.startsWith('/new') || pathname.startsWith('/edit')
  const isPreview = pathname.startsWith('/preview')

  const handleNew = async () => {
    if (isCreating) return
    setIsCreating(true)
    try {
      const timestamp = new Date().getTime().toString().slice(-6)
      const newId = await createQuotation({
        title: 'Untitled Quotation',
        quot_number: `QUOT-${new Date().getFullYear()}-${timestamp}`,
        client_name: 'New Client',
      })
      localStorage.removeItem('juara_quotation_draft')
      navigate(`/edit/${newId}`)
    } catch (err) {
      console.error('Header creation failed:', err)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <header style={{
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, zIndex: 100,
      backdropFilter: 'saturate(180%) blur(20px)',
      opacity: 0.98
    }}>
      <div className={isBuilder ? "page-fluid" : "page-wrap"} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>

        {/* Logo Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img 
              src="/Logo_Juara_Handover-04.png" 
              alt="JUARA" 
              style={{ 
                height: 32, 
                width: 'auto',
                display: 'block'
              }} 
            />
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
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode'}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 10px', borderRadius: 6, cursor: 'pointer',
              fontSize: 11, fontWeight: 600, letterSpacing: 0.3,
              background: 'var(--surface)', color: 'var(--text-2)',
              border: '1px solid var(--border)',
              transition: 'all 0.15s'
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--border-2)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.borderColor = 'var(--border)' }}
          >
            {theme === 'dark' ? (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="4"/>
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
                </svg>
                Light
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
                </svg>
                Dark
              </>
            )}
          </button>

          {(isBuilder || isPreview) && (
            <Link to="/" className="btn btn-ghost btn-sm" style={{ border: 'none' }}>Back</Link>
          )}
          {!isBuilder && !isPreview && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button 
                onClick={handleNew}
                disabled={isCreating}
                className="btn btn-primary btn-sm" 
                style={{ fontWeight: 600 }}
              >
                {isCreating ? 'Creating...' : 'Create New'}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
