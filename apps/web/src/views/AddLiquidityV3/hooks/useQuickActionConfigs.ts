import { ZoomLevels } from '@pancakeswap/widgets-internal'
import { QUICK_ACTION_CONFIGS } from '../types'

export const useQuickActionConfigs = ({
  defaultRangePoints,
  feeAmount,
}: {
  defaultRangePoints?: number[]
  feeAmount?: number
}): { [percentage: number]: ZoomLevels } | undefined => {
  if (defaultRangePoints?.length) {
    const entries = defaultRangePoints.reduce((acc, p) => {
      const initialMin = 1 - p / 100
      const initialMax = 1 + p / 100
      // eslint-disable-next-line no-param-reassign
      acc[p] = {
        initialMin,
        initialMax,
        min: 0.00001,
        max: 20,
      }
      return acc
    }, {} as { [percentage: number]: ZoomLevels })
    return entries
  }
  if (!feeAmount) return undefined
  return QUICK_ACTION_CONFIGS[feeAmount]
}
