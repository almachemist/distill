/**
 * Numeric input formatters for distillation forms.
 * Apply digit-based formatting WITHOUT premature clamping.
 * Clamp to max AFTER formatting to prevent 333 → 99.9 bug.
 */

/**
 * Format ABV: Type digits → ##.# format (e.g., 855 → 85.5)
 * Max: 95.0% (realistic spirit run limit)
 * Limit: Max 3 digits
 */
export const formatABV = (value: string): string => {
  const digits = value.replace(/\D/g, '')
  if (digits.length === 0) return ''
  const limitedDigits = digits.slice(0, 3)
  let formatted = ''
  if (limitedDigits.length <= 2) {
    formatted = limitedDigits
  } else {
    const intPart = limitedDigits.slice(0, -1)
    const decPart = limitedDigits.slice(-1)
    formatted = `${intPart}.${decPart}`
  }
  const num = parseFloat(formatted)
  if (!isNaN(num) && num > 95.0) return '95.0'
  return formatted
}

/**
 * Format Temperature: Type digits → ##.# format (e.g., 333 → 33.3)
 * Max: 99.9°C
 * Limit: Max 3 digits
 */
export const formatTemperature = (value: string): string => {
  const digits = value.replace(/\D/g, '')
  if (digits.length === 0) return ''
  const limitedDigits = digits.slice(0, 3)
  let formatted = ''
  if (limitedDigits.length <= 2) {
    formatted = limitedDigits
  } else {
    const intPart = limitedDigits.slice(0, -1)
    const decPart = limitedDigits.slice(-1)
    formatted = `${intPart}.${decPart}`
  }
  const num = parseFloat(formatted)
  if (!isNaN(num) && num > 99.9) return '99.9'
  return formatted
}

/**
 * Format Density: Type digits → x.xxx format (e.g., 0839 → 0.839)
 * Max: 2.000
 * Limit: Max 4 digits
 */
export const formatDensity = (value: string): string => {
  const digits = value.replace(/\D/g, '')
  if (digits.length === 0) return ''
  const limitedDigits = digits.slice(0, 4)
  let formatted = ''
  if (limitedDigits.length === 1) {
    formatted = limitedDigits
  } else {
    const intPart = limitedDigits.slice(0, 1)
    const decPart = limitedDigits.slice(1)
    formatted = `${intPart}.${decPart}`
  }
  const num = parseFloat(formatted)
  if (!isNaN(num) && num > 2.0) return '2.000'
  return formatted
}

// Parse to number for storage (returns undefined for empty)
export const parseToNumber = (value: string): number | undefined => {
  if (value === '') return undefined
  const num = parseFloat(value)
  return isNaN(num) ? undefined : num
}

/**
 * Validate on blur - format to fixed decimals and clamp to max.
 * @param decimals - Number of decimal places (1 for ABV/Temp, 2 for Volume, 3 for Density)
 */
export const validateOnBlur = (value: string, max: number, decimals: number = 1): string => {
  if (value === '') return ''
  const num = parseFloat(value)
  if (isNaN(num)) return ''
  return Math.min(num, max).toFixed(decimals)
}

// Auto-calculate LAL from volume and ABV
export const calculateLAL = (volume: number, abv: number): number => {
  return volume * abv * 0.01
}

// Helper to parse number input (returns undefined for empty string)
export const parseNumber = (value: string): number | undefined => {
  return value === '' ? undefined : parseFloat(value)
}

// Safely convert to number for display (handles string, number, undefined, null)
export const toNum = (value: string | number | undefined | null): number => {
  if (value === undefined || value === null || value === '') return 0
  if (typeof value === 'string') {
    const parsed = parseFloat(value)
    return isNaN(parsed) ? 0 : parsed
  }
  return value
}
