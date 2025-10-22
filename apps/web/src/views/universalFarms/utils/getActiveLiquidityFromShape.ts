import { BinLiquidityShape, getLiquidityShape, getPriceX128FromId, SCALE_OFFSET } from '@pancakeswap/infinity-sdk'
import { BIG_TWO, BIG_ZERO } from '@pancakeswap/utils/bigNumber'
import BN from 'bignumber.js'

export function getActiveLiquidityFromShape({
  activeBinId,
  lowerBinId,
  upperBinId,
  binStep,
  amount0,
  amount1,
  liquidityShape,
}: {
  activeBinId: number
  lowerBinId: number
  upperBinId: number
  binStep: number
  amount0: bigint
  amount1: bigint
  liquidityShape: BinLiquidityShape
}) {
  const shape = getLiquidityShape({
    shape: liquidityShape,
    lowerBinId,
    upperBinId,
    activeIdDesired: activeBinId,
    amount0: amount0 ?? 0n,
    amount1: amount1 ?? 0n,
  })
  const price = getPriceX128FromId(BigInt(activeBinId), BigInt(binStep))
  const activeX = shape.distributionX[activeBinId - lowerBinId] ?? 0n
  const activeY = shape.distributionY[activeBinId - lowerBinId] ?? 0n
  const Y = new BN((((amount1 ?? 0n) * activeY) / BigInt(1e18)).toString()).times(BIG_TWO.pow(SCALE_OFFSET.toString()))
  const X = new BN((((amount0 ?? 0n) * activeX) / BigInt(1e18)).toString()).times(price.toString())
  const activeLiquidity = BIG_ZERO.plus(Y).plus(X)

  return activeLiquidity
}
