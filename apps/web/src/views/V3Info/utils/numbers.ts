import isUndefinedOrNull from '@pancakeswap/utils/isUndefinedOrNull'

// using a currency library here in case we want to add more in future
export const formatDollarAmount = (num: number | undefined, digits = 2, round = true) => {
  if (num !== undefined && num !== null && num <= 0) return '$0'
  if (!num) return '-'
  if (num < 0.001 && digits <= 3) {
    return '<$0.001'
  }

  const formatted = Intl.NumberFormat('en-US', {
    notation: round ? 'compact' : 'standard',
    minimumFractionDigits: num > 1000 ? 2 : digits,
    maximumFractionDigits: num > 1000 ? 2 : digits,
    style: 'currency',
    currency: 'USD',
  }).format(num)

  // More robust trimming of trailing zeros
  if (formatted.includes('.')) {
    // Handle compact notation (e.g., "$1.50K" -> "$1.5K", "$1.00K" -> "$1K")
    // Remove trailing zeros after decimal point, then remove decimal point if no digits remain
    // This regex handles both regular numbers and compact notation
    return formatted.replace(/(\.\d*?)0+([KMB]?)$/, '$1$2').replace(/\.([KMB]?)$/, '$1')
  }

  return formatted
}

// using a currency library here in case we want to add more in future
export const formatAmount = (num: number | undefined, digits = 2) => {
  if (num !== undefined && num <= 0) return '0'
  if (!num) return '-'
  if (num < 0.001) {
    return '<0.001'
  }

  return Intl.NumberFormat('en-US', {
    notation: 'compact',
    minimumFractionDigits: num > 1000 ? 2 : digits,
    maximumFractionDigits: num > 1000 ? 2 : digits,
  }).format(num)
}
