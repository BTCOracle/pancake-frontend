import { AutoColumn, AutoRow, Box, Card, CardBody, Flex, FlexGap, Spinner, Text } from '@pancakeswap/uikit'
import styled, { useTheme } from 'styled-components'
import useResolvedTheme from 'hooks/useTheme'
import { formatAmount } from '@pancakeswap/utils/formatInfoNumbers'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Bar, BarChart, ResponsiveContainer, XAxis, ReferenceLine, ReferenceArea, Label, YAxis } from 'recharts'
import { useSolanaV3PositionIdRouteParams } from 'hooks/dynamicRoute/usePositionIdRoute'
import { formatNumber } from '@pancakeswap/utils/formatNumber'
import { usePriceRangeData } from 'hooks/solana/usePriceRange'
import { POSITION_STATUS, SolanaV3PositionDetail } from 'state/farmsV4/state/accountPositions/type'
import { SolanaV3Pool } from 'state/pools/solana'
import { TickMath, TickUtils } from '@pancakeswap/solana-core-sdk'
import { useTranslation } from '@pancakeswap/localization'
import { useIsMounted } from '@pancakeswap/hooks'
import { useFlipCurrentPrice } from 'views/PoolDetail/state/flipCurrentPrice'
import Decimal from 'decimal.js'
import { usePoolChartData, ChartEntry } from '../hooks/usePoolChartData'

interface PositionChartProps {
  poolId: string
  position: SolanaV3PositionDetail
  poolInfo: SolanaV3Pool
  priceLower?: number | string
  priceUpper?: number | string
  timePriceMin?: number
  timePriceMax?: number
  chartHeight?: number
  onPriceRangeChange?: (lower: number, upper: number) => void
}

const chartHeight = 300

