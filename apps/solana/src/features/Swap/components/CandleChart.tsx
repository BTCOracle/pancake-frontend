import { AbsoluteCenter, Box, GridItem, Spinner, Text, useColorMode } from '@chakra-ui/react'
import { ApiV3Token } from '@pancakeswap/solana-core-sdk'
import dayjs from 'dayjs'
import {
  CandlestickData,
  ColorType,
  CrosshairMode,
  IChartApi,
  ISeriesApi,
  MouseEventParams,
  TickMarkType,
  createChart
} from 'lightweight-charts'
import { useEffect, useRef } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import useFetchPoolKLine, { TimeType } from '@/hooks/pool/useFetchPoolKLine'
import { colors } from '@/theme/cssVariables/colors'
import { formatCurrency } from '@/utils/numberish/formatter'

interface Props {
  onPriceChange?: (val: { current: number; change: number } | undefined) => void
  baseMint?: ApiV3Token
  quoteMint?: ApiV3Token
  timeType: TimeType
  untilDate?: number
}

const getChartColors = (colorMode: 'light' | 'dark') => {
  const chartTextColor = colorMode === 'light' ? '#474ABB' : '#ABC4FF'
  const axisColor = '#ecf5ff1a'
  const volumeColor = colorMode === 'light' ? '#7191FF4d' : '#7081943e'
  const upColor = '#31D0AA'
  const downColor = '#ED4B9E'
  const crosshairColor = colorMode === 'light' ? '#474ABB' : '#ABC4FF'
  const gridColor = colorMode === 'light' ? '#E7E3EB80' : '#38324180'

  return { chartTextColor, axisColor, volumeColor, upColor, downColor, crosshairColor, gridColor }
}

