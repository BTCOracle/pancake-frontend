import { BIG_ZERO } from '@pancakeswap/utils/bigNumber'
import BigNumber from 'bignumber.js'

export interface AprData {
  lpApr?: number | string
  cakeApr?: { value: number | string } | null
  merklApr?: number
  incentraApr?: number
  numerator: BigNumber
  denominator: BigNumber
}

/**
 * Converts APR data to numbers for calculations
 * Used across InfinityCL, V3, and Bin position tables
 */
export const convertAprDataToNumbers = (aprData: {
  lpApr?: number | string
  cakeApr?: { value: number | string } | null
  merklApr?: number
  incentraApr?: number
  numerator?: BigNumber
  denominator?: BigNumber
}): AprData => {
  return {
    lpApr: parseFloat((aprData.lpApr || '0').toString()),
    cakeApr: aprData.cakeApr ? { value: parseFloat((aprData.cakeApr.value || '0').toString()) } : null,
    merklApr: aprData.merklApr || 0,
    incentraApr: aprData.incentraApr || 0,
    numerator: aprData.numerator || BIG_ZERO,
    denominator: aprData.denominator || BIG_ZERO,
  }
}

/**
 * Calculates total APR from individual APR components
 * Common calculation used across all position tables
 */
export const calculateTotalApr = (aprData: AprData): number => {
  const lpApr = typeof aprData.lpApr === 'string' ? parseFloat(aprData.lpApr) : aprData.lpApr
  const cakeApr = aprData.cakeApr
    ? typeof aprData.cakeApr.value === 'string'
      ? parseFloat(aprData.cakeApr.value)
      : aprData.cakeApr.value
    : 0
  const merklApr = aprData.merklApr || 0
  const incentraApr = aprData.incentraApr || 0

  return Number(lpApr || 0) + Number(cakeApr || 0) + Number(merklApr || 0) + Number(incentraApr || 0)
}
