'use client'

import { useState, useEffect } from 'react'
import { playSoundAsync } from '@/utils/sound'

interface SoundFeedbackProps {
  trigger: 'success' | 'error' | null
  onDone?: () => void
}

export function SoundFeedback({ trigger, onDone }: SoundFeedbackProps) {
  useEffect(() => {
    if (trigger) {
      playSoundAsync(trigger)
      onDone?.()
    }
  }, [trigger, onDone])

  return null
}

// Hook version for convenience
export function useSoundFeedback() {
  const [sound, setSound] = useState<'success' | 'error' | null>(null)

  function play(type: 'success' | 'error') {
    setSound(type)
    playSoundAsync(type)
    setTimeout(() => setSound(null), 500)
  }

  return { sound, playSuccess: () => play('success'), playError: () => play('error') }
}
