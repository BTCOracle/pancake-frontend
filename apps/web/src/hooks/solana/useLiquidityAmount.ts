import { PositionUtils, TokenInfo } from '@pancakeswap/solana-core-sdk'
import { Percent, UnifiedCurrencyAmount } from '@pancakeswap/swap-sdk-core'
import BN from 'bn.js'
import BigNumber from 'bignumber.js'
import { convertRawTokenInfoIntoSPLToken } from 'config/solana-list'
import { useMemo } from 'react'
import { SolanaV3Pool } from 'state/pools/solana'
import { useSolanaTokenPrice } from './useSolanaTokenPrice'
import { useSolanaEpochInfo } from './useSolanaEpochInfo'

export type LiquidityAmountProps = {
  poolInfo: SolanaV3Pool | undefined
  tickLower: number
  tickUpper: number
  liquidity: BN
}

export const useLiquidityAmount = ({ poolInfo, tickLower, tickUpper, liquidity }: LiquidityAmountProps) => {
  const currency0 = useMemo(() => convertRawTokenInfoIntoSPLToken(poolInfo?.mintA as TokenInfo), [poolInfo?.mintA])
  const currency1 = useMemo(() => convertRawTokenInfoIntoSPLToken(poolInfo?.mintB as TokenInfo), [poolInfo?.mintB])
  const { data: epochInfo } = useSolanaEpochInfo()
  const [amount0, amount1] = useMemo(() => {
    if (!currency0 || !currency1 || !poolInfo || !epochInfo || !liquidity || !poolInfo.price) {
      return [undefined, undefined]
    }

    const { amountA, amountB } = PositionUtils.getAmountsFromLiquidity({
      poolInfo,
      ownerPosition: { tickLower, tickUpper },
      liquidity,
      slippage: 0,
      add: false,
      epochInfo,
    })
    return [
      UnifiedCurrencyAmount.fromRawAmount(currency0, amountA.amount.toString()),
      UnifiedCurrencyAmount.fromRawAmount(currency1, amountB.amount.toString()),
    ]
  }, [poolInfo, liquidity, tickLower, tickUpper, currency0, currency1, epochInfo])

  const [amount0Disabled, amount1Disabled] = useMemo(() => {
    if (
      !poolInfo ||
      typeof tickLower !== 'number' ||
      typeof tickUpper !== 'number' ||
      typeof poolInfo.tickCurrent !== 'number'
    )
      return [false, false]

    return [poolInfo.tickCurrent > tickUpper, poolInfo.tickCurrent < tickLower]
  }, [tickLower, tickUpper, poolInfo])

  return {
    amount0,
    amount1,
    amount0Disabled,
    amount1Disabled,
  }
}

export const useLiquidityDepositRatio = ({ poolInfo, tickLower, tickUpper, liquidity }: LiquidityAmountProps) => {
  const { amount0, amount1 } = useLiquidityAmount({ poolInfo, tickLower, tickUpper, liquidity })
  const { data: price0 } = useSolanaTokenPrice({ mint: poolInfo?.mintA?.address, enabled: !!poolInfo?.mintA?.address })
  const { data: price1 } = useSolanaTokenPrice({ mint: poolInfo?.mintB?.address, enabled: !!poolInfo?.mintB?.address })

  return useMemo(() => {
    if (!amount0 || !amount1 || !price0 || !price1) {
      return { ratio0: undefined, ratio1: undefined }
    }
    const value0 = new BigNumber(amount0?.toExact() ?? 0).multipliedBy(price0 ?? 0)
    const value1 = new BigNumber(amount1?.toExact() ?? 0).multipliedBy(price1 ?? 0)
    const totalValue = value0.plus(value1)
    const [ratio0Numerator, ratio0Denominator] = new BigNumber(value0.toNumber() ?? 0)
      .dividedBy(totalValue.toNumber() || 1)
      .toFraction()
    const [ratio1Numerator, ratio1Denominator] = new BigNumber(value1.toNumber() ?? 0)
      .dividedBy(totalValue.toNumber() || 1)
      .toFraction()
    return {
      ratio0: new Percent(ratio0Numerator.toString(), ratio0Denominator.toString()),
      ratio1: new Percent(ratio1Numerator.toString(), ratio1Denominator.toString()),
    }
  }, [amount0, amount1, price0, price1])
}
