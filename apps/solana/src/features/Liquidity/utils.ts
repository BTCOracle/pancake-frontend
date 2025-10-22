import { isClient } from '@/utils/common'
import { LiquidityActionModeType, LiquidityTabOptionType } from './Decrease/components/type'

export const SIDE = {
  BASE: 'base',
  QUOTE: 'quote'
}

const CACHE_KEY = '_ray_liq_'
type PoolType = 'standard' | 'clmm'

export interface PairData {
  baseMint: string
  quoteMint: string
}
export const getPairCache = (key: PoolType): PairData => {
  if (!isClient()) return { baseMint: '', quoteMint: '' }
  const cache = localStorage.getItem(`_${key}_${CACHE_KEY}`)
  return cache ? JSON.parse(cache) : { baseMint: '', quoteMint: '' }
}

export const setPairCache = (params: { key: PoolType } & Partial<PairData>) => {
  if (!isClient()) return
  const { key, ...values } = params
  const currentCache = getPairCache(key)
  localStorage.setItem(
    `_${key}_${CACHE_KEY}`,
    JSON.stringify({
      ...currentCache,
      ...values
    })
  )
}

export const tabValueModeMapping: { [key in LiquidityTabOptionType]: LiquidityActionModeType } = {
  'Add Liquidity': 'add',
  'Stake Liquidity': 'stake',
  'Unstake Liquidity': 'unstake',
  'Remove Liquidity': 'remove'
}
