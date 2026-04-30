import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from 'react'

const NAV_LINKS = [
  { to: '/ratecard', label: 'Ratecard' },
  { to: '/', label: 'Dashboard' },
]

export default function Header() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const createQuotation = useMutation(api.quotations.create)
  const [isCreating, setIsCreating] = useState(false)

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
      background: 'rgba(0,0,0,0.8)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, zIndex: 100,
      backdropFilter: 'saturate(180%) blur(20px)',
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
