// VIN validation and barcode scanner utilities

// VIN transliteration table (no I, O, Q)
const VIN_TRANSLITERATION: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8,
  J: 1, K: 2, L: 3, M: 4, N: 5,
  P: 7, R: 9,
  S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9,
  '0': 0, '1': 1, '2': 2, '3': 3, '4': 4,
  '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
}

const VIN_WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2]

export function validateVIN(vin: string): { valid: boolean; error?: string } {
  if (!vin || typeof vin !== 'string') {
    return { valid: false, error: 'VIN é obrigatório' }
  }

  const cleaned = vin.trim().toUpperCase()

  if (cleaned.length !== 17) {
    return { valid: false, error: `VIN deve ter 17 caracteres (atual: ${cleaned.length})` }
  }

  // No I, O, Q
  if (/[IOQ]/.test(cleaned)) {
    return { valid: false, error: 'VIN não pode conter I, O ou Q' }
  }

  // Only alphanumeric
  if (!/^[A-HJ-NPR-Z0-9]{17}$/i.test(cleaned)) {
    return { valid: false, error: 'VIN contém caracteres inválidos' }
  }

  // Check digit validation (position 9)
  const checkDigit = cleaned[8]
  let sum = 0

  for (let i = 0; i < 17; i++) {
    const char = cleaned[i]
    const value = VIN_TRANSLITERATION[char]
    if (value === undefined) {
      return { valid: false, error: `Caractere inválido na posição ${i + 1}: ${char}` }
    }
    sum += value * VIN_WEIGHTS[i]
  }

  const remainder = sum % 11
  const expectedCheck = remainder === 10 ? 'X' : String(remainder)

  if (checkDigit !== expectedCheck) {
    // Some manufacturers use non-standard check digits; warn but don't block
    console.warn(`VIN check digit mismatch: expected ${expectedCheck}, got ${checkDigit}`)
  }

  return { valid: true }
}

export function sanitizeVIN(vin: string): string {
  return vin.trim().toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '')
}

export function formatVINDisplay(vin: string): string {
  // Group: 3 + 6 + 8
  const cleaned = sanitizeVIN(vin)
  if (cleaned.length !== 17) return cleaned
  return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 9)} ${cleaned.slice(9)}`
}

// -------------------------------------------------------
// ZXing barcode reader wrapper
// -------------------------------------------------------

export interface ScanResult {
  text: string
  format: string
}

export async function startCameraScanner(
  videoElement: HTMLVideoElement,
  onResult: (result: ScanResult) => void,
  onError?: (error: Error) => void
): Promise<() => void> {
  try {
    const { BrowserMultiFormatReader } = await import('@zxing/browser')
    const reader = new BrowserMultiFormatReader()

    const controls = await reader.decodeFromVideoDevice(
      undefined,
      videoElement,
      (result, error) => {
        if (result) {
          onResult({
            text: result.getText(),
            format: result.getBarcodeFormat().toString(),
          })
        }
        if (error && !(error.name === 'NotFoundException')) {
          onError?.(error as Error)
        }
      }
    )

    return () => {
      controls.stop()
    }
  } catch (err) {
    onError?.(err as Error)
    return () => {}
  }
}

export async function getCameraDevices(): Promise<MediaDeviceInfo[]> {
  try {
    const { BrowserMultiFormatReader } = await import('@zxing/browser')
    return await BrowserMultiFormatReader.listVideoInputDevices()
  } catch {
    return []
  }
}
