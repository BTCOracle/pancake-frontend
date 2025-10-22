import { formatFiatNumber } from '@pancakeswap/utils/formatFiatNumber'
import { BigNumber as BN } from 'bignumber.js'

export const formatPoolDetailFiatNumber = (value: string | number | BN) => {
  return formatFiatNumber(value, '$').replace(' ', '')
}

/**
 * Formats percentage with bounds checking and proper sign
 * Used across InfinityCL, V3, and Bin position tables
 */
export const formatPercentage = (percentage: number): string => {
  if (Math.abs(percentage) < 0.01) return '0%'
  if (!Number.isFinite(percentage)) return '-%'
  const sign = percentage >= 0 ? '+' : ''
  return `${sign}${percentage.toFixed(1)}%`
}
