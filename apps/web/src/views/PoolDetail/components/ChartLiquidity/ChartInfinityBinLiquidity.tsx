import { CurrencyAmount } from '@pancakeswap/swap-sdk-core'
import { useMemo } from 'react'
import { InfinityBinPoolInfo } from 'state/farmsV4/state/type'
import { BinTickDataItem, useBinDensityChartData } from 'views/AddLiquidityInfinity/hooks/useDensityChartData'
import { BasicChartLiquidity } from './BasicChartLiquidity'
import { InfinityBinChartLiquidityProps } from './type'

const formatDataFn = ({
  poolTickData,
  poolInfo,
  activeBinId,
}: {
  poolTickData?: BinTickDataItem[]
  activeBinId?: number
  poolInfo?: InfinityBinPoolInfo | null
}) => {
  if (!poolTickData || !poolInfo) {
    return undefined
  }
  const formattedTicksData = poolTickData.map((t, i) => {
    const { price0, price1, reserveX, reserveY, liquidityActive } = t
    const active = t.binId === activeBinId
    const reserve0 = CurrencyAmount.fromRawAmount(poolInfo.token0, reserveX).toFixed()
    const reserve1 = CurrencyAmount.fromRawAmount(poolInfo.token1, reserveY).toFixed()

    return {
      index: i,
      isCurrent: active,
      activeLiquidity: parseFloat(liquidityActive.toString()),
      price0,
      price1,
      tvlToken0: parseFloat(reserve0),
      tvlToken1: parseFloat(reserve1),
    }
  })
  formattedTicksData?.forEach((entry, i) => {
    if (i > 0) {
      formattedTicksData[i - 1].tvlToken0 = entry.tvlToken0
      formattedTicksData[i - 1].tvlToken1 = entry.tvlToken1
    }
  })
  return formattedTicksData
}

export const ChartInfinityBinLiquidity: React.FC<InfinityBinChartLiquidityProps> = ({ poolInfo }) => {
  const { formattedData: poolTickData, activeBinId } = useBinDensityChartData({
    baseCurrency: poolInfo?.token0,
    quoteCurrency: poolInfo?.token1,
    poolId: poolInfo?.poolId,
    chainId: poolInfo?.chainId,
  })

  const formattedData = useMemo(
    () =>
      formatDataFn({
        poolTickData,
        poolInfo,
        activeBinId,
      }),
    [activeBinId, poolInfo, poolTickData],
  )

  return <BasicChartLiquidity poolInfo={poolInfo} liquidityChartData={formattedData} defaultZoomLevel={0} />
}
