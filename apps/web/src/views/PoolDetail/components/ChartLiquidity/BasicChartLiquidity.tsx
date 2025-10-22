import { Box, Flex, Spinner } from '@pancakeswap/uikit'
import { formatFiatNumber } from '@pancakeswap/utils/formatFiatNumber'
import { formatAmount } from '@pancakeswap/utils/formatInfoNumbers'
import { useCurrencyUsdPrice } from 'hooks/useCurrencyUsdPrice'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartToolTip } from './ChartToolTip'
import { CurrentPriceLabel } from './CurrentPriceLabel'
import { ActionButton, ControlsWrapper } from './styled'
import { BasicChartLiquidityProps } from './type'

const ZOOM_INTERVAL = 20
const DEFAULT_ZOOM_LEVEL = 14

export const BasicChartLiquidity: React.FC<BasicChartLiquidityProps> = ({
  poolInfo,
  liquidityChartData,
  defaultZoomLevel,
}) => {
  const [zoomLevel, setZoomLevel] = useState(defaultZoomLevel ?? DEFAULT_ZOOM_LEVEL)
  const [zoomInDisabled, setZoomInDisabled] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number | undefined>()

  const { data: token0Price } = useCurrencyUsdPrice(poolInfo?.token0.wrapped)
  const { data: token1Price } = useCurrencyUsdPrice(poolInfo?.token1.wrapped)

  const handleZoomIn = useCallback(() => {
    if (!zoomInDisabled) {
      setZoomLevel(zoomLevel + 1)
    }
  }, [zoomInDisabled, zoomLevel])

  const handleZoomOut = useCallback(() => {
    setZoomInDisabled(false)
    setZoomLevel((z) => z - 1)
  }, [])

  const zoomedData = useMemo(() => {
    if (liquidityChartData) {
      if (zoomLevel <= 0) return liquidityChartData
      return liquidityChartData.slice(ZOOM_INTERVAL * zoomLevel, -ZOOM_INTERVAL * zoomLevel)
    }
    return undefined
  }, [liquidityChartData, zoomLevel])

  const zoomedDataWithUSD = useMemo(() => {
    if (!zoomedData) return zoomedData

    return zoomedData.map((dataPoint) => {
      let liquidityUSD = 0

      if (token0Price && token1Price && poolInfo?.token0Price) {
        // Use the same logic as ChartToolTip to determine which token to use
        if (Number(poolInfo.token0Price) > dataPoint.price1) {
          liquidityUSD = token0Price * dataPoint.tvlToken0
        } else {
          liquidityUSD = token1Price * dataPoint.tvlToken1
        }
      } else {
        // Fallback to activeLiquidity if USD prices are not available
        liquidityUSD = dataPoint.activeLiquidity
      }

      return {
        ...dataPoint,
        liquidityUSD,
      }
    })
  }, [zoomedData, token0Price, token1Price, poolInfo?.token0Price])

  useEffect(() => {
    if (!liquidityChartData || !liquidityChartData.length) {
      setZoomInDisabled(true)
    } else {
      setZoomInDisabled(2 * ZOOM_INTERVAL * (zoomLevel + 1) + 1 >= liquidityChartData?.length)
    }
  }, [zoomLevel, liquidityChartData])

  if (!liquidityChartData) {
    return (
      <Box height="380px" mb="-20px">
        <ResponsiveContainer width="100%" height="100%">
          <Flex justifyContent="center">
            <Spinner />
          </Flex>
        </ResponsiveContainer>
      </Box>
    )
  }

  return (
    <Box height="380px" mb="-20px" position="relative">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={zoomedDataWithUSD}
          margin={{
            top: 20,
            right: 20,
            left: 20,
            bottom: 60,
          }}
          onMouseMove={(state) => {
            if (state?.activePayload?.[0]?.payload) {
              setActiveIndex(state.activeTooltipIndex)
            }
          }}
          onMouseLeave={() => {
            setActiveIndex(undefined)
          }}
        >
          <XAxis
            dataKey="price0"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#9383B4' }}
            tickFormatter={(value) => formatAmount(value, { precision: 2 }) ?? ''}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#9383B4' }}
            tickFormatter={(value) => formatFiatNumber(value)}
            orientation="right"
            width={80}
            tickMargin={10}
          />
          <Tooltip
            content={(props) => (
              <ChartToolTip
                {...props.payload?.[0]?.payload}
                currentPrice={poolInfo?.token0Price}
                currency0={poolInfo?.token0.wrapped}
                currency1={poolInfo?.token1.wrapped}
                activeLiquidity={props.payload?.[0]?.payload?.activeLiquidity}
                isCurrent={props.payload?.[0]?.payload?.isCurrent}
              />
            )}
            cursor={{ fill: 'transparent' }}
          />
          <Bar dataKey="liquidityUSD" fill="#1FC7D4" isAnimationActive={false} radius={16}>
            {zoomedDataWithUSD?.map((entry, index) => {
              return (
                <Cell
                  key={`cell-${entry.index}`}
                  fill={entry.isCurrent ? '#ED4B9E' : '#1FC7D4'}
                  fillOpacity={activeIndex === undefined ? 1 : activeIndex === index ? 1 : 0.3}
                  style={{ transition: 'fill-opacity 0.2s ease' }}
                />
              )
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <CurrentPriceLabel data={zoomedDataWithUSD} poolInfo={poolInfo} />
      <ControlsWrapper>
        <ActionButton disabled={false} onClick={handleZoomOut}>
          -
        </ActionButton>
        <ActionButton disabled={zoomInDisabled} onClick={handleZoomIn}>
          +
        </ActionButton>
      </ControlsWrapper>
    </Box>
  )
}
