'use client'

import { useState, createContext, useContext, useCallback, type ReactNode } from 'react'

interface ConfirmOptions {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
}

interface ConfirmContextValue {
  confirm: (opts: ConfirmOptions) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextValue>({ confirm: async () => false })

interface DialogState extends ConfirmOptions {
  resolve: (v: boolean) => void
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<DialogState | null>(null)

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialog({ ...opts, resolve })
    })
  }, [])

  function handleResponse(value: boolean) {
    dialog?.resolve(value)
    setDialog(null)
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      {dialog && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            zIndex: 9998,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => handleResponse(false)}
        >
          <div
            className="animate-scale-in"
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-medium)',
              borderRadius: '14px',
              padding: '24px',
              maxWidth: '380px',
              width: '100%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              className="font-display font-bold text-xl mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              {dialog.title}
            </h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              {dialog.message}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => handleResponse(false)}
                className="px-5 py-2.5 rounded-lg text-sm font-medium"
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border-medium)',
                  color: 'var(--text-secondary)',
                }}
              >
                {dialog.cancelLabel ?? 'Cancelar'}
              </button>
              <button
                onClick={() => handleResponse(true)}
                className="px-5 py-2.5 rounded-lg text-sm font-bold"
                style={{
                  background: dialog.danger ? 'var(--accent-red)' : 'var(--accent-yellow)',
                  color: dialog.danger ? '#fff' : '#000',
                  border: 'none',
                }}
              >
                {dialog.confirmLabel ?? 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  return useContext(ConfirmContext)
}
