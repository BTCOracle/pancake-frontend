import { FeeAmount } from '@pancakeswap/v3-sdk'

export const PRESET_FEE_LEVELS_INFINITY = [0.01, 0.05, 0.1]
export const PRESET_FEE_LEVELS_V3 = [
  FeeAmount.LOWEST / 1e4,
  FeeAmount.LOW / 1e4,
  FeeAmount.MEDIUM / 1e4,
  FeeAmount.HIGH / 1e4,
]
