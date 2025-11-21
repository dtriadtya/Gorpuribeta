'use client'

import { useEffect } from 'react'

export default function SessionCleanup() {
  useEffect(() => {
    console.log('SessionCleanup: Component mounted')
    
    // CRITICAL: sessionStorage persists during REFRESH but is cleared on TAB CLOSE
    // We use this behavior to detect the difference
    
    const wasRefresh = sessionStorage.getItem('sessionActive')
    const token = localStorage.getItem('token')
    
    if (wasRefresh) {
      console.log('SessionCleanup: Detected REFRESH')
    } else if (token) {
      console.log('SessionCleanup: New tab with existing token')
    }
    
    // Set the session flag - will persist on refresh, clear on tab close
    sessionStorage.setItem('sessionActive', 'true')

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Check if this is an internal navigation (login redirect, etc)
      const isInternalNavigation = sessionStorage.getItem('justLoggedIn') === 'true'
      
      if (isInternalNavigation) {
        console.log('SessionCleanup: Internal navigation detected, keeping session')
        // Clear the flag so it doesn't persist forever
        sessionStorage.removeItem('justLoggedIn')
        return
      }
      
      const currentToken = localStorage.getItem('token')
      
      if (!currentToken) {
        console.log('SessionCleanup: No token found')
        return
      }

      console.log('SessionCleanup: Tab closing - logging out')
      
      // Send logout request using sendBeacon
      const logoutUrl = `${window.location.origin}/api/auth/logout`
      
      try {
        const blob = new Blob(
          [JSON.stringify({ token: currentToken })], 
          { type: 'application/json' }
        )
        navigator.sendBeacon(logoutUrl, blob)
        console.log('SessionCleanup: Logout beacon sent')
      } catch (err) {
        console.error('SessionCleanup: Beacon error:', err)
      }
      
      // Clear all auth data from localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('unpaidReservations')
      console.log('SessionCleanup: localStorage cleared')
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    // Cleanup function
    return () => {
      console.log('SessionCleanup: Component unmounting')
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  return null
}
