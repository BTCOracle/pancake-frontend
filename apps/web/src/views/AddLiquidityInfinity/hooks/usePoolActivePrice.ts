import { BinPool, getCurrencyPriceFromId } from '@pancakeswap/infinity-sdk'
import { Price } from '@pancakeswap/swap-sdk-core'
import { useMemo } from 'react'
import { usePool } from './usePool'

export const usePoolActivePrice = () => {
  const pool = usePool()

  const [currency0, currency1] = useMemo(() => {
    if (!pool) return [undefined, undefined]

    return [pool.token0, pool.token1]
  }, [pool])

  return useMemo(() => {
    if (!pool || !currency0 || !currency1) return undefined

    if (pool.poolType === 'CL') {
      if (!currency0 || !currency1 || !pool?.sqrtRatioX96) return undefined
      return new Price(currency0, currency1, 2n ** 192n, pool.sqrtRatioX96 * pool.sqrtRatioX96)
    }

    if (pool.poolType === 'Bin') {
      const { activeId, binStep } = pool as BinPool
      if (activeId === null || binStep === null) return undefined

      return getCurrencyPriceFromId(activeId, binStep, currency0, currency1)
    }

    return undefined
  }, [pool, currency0, currency1])
}
