import { useMemo } from 'react'

import useFetchPoolChartLiquidity from './useFetchPoolChartLiquidity'
import useFetchPoolChartTvl from './useFetchPoolChartTvl'
import useFetchPoolChartVolume, { TimeType } from './useFetchPoolChartVolume'

export default function useFetchPoolChartData({
  category,
  timeType,
  poolAddress,
  baseMint,
  refreshInterval
}: {
  category: 'liquidity' | 'volume' | 'tvl'
  timeType: TimeType
  poolAddress?: string
  baseMint?: string
  refreshInterval?: number
}) {
  const {
    data: liquidityData,
    isEmptyResult: isEmptyLiquidityResult,
    isLoading: isLiquidityLoading
  } = useFetchPoolChartLiquidity({
    disable: category !== 'liquidity',
    id: poolAddress,
    refreshInterval
  })

  const {
    data: volumeData,
    isEmptyResult: isEmptyVolumeResult,
    isLoading: isVolumeLoading
  } = useFetchPoolChartVolume({
    disable: category !== 'volume',
    poolAddress,
    baseMint,
    timeType,
    refreshInterval
  })

  const {
    data: tvlData,
    isEmptyResult: isEmptyTvlResult,
    isLoading: isTvlLoading
  } = useFetchPoolChartTvl({
    disable: category !== 'tvl',
    id: poolAddress,
    refreshInterval
  })

  const result = useMemo(() => {
    switch (category) {
      case 'liquidity':
        return {
          data: liquidityData.map((i) => ({ time: Number(i.time) * 1000, v: Number(i.liquidity) })),
          isEmptyResult: isEmptyLiquidityResult,
          isLoading: isLiquidityLoading
        }
      case 'volume':
        return {
          data: volumeData.map((i) => ({ time: Number(i.time) * 1000, v: i.value })),
          isEmptyResult: isEmptyVolumeResult,
          isLoading: isVolumeLoading
        }
      case 'tvl':
        return {
          data: tvlData.map((i) => ({ time: Number(i.time) * 1000, v: Number(i.tvl) })),
          isEmptyResult: isEmptyTvlResult,
          isLoading: isTvlLoading
        }
      default:
        return {
          data: [],
          isEmptyResult: true,
          isLoading: false
        }
    }
  }, [
    category,
    liquidityData,
    isEmptyLiquidityResult,
    isLiquidityLoading,
    volumeData,
    isEmptyVolumeResult,
    isVolumeLoading,
    tvlData,
    isEmptyTvlResult,
    isTvlLoading
  ])

  return result
}
