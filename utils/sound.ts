// Audio feedback for VIN scanning events

type SoundType = 'success' | 'error' | 'warning'

function createBeep(
  frequency: number,
  duration: number,
  volume = 0.5,
  type: OscillatorType = 'sine'
): Promise<void> {
  return new Promise((resolve) => {
    try {
      const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext
      const ctx = new AudioContext()
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)
      oscillator.type = type

      gainNode.gain.setValueAtTime(0, ctx.currentTime)
      gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + duration)

      oscillator.onended = () => {
        ctx.close()
        resolve()
      }
    } catch {
      resolve()
    }
  })
}

export async function playSound(type: SoundType): Promise<void> {
  switch (type) {
    case 'success':
      // Two ascending beeps
      await createBeep(800, 0.1, 0.3, 'sine')
      await new Promise((r) => setTimeout(r, 50))
      await createBeep(1200, 0.15, 0.3, 'sine')
      break

    case 'error':
      // Low descending buzzer
      await createBeep(400, 0.1, 0.4, 'square')
      await new Promise((r) => setTimeout(r, 30))
      await createBeep(300, 0.2, 0.4, 'square')
      break

    case 'warning':
      // Single mid beep
      await createBeep(600, 0.15, 0.3, 'triangle')
      break
  }
}

export function playSoundAsync(type: SoundType): void {
  playSound(type).catch(() => {})
}
