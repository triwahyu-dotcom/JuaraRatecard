import { useEffect, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'

export function usePresence(quotationId = null) {
  const [userName, setUserName] = useState(() => localStorage.getItem('juara_user_name') || '')
  const [selection, setSelection] = useState(null)
  
  const updatePresence = useMutation(api.presence.update)
  // Ensure quotationId is passed cleanly
  const activeUsers = useQuery(api.presence.listByQuotation, { 
    quotationId: quotationId || null 
  }) || []

  // Handle Identity
  useEffect(() => {
    if (!userName) {
      const name = prompt('Selamat datang di Juara Ratecard! Masukkan nama Anda untuk mulai kolaborasi:')
      if (name) {
        const cleaned = name.trim()
        localStorage.setItem('juara_user_name', cleaned)
        setUserName(cleaned)
      } else {
        const fallback = 'Guest-' + Math.floor(Math.random() * 1000)
        setUserName(fallback)
        localStorage.setItem('juara_user_name', fallback)
      }
    }
  }, [userName])

  // Heartbeat every 2 seconds for faster sync
  useEffect(() => {
    if (!userName || !updatePresence) return

    const heartbeat = () => {
      updatePresence({ 
        userName, 
        quotationId: quotationId || null, 
        selection: selection || undefined 
      }).catch(err => console.error('[Presence] Update failed:', err))
    }

    heartbeat()
    const interval = setInterval(heartbeat, 2000)
    return () => clearInterval(interval)
  }, [userName, quotationId, selection, updatePresence])

  return {
    userName,
    selection,
    setSelection,
    // Filter out self case-insensitively
    activeUsers: activeUsers.filter(u => 
      u.user_name.toLowerCase().trim() !== userName.toLowerCase().trim()
    ),
    allActive: activeUsers
  }
}
