import { SmartRouter } from '@pancakeswap/smart-router'
import { useCallback } from 'react'

export function createSimpleUseGetBestTradeHook<T>(
  getBestTrade: (...args: Parameters<typeof SmartRouter.getBestTrade>) => Promise<T | undefined | null>,
) {
  return function useGetBestTrade() {
    return useCallback(getBestTrade, [])
  }
}
