'use client'

import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Check if previously dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (dismissed) {
      const dismissedDate = new Date(dismissed)
      const now = new Date()
      // Show again after 3 days
      if (now.getTime() - dismissedDate.getTime() < 3 * 24 * 60 * 60 * 1000) {
        return
      }
    }

    // Detect iOS
    const ua = navigator.userAgent
    const isIOSDevice = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator as any).standalone
    
    if (isIOSDevice && !isInStandaloneMode) {
      setIsIOS(true)
      setShowBanner(true)
      return
    }

    // Android/Desktop — listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowBanner(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  async function handleInstall() {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setShowBanner(false)
        setIsInstalled(true)
      }
      setDeferredPrompt(null)
    }
  }

  function handleDismiss() {
    setShowBanner(false)
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString())
  }

  if (!showBanner || isInstalled) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        padding: '0 16px 16px',
        animation: 'slideUpBanner 0.4s ease',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #181b22 0%, #111318 100%)',
          border: '1px solid rgba(245, 184, 0, 0.3)',
          borderRadius: '16px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          boxShadow: '0 -4px 30px rgba(0,0,0,0.5)',
          maxWidth: '500px',
          margin: '0 auto',
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #f5b800, #e0a800)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontSize: '22px',
            fontWeight: 'bold',
            color: '#000',
            fontFamily: 'var(--font-display)',
          }}
        >
          AP
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '14px',
              color: '#f0f2f5',
              marginBottom: '2px',
            }}
          >
            Instalar AutoProd
          </div>
          <div style={{ fontSize: '12px', color: '#8a9bb0' }}>
            {isIOS
              ? 'Toque em Compartilhar ↑ e "Adicionar à Tela de Início"'
              : 'Acesse rápido direto da sua tela inicial'}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          {!isIOS && (
            <button
              onClick={handleInstall}
              style={{
                background: '#f5b800',
                color: '#000',
                border: 'none',
                borderRadius: '10px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 700,
                fontFamily: 'var(--font-display)',
                cursor: 'pointer',
                letterSpacing: '0.03em',
              }}
            >
              INSTALAR
            </button>
          )}
          <button
            onClick={handleDismiss}
            style={{
              background: 'rgba(255,255,255,0.08)',
              color: '#8a9bb0',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
              padding: '8px 12px',
              fontSize: '13px',
              cursor: 'pointer',
              fontFamily: 'var(--font-display)',
            }}
          >
            ✕
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUpBanner {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