export const PositionChart = ({ position, poolInfo }: PositionChartProps) => {
  const { poolId } = useSolanaV3PositionIdRouteParams()
  const [flipCurrentPrice] = useFlipCurrentPrice()
  const baseIn = !flipCurrentPrice
  const { t } = useTranslation()
  const theme = useTheme()
  const { isDark } = useResolvedTheme()
  const { formattedData: chartData, isLoading, error } = usePoolChartData(poolId)

  const initialTickCurrent = useMemo(() => {
    if (!poolInfo.price) return 0
    const price = new Decimal(poolInfo.price)
    const tick = TickMath.getTickWithPriceAndTickspacing(
      baseIn ? price : new Decimal(1).div(price),
      poolInfo.config.tickSpacing,
      poolInfo.mintA.decimals,
      poolInfo.mintB.decimals,
    )
    return tick
  }, [poolInfo, baseIn])

  const [tick0, tick1, tick2] = useMemo(() => {
    const { tickSpacing } = poolInfo.config
    const tickCurrent = poolInfo.tickCurrent ?? initialTickCurrent
    const tick0 = TickUtils.nearestUsableTick(tickCurrent, tickSpacing)
    const tick1 = TickUtils.nearestUsableTick(position.tickLower, tickSpacing)
    const tick2 = TickUtils.nearestUsableTick(position.tickUpper, tickSpacing)
    return [tick0, tick1, tick2]
  }, [poolInfo.tickCurrent, poolInfo.config.tickSpacing, position.tickLower, position.tickUpper, initialTickCurrent])

  const formattedData = useMemo(() => {
    if (!chartData || chartData.length === 0) return []

    let filteredData = chartData

    const maxRange = chartData.length
    const currentRange = tick2 - tick1

    if (maxRange / currentRange >= 2) {
      const margin = currentRange * 0.2

      const minTick = tick1 - margin
      const maxTick = tick2 + margin

      filteredData = chartData.filter((item) => {
        return item.tick >= minTick && item.tick <= maxTick
      })
    }

    return filteredData.sort((a, b) => (baseIn ? a.tick - b.tick : b.tick - a.tick))
  }, [chartData, tick1, tick2, baseIn])

  const [xLower, xCurrent, xUpper] = useMemo(() => {
    const { tickSpacing } = poolInfo.config
    const dLower = formattedData.find((item) => item.tick === tick1)
    let dCurrent = formattedData.find((item) => item.tick === tick0)
    const dUpper = formattedData.find((item) => item.tick === tick2)
    if (!dCurrent && formattedData.length) {
      // try to find the closest tick
      const closestData = formattedData.reduce((acc, item) => {
        if (item.tick < tick0) {
          return item.tick > acc.tick ? item : acc
        }
        if (item.tick > tick0) {
          return Math.abs(item.tick - tick0) < Math.abs(acc.tick - tick0) ? item : acc
        }
        return acc
      }, formattedData[0])
      dCurrent = closestData
    }
    return [
      baseIn ? dLower?.price0 : dUpper?.price1,
      baseIn ? dCurrent?.price0 : dCurrent?.price1,
      baseIn ? dUpper?.price0 : dLower?.price1,
    ]
  }, [formattedData, tick0, tick1, tick2, baseIn, poolInfo.config.tickSpacing])

  const currentPrice = useMemo(() => {
    if (!poolInfo.tickCurrent) return undefined
    const price = TickUtils.getTickPrice({
      poolInfo,
      tick: poolInfo.tickCurrent ?? initialTickCurrent,
      baseIn,
    }).price.toFixed(18)

    return Number(price) < 1
      ? formatNumber(price, { maximumDecimalTrailingZeroes: 4 })
      : formatNumber(price, { maxDecimalDisplayDigits: 2 })
  }, [poolInfo.tickCurrent, initialTickCurrent, baseIn])

  const rangeColor = useMemo(() => {
    return tick0 >= tick1 && tick0 <= tick2 ? theme.colors.success : theme.colors.failure
  }, [tick0, tick1, tick2, theme.colors.success, theme.colors.failure])

  const maxY = useMemo(() => {
    let max = 0
    for (const item of formattedData) {
      if (item.liquidity > max) {
        max = item.liquidity
      }
    }
    return max
  }, [formattedData])

  const [x1, setX1] = useState<number | undefined>(undefined)
  const [x2, setX2] = useState<number | undefined>(undefined)
  const [x0, setX0] = useState<number | undefined>(undefined)

  if (isLoading) {
    return (
      <Card>
        <CardBody>
          <Flex height={`${chartHeight}px`} justifyContent="center" alignItems="center">
            <Spinner />
          </Flex>
        </CardBody>
      </Card>
    )
  }

  if (error || !formattedData.length) {
    return (
      <Card>
        <CardBody>
          <Flex height={`${chartHeight}px`} justifyContent="center" alignItems="center">
            <Text color="textSubtle">{error ? 'Failed to load chart data' : 'No liquidity data available'}</Text>
          </Flex>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card style={{ alignSelf: 'start' }}>
      <CardBody p={32}>
        <RangeBar
          x0={x0}
          x1={x1}
          x2={x2}
          position={position}
          poolInfo={poolInfo}
          baseIn={baseIn}
          rangeColor={rangeColor}
        />

        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            data={formattedData}
            barCategoryGap={0}
            barGap={0}
            margin={{
              top: 20,
              right: 0,
              left: 0,
              bottom: 8,
            }}
          >
            <defs>
              <linearGradient id="liquidityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={isDark ? 'rgba(168, 129, 252, 0.8)' : 'rgba(118, 69, 217, 0.8)'}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={isDark ? 'rgba(168, 129, 252, 0.3)' : 'rgba(118, 69, 217, 0.3)'}
                  stopOpacity={0.8}
                />
              </linearGradient>
            </defs>
            <XAxis
              dataKey={baseIn ? 'price0' : 'price1'}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: theme.colors.textSubtle }}
              tickFormatter={(value) => formatAmount(value, { precision: 2 }) ?? ''}
            />
            <YAxis hide axisLine={false} tickLine={false} domain={[0, maxY]} />

            {xCurrent && (
              <>
                <ReferenceLine x={xCurrent} stroke={theme.colors.secondary} strokeWidth={2}>
                  <Label
                    value={currentPrice ?? ''}
                    position="top"
                    style={{ fill: theme.colors.secondary, fontSize: '12px', fontWeight: 'bold' }}
                  />
                </ReferenceLine>
                <ReferenceLine
                  x={xCurrent}
                  stroke={theme.colors.secondary}
                  strokeWidth={1}
                  shape={(props) => <ComputeX1 x1={props.x1} onEffect={setX0} baseIn={baseIn} />}
                />
              </>
            )}
            {xLower && xUpper && <ReferenceArea x1={xLower} x2={xUpper} fill={rangeColor} fillOpacity={0.1} />}
            {xLower && xUpper && (
              <>
                <ReferenceLine
                  segment={[
                    { x: xLower, y: maxY },
                    { x: xUpper, y: maxY },
                  ]}
                  stroke={rangeColor}
                  position="start"
                  strokeWidth={0}
                  shape={(props) => <ComputeX1 x1={props.x1} onEffect={setX1} baseIn={baseIn} />}
                />
                <ReferenceLine
                  segment={[
                    { x: xLower, y: maxY },
                    { x: xUpper, y: maxY },
                  ]}
                  stroke={rangeColor}
                  position="end"
                  strokeWidth={0}
                  shape={(props) => <ComputeX2 x2={props.x2} onEffect={setX2} baseIn={baseIn} />}
                />
              </>
            )}
            {xLower && <ReferenceLine position="start" x={xLower} stroke={rangeColor} strokeWidth={2} />}
            {xUpper && <ReferenceLine position="end" x={xUpper} stroke={rangeColor} strokeWidth={2} />}

            <Bar dataKey="liquidity" fill="url(#liquidityGradient)" isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>

        <AutoRow justifyContent="space-between">
          <FlexGap alignItems="center" gap="4px">
            <Box
              style={{
                width: '7px',
                height: '7px',
                left: '0px',
                top: '6px',
                background: theme.colors.secondary,
                borderRadius: '10px',
              }}
            />
            <Text fontSize="12px" lineHeight={1.5}>
              {t('Current Price')}{' '}
            </Text>
          </FlexGap>
          <FlexGap alignItems="center" gap="4px">
            <Text fontSize="12px" lineHeight={1.5} fontWeight={600}>
              {currentPrice}
            </Text>
            <Text fontSize="12px" lineHeight={1.5} color="textSubtle">
              {t('%subA% per %subB%', {
                subA: poolInfo.mintB.symbol,
                subB: poolInfo.mintA.symbol,
              })}
            </Text>
          </FlexGap>
        </AutoRow>
      </CardBody>
    </Card>
  )
}

