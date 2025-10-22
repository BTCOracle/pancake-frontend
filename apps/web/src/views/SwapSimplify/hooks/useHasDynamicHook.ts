import { findHook, HOOK_CATEGORY } from '@pancakeswap/infinity-sdk'
import { OrderType, PriceOrder } from '@pancakeswap/price-api-sdk'
import { PoolType } from '@pancakeswap/smart-router'
import { InfinityTradeWithoutGraph } from '@pancakeswap/smart-router/dist/evm/infinity-router'
import { TradeType } from '@pancakeswap/swap-sdk-core'
import { useMemo } from 'react'
import { Address } from 'viem'
import { isAddress } from 'viem/utils'

type Trade = InfinityTradeWithoutGraph<TradeType> | undefined

export function detectHasDynamicHook(trade: Trade) {
  if (!trade) return false

  const { chainId } = trade.inputAmount.currency
  const pools = trade.routes
    .map((r) => r.pools)
    .flat()
    .filter((pool) => pool.type === PoolType.InfinityBIN || pool.type === PoolType.InfinityCL)
  if (pools.length === 0) return false

  const hooks = pools.map((pool) => pool.hooks).filter((hook) => hook && isAddress(hook)) as Address[]

  return hooks.some((hook) => {
    return findHook(hook, chainId)?.category?.includes(HOOK_CATEGORY.DynamicFees) ?? false
  })
}

export const useHasDynamicHook = (order?: PriceOrder): boolean => {
  return useMemo(() => {
    if (order?.type !== OrderType.PCS_CLASSIC) return false

    return detectHasDynamicHook(order?.trade)
  }, [order?.trade, order?.type])
}
