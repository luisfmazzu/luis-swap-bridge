/**
 * Input validation utilities
 */

/**
 * Handle numeric input change, allowing only numbers and decimals
 * @param value - The input value
 * @param callback - Callback function to call with the validated value
 */
export function handleNumericInputChange(
  value: string,
  callback: (validatedValue: string) => void
) {
  // Remove any characters that are not digits, dots, or leading minus
  let cleaned = value.replace(/[^0-9.-]/g, '')
  
  // Ensure only one decimal point
  const parts = cleaned.split('.')
  if (parts.length > 2) {
    cleaned = parts[0] + '.' + parts.slice(1).join('')
  }
  
  // Ensure only one minus sign at the beginning
  if (cleaned.indexOf('-') > 0) {
    cleaned = cleaned.replace(/-/g, '')
  }
  
  // Remove multiple minus signs
  const minusCount = (cleaned.match(/-/g) || []).length
  if (minusCount > 1) {
    cleaned = cleaned.replace(/-/g, '')
    if (value.startsWith('-')) {
      cleaned = '-' + cleaned
    }
  }
  
  // For monetary inputs, we typically don't want negative numbers
  // Remove minus signs for positive monetary values
  cleaned = cleaned.replace(/^-/, '')
  
  // Limit decimal places to reasonable amount (e.g., 18 for tokens)
  const decimalIndex = cleaned.indexOf('.')
  if (decimalIndex !== -1 && cleaned.length - decimalIndex > 19) {
    cleaned = cleaned.substring(0, decimalIndex + 19)
  }
  
  callback(cleaned)
}

/**
 * Validate if a string is a valid positive number
 * @param value - The string to validate
 * @returns boolean indicating if the value is a valid positive number
 */
export function isValidPositiveNumber(value: string): boolean {
  if (!value || value === '.' || value === '') return true // Allow empty and decimal point
  const num = parseFloat(value)
  return !isNaN(num) && num >= 0 && /^[0-9]*\.?[0-9]*$/.test(value)
}