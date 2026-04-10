'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { sanitizeVIN, validateVIN, startCameraScanner } from '@/utils/barcode'
import { playSoundAsync } from '@/utils/sound'

interface VinScannerProps {
  onScan: (vin: string) => void
  disabled?: boolean
}

export function VinScanner({ onScan, disabled }: VinScannerProps) {
  const [vin, setVin] = useState('')
  const [cameraOpen, setCameraOpen] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const stopCameraRef = useRef<(() => void) | null>(null)

  // Auto-focus input on mount so physical scanner works immediately
  useEffect(() => {
    if (!disabled) inputRef.current?.focus()
  }, [disabled])

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = sanitizeVIN(e.target.value)
    setVin(raw)
    // Physical scanners typically fire an Enter after the code
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // Apenas sanitiza e valida visualmente, não envia mais automático
      const cleaned = sanitizeVIN(vin)
      const { valid } = validateVIN(cleaned)
      if (valid) {
        playSoundAsync('success')
        // Mantém o VIN no campo para confirmação manual
      }
    }
  }

  const submitVin = useCallback(() => {
    const cleaned = sanitizeVIN(vin)
    const { valid, error } = validateVIN(cleaned)
    if (!valid) {
      playSoundAsync('error')
      alert(error)
      return
    }
    onScan(cleaned)
    setVin('')
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [vin, onScan])

  const openCamera = async () => {
    setCameraOpen(true)
    setCameraError('')
  }

  const closeCamera = () => {
    stopCameraRef.current?.()
    stopCameraRef.current = null
    setCameraOpen(false)
  }

  useEffect(() => {
    if (!cameraOpen || !videoRef.current) return

    startCameraScanner(
      videoRef.current,
      (result) => {
        const cleaned = sanitizeVIN(result.text)
        const { valid } = validateVIN(cleaned)
        if (valid) {
          playSoundAsync('success')
          setVin(cleaned) // Apenas preenche o campo
          closeCamera()
        }
      },
      (err) => {
        setCameraError('Câmera não disponível: ' + err.message)
      }
    ).then((stop) => {
      stopCameraRef.current = stop
    })

    return () => {
      stopCameraRef.current?.()
    }
  }, [cameraOpen]) // eslint-disable-line

  return (
    <div className="space-y-3">
      {/* Manual / scanner input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={vin}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Aguardando scanner ou câmera..."
          maxLength={17}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          className="w-full px-5 py-4 rounded-xl outline-none transition-all font-display font-bold tracking-widest text-2xl"
          style={{
            background: 'var(--bg-secondary)',
            border: '2px solid var(--border-medium)',
            color: 'var(--accent-yellow)',
          }}
          onFocus={(e) => (e.target.style.borderColor = 'var(--accent-yellow)')}
          onBlur={(e) => (e.target.style.borderColor = 'var(--border-medium)')}
        />
        <div
          className="absolute right-4 top-1/2 -translate-y-1/2 text-xs"
          style={{ color: 'var(--text-tertiary)' }}
        >
          {vin.length}/17
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={submitVin}
          disabled={disabled || vin.length < 17}
          className={`flex-1 py-4 rounded-xl font-display font-bold text-lg tracking-widest transition-all ${
            vin.length === 17 ? 'animate-pulse shadow-lg scale-[1.02]' : 'opacity-40'
          }`}
          style={{ 
            background: 'var(--accent-yellow)', 
            color: '#000',
            border: vin.length === 17 ? '2px solid #fff' : 'none'
          }}
        >
          {vin.length === 17 ? 'CONFIRMAR MONTAGEM' : 'REGISTRAR VIN'}
        </button>
        <button
          onClick={openCamera}
          disabled={disabled}
          className="px-6 py-4 rounded-xl text-sm font-bold transition-all"
          style={{
            background: 'rgba(45,140,240,0.12)',
            border: '1px solid rgba(45,140,240,0.25)',
            color: 'var(--accent-blue)',
          }}
        >
          📷 CÂMERA
        </button>
        <button
          onClick={() => { setVin(''); inputRef.current?.focus() }}
          disabled={disabled}
          className="px-5 py-3 rounded-xl text-sm font-medium transition-all"
          style={{
            background: 'transparent',
            border: '1px solid var(--border-medium)',
            color: 'var(--text-secondary)',
          }}
        >
          Limpar
        </button>
      </div>

      {/* Camera overlay */}
      {cameraOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.85)' }}
        >
          <div
            className="w-full max-w-md rounded-2xl overflow-hidden"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-medium)' }}
          >
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: '1px solid var(--border-subtle)' }}
            >
              <span className="font-display font-bold text-base" style={{ color: 'var(--text-primary)' }}>
                Scanner por Câmera
              </span>
              <button
                onClick={closeCamera}
                className="text-xl"
                style={{ color: 'var(--text-secondary)' }}
              >
                ✕
              </button>
            </div>

            <div className="relative bg-black aspect-video">
              <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
              {/* Scan overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                  className="w-64 h-24 rounded-lg"
                  style={{
                    border: '2px solid var(--accent-yellow)',
                    boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
                  }}
                />
              </div>
            </div>

            {cameraError && (
              <p className="text-sm text-center p-4" style={{ color: 'var(--accent-red)' }}>
                {cameraError}
              </p>
            )}

            <div className="p-4">
              <p className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
                Aponte a câmera para o código de barras do VIN
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