const ComputeX1 = ({ x1, onEffect, baseIn }) => {
  useEffect(() => {
    onEffect(x1)
  }, [x1, baseIn])
  return <></>
}

const ComputeX2 = ({ x2, onEffect, baseIn }) => {
  useEffect(() => {
    onEffect(x2)
  }, [x2, baseIn])
  return <></>
}

const RangeBar = ({ position, poolInfo, baseIn, x1, x2, x0, rangeColor }) => {
  return (
    <AutoColumn width="100%" py="8px" gap="4px">
      <PriceRangeLabel x1={x1} x2={x2} position={position} baseIn={baseIn} poolInfo={poolInfo} />
      <Box width="100%" position="relative">
        <TrackerBar />
        {typeof x1 !== 'undefined' && typeof x2 !== 'undefined' ? (
          <PriceRangeBar left={x1} right={x2} rangeColor={rangeColor} />
        ) : null}
        {typeof x0 !== 'undefined' ? <CurrentPin left={x0} /> : null}
      </Box>
    </AutoColumn>
  )
}

const PriceRangeLabel = ({ x1, x2, position, baseIn, poolInfo }) => {
  const {
    minPriceFormatted: minPrice,
    minPercentage,
    maxPriceFormatted: maxPrice,
    maxPercentage,
  } = usePriceRangeData({
    tickLower: position.tickLower,
    tickUpper: position.tickUpper,
    baseIn,
    poolInfo,
  })
  const displayMinPrice =
    minPrice !== '0'
      ? formatNumber(
          minPrice,
          Number(minPrice) < 1 ? { maximumDecimalTrailingZeroes: 4 } : { maxDecimalDisplayDigits: 4 },
        )
      : '0'
  const displayMaxPrice =
    maxPrice !== '∞'
      ? formatNumber(
          maxPrice,
          Number(maxPrice) < 1 ? { maximumDecimalTrailingZeroes: 4 } : { maxDecimalDisplayDigits: 4 },
        )
      : '∞'

  const leftRef = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)
  const isMounted = useIsMounted()
  const [leftWidth, setLeftWidth] = useState<number | undefined>(undefined)
  const [rightWidth, setRightWidth] = useState<number | undefined>(undefined)
  const intersected = useMemo(() => {
    if (!leftWidth || !rightWidth) return false
    return rightWidth + leftWidth > x2 - x1
  }, [leftWidth, rightWidth, x1, x2])

  useEffect(() => {
    if (leftRef.current && rightRef.current) {
      setLeftWidth(leftRef.current?.clientWidth)
      setRightWidth(rightRef.current?.clientWidth)
    }
  }, [x1, x2])

  return (
    <Box width="100%" position="relative" height="30px">
      <PriceRangeContainer left={x1} right={x2}>
        <AutoRow justifyContent="space-between" flexWrap="nowrap">
          <AutoColumn alignItems="flex-start">
            <Transform distance={-(leftWidth ?? 0) / 2} enabled={intersected}>
              <Text fontSize="12px" lineHeight={1.5} fontWeight={600} ref={leftRef}>
                {displayMinPrice}
              </Text>
              <Text fontSize="10px" color="textSubtle">
                {minPercentage}
              </Text>
            </Transform>
          </AutoColumn>

          <AutoColumn alignItems="flex-end">
            <Transform distance={(rightWidth ?? 0) / 2} enabled={intersected}>
              <Text fontSize="12px" lineHeight={1.5} fontWeight={600} ref={rightRef}>
                {displayMaxPrice}
              </Text>
              <Text fontSize="10px" color="textSubtle" textAlign="right">
                {maxPercentage}
              </Text>
            </Transform>
          </AutoColumn>
        </AutoRow>
      </PriceRangeContainer>
    </Box>
  )
}

