'use client'

import { createContext, useContext, useState, useCallback, useEffect } from 'react'

type NotifType = 'success' | 'error' | 'warning' | 'info'

interface Notif {
  id: string
  message: string
  type: NotifType
}

interface NotifContextValue {
  notify: (message: string, type?: NotifType) => void
}

const NotifContext = createContext<NotifContextValue>({ notify: () => {} })

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifs, setNotifs] = useState<Notif[]>([])

  const notify = useCallback((message: string, type: NotifType = 'success') => {
    const id = `${Date.now()}-${Math.random()}`
    setNotifs((prev) => [...prev.slice(-3), { id, message, type }])
    setTimeout(() => {
      setNotifs((prev) => prev.filter((n) => n.id !== id))
    }, 3000)
  }, [])

  return (
    <NotifContext.Provider value={{ notify }}>
      {children}
      <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
        {notifs.map((n) => (
          <NotifItem key={n.id} notif={n} onDismiss={() => setNotifs((p) => p.filter((x) => x.id !== n.id))} />
        ))}
      </div>
    </NotifContext.Provider>
  )
}

function NotifItem({ notif, onDismiss }: { notif: Notif; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3000)
    return () => clearTimeout(t)
  }, [onDismiss])

  const styles: Record<NotifType, { bg: string; color: string; icon: string }> = {
    success: { bg: 'var(--accent-green)', color: '#000', icon: '✓' },
    error:   { bg: 'var(--accent-red)',   color: '#fff', icon: '✕' },
    warning: { bg: 'var(--accent-yellow)', color: '#000', icon: '⚠' },
    info:    { bg: 'var(--accent-blue)',  color: '#fff', icon: 'ℹ' },
  }

  const s = styles[notif.type]

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl font-display font-bold text-sm tracking-wide pointer-events-auto cursor-pointer animate-slide-in"
      style={{
        background: s.bg,
        color: s.color,
        minWidth: '240px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
      }}
      onClick={onDismiss}
    >
      <span className="text-base">{s.icon}</span>
      <span className="flex-1">{notif.message}</span>
    </div>
  )
}

export function useNotification() {
  return useContext(NotifContext)
}
