import { TickUtils } from '@pancakeswap/solana-core-sdk'
import { UnifiedToken } from '@pancakeswap/swap-sdk-core'
import { tryParsePrice } from '.'

export const tryParsePriceSolana = ({
  tickSpacing,
  tick,
  token0,
  token1,
  baseIn,
}: {
  tickSpacing: number | undefined
  tick: number
  token0?: UnifiedToken
  token1?: UnifiedToken
  baseIn: boolean
}) => {
  try {
    if (!token0 || !token1) {
      return undefined
    }
    const poolInfo = {
      config: { tickSpacing },
      mintA: { decimals: token0.decimals },
      mintB: { decimals: token1.decimals },
    }
    const priceDecimal = TickUtils.getTickPrice({ poolInfo, tick, baseIn })?.price
    const [t0, t1] = baseIn ? [token0, token1] : [token1, token0]
    return tryParsePrice(t0, t1, priceDecimal.toFixed())
  } catch {
    return undefined
  }
}
