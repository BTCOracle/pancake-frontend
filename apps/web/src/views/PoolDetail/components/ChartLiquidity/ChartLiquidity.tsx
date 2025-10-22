import { Protocol } from '@pancakeswap/farms'
import { Flex, Spinner } from '@pancakeswap/uikit'
import { ChartInfinityBinLiquidity } from './ChartInfinityBinLiquidity'
import { ChartInfinityCLLiquidity } from './ChartInfinityCLLiquidity'
import { ChartV2Liquidity } from './ChartV2Liquidity'
import { ChartV3Liquidity } from './ChartV3Liquidity'
import { ChartLiquidityProps } from './type'

export const ChartLiquidity: React.FC<ChartLiquidityProps> = ({ address, poolInfo }) => {
  if (!poolInfo)
    return (
      <Flex mt="80px" justifyContent="center">
        <Spinner />
      </Flex>
    )
  return poolInfo.protocol === Protocol.InfinityBIN ? (
    <ChartInfinityBinLiquidity poolInfo={poolInfo} />
  ) : poolInfo.protocol === Protocol.InfinityCLAMM ? (
    <ChartInfinityCLLiquidity poolInfo={poolInfo} />
  ) : poolInfo.protocol === Protocol.V3 ? (
    <ChartV3Liquidity address={address} poolInfo={poolInfo} />
  ) : (
    <ChartV2Liquidity address={address} poolInfo={poolInfo} />
  )
}
