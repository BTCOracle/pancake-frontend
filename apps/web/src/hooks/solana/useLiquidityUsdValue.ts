import { useMemo } from 'react'
import BigNumber from 'bignumber.js'
import { SolanaV3Pool } from 'state/pools/solana'
import BN from 'bn.js'
import { useSolanaTokenPrice } from './useSolanaTokenPrice'
import { useLiquidityAmount } from './useLiquidityAmount'

type UseLiquidityUsdValueProps = {
  poolInfo: SolanaV3Pool
  tickLower: number
  tickUpper: number
  liquidity: BN | undefined
}

export const useLiquidityUsdValue = ({ poolInfo, tickLower, tickUpper, liquidity }: UseLiquidityUsdValueProps) => {
  const { amount0, amount1 } = useLiquidityAmount({
    poolInfo,
    tickLower,
    tickUpper,
    liquidity,
  })
  const { data: price0 } = useSolanaTokenPrice({
    mint: poolInfo?.mintA?.address,
    enabled: !!poolInfo?.mintA?.address,
  })
  const { data: price1 } = useSolanaTokenPrice({
    mint: poolInfo?.mintB?.address,
    enabled: !!poolInfo?.mintB?.address,
  })

  return useMemo(() => {
    if (!amount0 || !amount1 || !price0 || !price1) {
      return {
        usdValue0: undefined,
        usdValue1: undefined,
      }
    }
    return {
      usdValue0: new BigNumber(amount0?.toExact() ?? 0).multipliedBy(price0 ?? 0),
      usdValue1: new BigNumber(amount1?.toExact() ?? 0).multipliedBy(price1 ?? 0),
      totalUsdValue: new BigNumber(amount0?.toExact() ?? 0)
        .multipliedBy(price0 ?? 0)
        .plus(new BigNumber(amount1?.toExact() ?? 0).multipliedBy(price1 ?? 0)),
    }
  }, [amount0, amount1, price0, price1])
}
