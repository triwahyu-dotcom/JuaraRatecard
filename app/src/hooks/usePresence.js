import { useEffect, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'

export function usePresence(quotationId = null) {
  const [userName, setUserName] = useState(localStorage.getItem('juara_user_name') || '')
  
  const updatePresence = useMutation(api.presence.update)
  const activeUsers = useQuery(api.presence.listByQuotation, { quotationId }) || []

  // Handle Identity
  useEffect(() => {
    if (!userName) {
      const name = prompt('Selamat datang di Juara Ratecard! Masukkan nama Anda untuk mulai kolaborasi:')
      if (name) {
        const cleaned = name.trim() || 'Anonymous'
        localStorage.setItem('juara_user_name', cleaned)
        setUserName(cleaned)
      } else {
        setUserName('Guest')
      }
    }
  }, [userName])

  // Heartbeat every 10 seconds
  useEffect(() => {
    if (!userName) return

    const heartbeat = () => {
      updatePresence({ userName, quotationId }).catch(console.error)
    }

    heartbeat() // Initial
    const interval = setInterval(heartbeat, 10000)
    
    return () => clearInterval(interval)
  }, [userName, quotationId, updatePresence])

  return {
    userName,
    activeUsers: activeUsers.filter(u => u.user_name !== userName),
    allActive: activeUsers
  }
}
