/**
 * Format pH: Type digits → xx.x format (e.g., 104 → 10.4, 125 → 12.5)
 * Max: 14.0 (pH scale limit)
 * Rule: Last digit becomes decimal (like ABV/Temperature)
 * Limit: Max 3 digits (prevents infinite input)
 */
export const formatPH = (value: string): string => {
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
  if (!isNaN(num) && num > 14.0) return '14.0'

  return formatted
}

// Brix/Temperature: Type 3 digits → xx.x (e.g., 223 → 22.3)
export const formatDecimal = (value: string): string => {
  const digits = value.replace(/\D/g, '')
  if (digits.length <= 2) return digits
  const intPart = digits.slice(0, -1)
  const decPart = digits.slice(-1)
  return `${intPart}.${decPart}`
}

// Parse to number for storage (returns undefined if empty)
export const parseToNumber = (value: string): number | undefined => {
  if (value === '') return undefined
  const num = parseFloat(value)
  return isNaN(num) ? undefined : num
}

/**
 * Validate on blur - format to fixed decimals and clamp to max
 * @param decimals - Number of decimal places (1 for Temp, 2 for pH/Brix)
 */
export const validateOnBlur = (value: string, max: number, decimals: number = 2): string => {
  if (value === '') return ''
  const num = parseFloat(value)
  if (isNaN(num)) return ''
  return Math.min(num, max).toFixed(decimals)
}

// Helper to safely convert to number for display (handles string, number, undefined, null)
export const toNum = (value: string | number | undefined | null): number => {
  if (value === undefined || value === null || value === '') return 0
  if (typeof value === 'string') {
    const parsed = parseFloat(value)
    return isNaN(parsed) ? 0 : parsed
  }
  return value
}
