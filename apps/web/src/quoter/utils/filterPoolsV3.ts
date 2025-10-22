import { Pool, PoolType } from '@pancakeswap/smart-router'
import { Currency } from '@pancakeswap/swap-sdk-core'
import { TokenFee } from 'hooks/useTokenFee'

export function filterPools(
  pools: Pool[],
  baseCurrency?: Currency,
  currency?: Currency,
  tokenInFee?: TokenFee,
  tokenOutFee?: TokenFee,
) {
  if (tokenInFee && tokenInFee.sellFeeBps > 0n) {
    return pools?.filter(
      (pool) =>
        !(
          pool.type === PoolType.V3 &&
          baseCurrency &&
          (pool.token0.equals(baseCurrency) || pool.token1.equals(baseCurrency))
        ),
    )
  }
  if (tokenOutFee && tokenOutFee.buyFeeBps > 0n) {
    return pools?.filter(
      (pool) =>
        !(pool.type === PoolType.V3 && currency && (pool.token0.equals(currency) || pool.token1.equals(currency))),
    )
  }

  return pools
}