const TrackerBar = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 5px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.disabled};
  border: 0.5px solid ${({ theme }) => theme.colors.inputSecondary};
`

const CurrentPin = styled.div<{ left: number }>`
  position: absolute;
  top: -2px;
  left: ${({ left }) => left - 2.5}px;
  width: 5px;
  height: 12px;
  border-radius: 16px;
  background: ${({ theme }) => theme.colors.secondary};

  &:before {
    background-image: url(data:image/svg+xml,%3Csvg%20width%3D%227%22%20height%3D%227%22%20viewBox%3D%220%200%207%207%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M1.14844%202.4598C0.803786%201.79417%201.28689%201%202.03646%201H4.96209C5.71165%201%206.19476%201.79417%205.85011%202.4598L4.38729%205.28495C4.01435%206.00522%202.98419%206.00522%202.61125%205.28495L1.14844%202.4598Z%22%20fill%3D%22%237645D9%22%20stroke%3D%22white%22%2F%3E%3C%2Fsvg%3E);
    background-size: cover;
    background-repeat: no-repeat;
    content: '';
    position: absolute;
    top: -5px;
    left: -1px;
    width: 7px;
    height: 6px;
  }
`

const PriceRangeBar = styled.div<{ left: number; right: number; rangeColor: string }>`
  position: absolute;
  top: 0;
  left: ${({ left }) => left}px;
  width: ${({ right, left }) => right - left}px;
  height: 5px;
  border-radius: 8px;
  background: ${({ rangeColor }) => rangeColor};
`
const PriceRangeContainer = styled.div<{ left: number; right: number }>`
  position: absolute;
  height: 30px;
  top: 0;
  left: ${({ left }) => left}px;
  width: ${({ right, left }) => right - left}px;
`
const Transform = styled.div<{ distance: number; enabled: boolean }>`
  ${({ distance, enabled }) =>
    enabled &&
    `
    transform: translateX(${distance}px);
  `}
`
