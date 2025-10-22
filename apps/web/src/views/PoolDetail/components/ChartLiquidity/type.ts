import type { InfinityBinPoolInfo, InfinityCLPoolInfo, PoolInfo } from 'state/farmsV4/state/type'

export type ChartLiquidityProps = {
  address?: string
  poolInfo?: PoolInfo | null
}

export type BasicChartLiquidityProps = ChartLiquidityProps & {
  liquidityChartData?: LiquidityChartData[]
  defaultZoomLevel?: number
}

export type InfinityCLChartLiquidityProps = {
  poolInfo?: InfinityCLPoolInfo | null
}

export type InfinityBinChartLiquidityProps = {
  poolInfo?: InfinityBinPoolInfo | null
}

export type LiquidityChartData = {
  index: number
  isCurrent: boolean
  activeLiquidity: number
  price0: number
  price1: number
  tvlToken0: number
  tvlToken1: number
}
