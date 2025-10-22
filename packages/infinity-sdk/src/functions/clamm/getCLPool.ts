import { getPool, GetPoolPrams, InfinityPoolState } from '../getPool'

export interface InfinityCLPoolState extends InfinityPoolState {
  poolType: 'CL'
}

export const getCLPool = ({
  currencyA,
  currencyB,
  fee,
  sqrtRatioX96,
  liquidity,
  tickCurrent,
  tickSpacing,
  ticks,
}: Omit<GetPoolPrams, 'poolType'>): InfinityPoolState => {
  return {
    ...getPool({
      currencyA,
      currencyB,
      fee,
      sqrtRatioX96,
      liquidity,
      tickCurrent,
      tickSpacing,
      ticks,
      poolType: 'CL',
    }),
  }
}
