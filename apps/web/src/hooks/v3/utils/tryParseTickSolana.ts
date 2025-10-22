import { TickUtils } from '@pancakeswap/solana-core-sdk'
import Decimal from 'decimal.js'
import { MintState } from 'views/AddLiquidityV3/formViews/V3FormView/form/reducer'

export const tryParseTickSolana = ({
  tickSpacing,
  price,
  token0Decimal,
  token1Decimal,
  baseIn,
}: {
  tickSpacing: number | undefined
  price: MintState['leftRangeTypedValue'] | MintState['rightRangeTypedValue']
  token0Decimal?: number
  token1Decimal?: number
  baseIn: boolean
}): number | undefined => {
  if (!price || !tickSpacing || typeof price === 'boolean' || !token0Decimal || !token1Decimal) return undefined
  try {
    const poolInfo = {
      config: { tickSpacing },
      mintA: { decimals: token0Decimal },
      mintB: { decimals: token1Decimal },
    }
    const pDec = new Decimal((price.numerator / BigInt(10 ** price.quoteCurrency.decimals)).toString()).div(
      new Decimal((price.denominator / BigInt(10 ** price.baseCurrency.decimals)).toString()),
    )
    const { tick } = TickUtils.getPriceAndTick({ poolInfo, price: pDec, baseIn })
    const { price: currentPrice, tick: currentTick } = TickUtils.getTickPrice({ poolInfo, tick, baseIn })
    const { price: nextPrice, tick: nextTick } = TickUtils.getTickPrice({ poolInfo, tick: tick + tickSpacing, baseIn })
    return currentPrice.minus(pDec).abs().lt(nextPrice.minus(pDec).abs()) ? currentTick : nextTick
  } catch {
    return undefined
  }
}
