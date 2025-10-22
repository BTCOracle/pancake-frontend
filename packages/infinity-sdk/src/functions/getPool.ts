import { BigintIsh, Currency } from '@pancakeswap/swap-sdk-core'
import { getPool as getV3Pool, PoolState, Tick, TickConstructorArgs, TickDataProvider } from '@pancakeswap/v3-sdk'
import { PoolType } from '../types'

export interface InfinityPoolState extends PoolState {
  poolType: PoolType
}

export interface GetPoolPrams {
  poolType: PoolType
  currencyA: Currency
  currencyB: Currency
  fee: number
  sqrtRatioX96: BigintIsh
  liquidity: BigintIsh
  tickCurrent: number
  tickSpacing: number
  ticks?: TickDataProvider | (Tick | TickConstructorArgs)[]
}

export const getPool = ({
  currencyA,
  currencyB,
  fee,
  sqrtRatioX96,
  liquidity,
  tickCurrent,
  tickSpacing,
  ticks,
  poolType,
}: GetPoolPrams): InfinityPoolState => {
  return {
    ...getV3Pool({
      currencyA,
      currencyB,
      fee,
      sqrtRatioX96,
      liquidity,
      tickCurrent,
      tickSpacing,
      ticks,
    }),
    poolType,
  }
}