export default function CandleChart({ onPriceChange, baseMint, quoteMint, timeType, untilDate }: Props) {
  const { colorMode } = useColorMode()

  const { t } = useTranslation()
  const chartCtrRef = useRef<HTMLDivElement>(null)
  const timeTypeRef = useRef<TimeType>(timeType)
  const chartRef = useRef<{ chart?: IChartApi; candle?: ISeriesApi<'Candlestick'>; volume?: ISeriesApi<'Histogram'> }>({})
  const pair = baseMint && quoteMint ? `${baseMint?.address}-${quoteMint?.address}` : undefined
  timeTypeRef.current = timeType

  const { data, currentPrice, change24H, isLoading, isEmptyResult, loadMore } = useFetchPoolKLine({
    base: baseMint?.address,
    quote: quoteMint?.address,
    timeType,
    untilDate
  })

  useEffect(() => {
    if (!pair) return
    const { chartTextColor, axisColor, volumeColor, upColor, downColor, crosshairColor, gridColor } = getChartColors(colorMode)
    const chart = createChart(chartCtrRef.current!, {
      layout: { textColor: chartTextColor, background: { type: ColorType.Solid, color: 'transparent' }, fontFamily: 'Space Grotesk' },
      grid: { vertLines: { color: gridColor }, horzLines: { color: gridColor } },
      crosshair: { mode: CrosshairMode.Normal, vertLine: { color: crosshairColor }, horzLine: { color: crosshairColor } },
      autoSize: true,
      rightPriceScale: {
        visible: true,
        borderColor: axisColor
      },
      timeScale: {
        borderColor: axisColor,
        tickMarkFormatter: (time: number, tickMarkType: TickMarkType) => {
          if (tickMarkType === 0)
            return dayjs(time * 1000)
              .utc()
              .format('YYYY/M')
          if (tickMarkType < 3)
            return dayjs(time * 1000)
              .utc()
              .format('M/D')
          return dayjs(time * 1000)
            .utc()
            .format('H:mm')
        }
      },
      localization: {
        // timeFormatter: (time: number) => {
        //   return dayjs(time).utc().format('H:mm')
        // }
      }
    })

    const candlestickSeries = chart.addCandlestickSeries({
      upColor,
      downColor,
      borderVisible: false,
      wickUpColor: upColor,
      wickDownColor: downColor,
      priceLineVisible: true,
      priceFormat: {
        type: 'custom',
        formatter: (val: number) => {
          return val ? formatCurrency(val, { maximumDecimalTrailingZeroes: 5 }) : val
        },
        minMove: 10 / 10 ** (baseMint?.decimals ?? 2)
      }
    })

    candlestickSeries.priceScale().applyOptions({
      scaleMargins: {
        // positioning the price scale for the area series
        top: 0.1,
        bottom: 0.1
      }
    })

    const volumeSeries = chart.addHistogramSeries({
      color: volumeColor,
      priceFormat: {
        type: 'volume'
      },
      priceScaleId: '', // set as an overlay by setting a blank priceScaleId
      lastValueVisible: false,
      priceLineVisible: false
      // // set the positioning of the volume series
    })

    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.7,
        bottom: 0
      }
    })

    chart.timeScale().applyOptions({
      timeVisible: true
    })

    const legend = document.createElement('div') as any
    legend.style = `position: absolute; left: 0px; top: 12px; z-index: 1; font-size: 12px; font-family: sans-serif; line-height: 12px; font-weight: 400;`
    chartCtrRef.current?.appendChild(legend)

    const firstRow = document.createElement('div')
    firstRow.style.color = 'black'
    legend.appendChild(firstRow)
    const getLastBar = (series: ISeriesApi<'Candlestick'>) => {
      return series.dataByIndex(Number.MAX_SAFE_INTEGER, -1) as CandlestickData | undefined
      // return lastIndex ? series.dataByIndex(lastIndex) : undefined
    }
    const setTooltipHtml = (
      o: number | string,
      h: number | string,
      l: number | string,
      c: number | string,
      diff: number,
      change: string
    ) => {
      legend.innerHTML = `
<div>
  <span>O <span style="color: #3DDBB5;">${Number(o)}</span></span>
  <span>H <span style="color: #3DDBB5;">${Number(h)}</span></span>
  <span>L <span style="color: #3DDBB5;">${Number(l)}</span></span>
  <span>C <span style="color: #3DDBB5;">${Number(c)}</span></span>
  <span style="color: ${diff < 0 ? '#ED4B9E' : '#3DDBB5;'}">${Number(diff).toFixed(5)}</span>
  <span style="color: ${diff < 0 ? '#ED4B9E' : '#3DDBB5;'}">${change}</span>
</div>`
    }

    const updateLegend = (param: MouseEventParams | undefined) => {
      const validCrosshairPoint = !(
        param === undefined ||
        param.time === undefined ||
        (param.point && (param.point.x < 0 || param.point.y < 0))
      )
      const bar = (validCrosshairPoint ? param.seriesData.get(candlestickSeries) : getLastBar(candlestickSeries)) as
        | CandlestickData
        | undefined
      if (!bar) return
      setTooltipHtml(
        Number(bar.open).toFixed(5),
        Number(bar.high).toFixed(5),
        Number(bar.low).toFixed(5),
        Number(bar.close).toFixed(5),
        Number(bar.close - bar.open),
        `${((100 * Number(bar.close - bar.open)) / bar.open).toFixed(5)}%`
      )
    }

    // to prevent load next page in immediately next mount
    setTimeout(() => {
      chart.subscribeCrosshairMove(updateLegend)
      chart.timeScale().subscribeVisibleLogicalRangeChange((newVisiableLogicalRange) => {
        const { from } = newVisiableLogicalRange ?? {}
        const leftBoundaryIsReached = from ? from < 50 /* margin  */ : false
        if (leftBoundaryIsReached) {
          loadMore()
        }
      })
      updateLegend(undefined)
    }, 100)

    chartRef.current.chart = chart
    chartRef.current.candle = candlestickSeries
    chartRef.current.volume = volumeSeries
    return () => {
      chart.remove()
      chartRef.current = {}
    }
  }, [loadMore, pair])

  useEffect(() => {
    if (!chartRef.current.chart) return
    chartRef.current.candle?.setData(data)
    chartRef.current.volume?.setData(data.map(({ value, volColor, time }) => ({ value, color: volColor, time })))
  }, [data, timeType, pair])

  useEffect(() => {
    chartRef.current.chart?.timeScale().resetTimeScale()
  }, [timeType])

  useEffect(() => {
    const { chartTextColor, axisColor, volumeColor, upColor, downColor, crosshairColor, gridColor } = getChartColors(colorMode)
    chartRef.current.chart?.applyOptions({
      layout: { textColor: chartTextColor },
      crosshair: { vertLine: { color: crosshairColor }, horzLine: { color: crosshairColor } },
      grid: { vertLines: { color: gridColor }, horzLines: { color: gridColor } }
    })
    chartRef.current.volume?.applyOptions({
      color: volumeColor
    })
  }, [colorMode])

  useEffect(() => {
    onPriceChange?.(
      currentPrice != null
        ? {
            current: currentPrice,
            change: change24H || 0
          }
        : undefined
    )
  }, [onPriceChange, currentPrice, change24H])

  return (
    <GridItem gridArea="chart" position="relative" alignSelf="stretch">
      {isLoading && (
        <AbsoluteCenter>
          <Spinner color={colors.textSecondary} />
        </AbsoluteCenter>
      )}
      {isEmptyResult ? (
        <AbsoluteCenter>
          <Box fontSize="sm" color={colors.textTertiary} whiteSpace="nowrap" textAlign="center">
            <Text mb={2}>{t('No data for this chart.')}</Text>
            <Text>{t('Please wait for a moment or try refreshing the page.')}</Text>
          </Box>
        </AbsoluteCenter>
      ) : null}
      <div
        ref={chartCtrRef}
        style={{ opacity: isEmptyResult ? 0 : 1, width: '100%', height: '100%', contain: 'size', paddingTop: '20px' }}
      />
    </GridItem>
  )
}
