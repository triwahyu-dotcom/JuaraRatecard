import { useEffect, useState, useMemo, useRef } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import throttle from 'lodash/throttle'

export function usePresence(quotationId = null) {
  const [userName, setUserName] = useState(() => {
    try { return localStorage.getItem('juara_user_name') || '' } catch { return '' }
  })
  const [selection, setSelection] = useState(null)
  
  const updatePresence = useMutation(api.presence.update)
  
  // Use refs to access latest values WITHOUT re-creating throttle
  const userNameRef = useRef(userName)
  const quotationIdRef = useRef(quotationId)
  const selectionRef = useRef(selection)
  
  useEffect(() => { userNameRef.current = userName }, [userName])
  useEffect(() => { quotationIdRef.current = quotationId }, [quotationId])
  useEffect(() => { selectionRef.current = selection }, [selection])
  
  // BANDWIDTH OPTIMIZATION: Throttle to 5s to prevent quota overflow
  // Trailing-only so rapid changes coalesce into 1 update at the end
  const throttledUpdate = useMemo(() => 
    throttle(() => {
      const qid = quotationIdRef.current
      if (!qid) return  // No quotation context, skip
      
      updatePresence({
        userName: userNameRef.current,
        quotationId: qid,
        selection: selectionRef.current || undefined,
      }).catch(err => console.error('[Presence] Update failed:', err))
    }, 5000, { leading: false, trailing: true }),  // 5s throttle, trailing only
    [updatePresence]
  )

  useEffect(() => {
    return () => throttledUpdate.cancel()
  }, [throttledUpdate])

  // Query active users — keep this, but it's pull not push
  const activeUsers = useQuery(api.presence.listByQuotation, { 
    quotationId: quotationId || null 
  }) || []

  // Handle Identity
  useEffect(() => {
    if (!userName) {
      try {
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
      } catch (e) {
        const fallback = 'Guest-' + Math.floor(Math.random() * 1000)
        setUserName(fallback)
      }
    }
  }, [userName])

  // HEARTBEAT: every 60 seconds (was 2s) — only to keep "active" status
  // Selection changes also trigger updates via the trigger effect below
  useEffect(() => {
    if (!userName || !quotationId) return
    
    // Initial fire on mount
    throttledUpdate()
    
    const interval = setInterval(throttledUpdate, 60000)  // 60s
    return () => clearInterval(interval)
  }, [userName, quotationId, throttledUpdate])
  // Note: `selection` removed from deps — handled by separate effect below

  // SELECTION TRIGGER: Fire update when selection changes
  // Throttled to 5s, so rapid cell clicks coalesce
  useEffect(() => {
    if (!userName || !quotationId) return
    throttledUpdate()
  }, [selection, throttledUpdate, userName, quotationId])

  return {
    userName,
    selection,
    setSelection,
    activeUsers: activeUsers.filter(u => 
      u.user_name.toLowerCase().trim() !== userName.toLowerCase().trim()
    ),
    allActive: activeUsers
  }
}
