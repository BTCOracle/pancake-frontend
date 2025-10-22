import { Protocol } from '@pancakeswap/farms'
import { getCurrencyPriceFromId } from '@pancakeswap/infinity-sdk'
import { useTranslation } from '@pancakeswap/localization'
import { Currency, Price } from '@pancakeswap/swap-sdk-core'
import { Box, FlexGap, Text, useMatchBreakpoints } from '@pancakeswap/uikit'
import { Liquidity, PricePeriodRangeChart } from '@pancakeswap/widgets-internal'
import { BinRangeSelector } from 'components/Liquidity/Form/BinRangeSelector'
import { useInfinityPoolIdRouteParams } from 'hooks/dynamicRoute/usePoolIdRoute'
import { useBinPriceRangeCallback } from 'hooks/infinity/useBinPriceRangeCallback'
import { useCurrencyByPoolId } from 'hooks/infinity/useCurrencyByPoolId'
import isUndefined from 'lodash/isUndefined'
import { useCallback, useMemo, useState } from 'react'
import { useBinRangeQueryState, useInverted } from 'state/infinity/shared'
import { FieldLiquidityShape } from 'components/Liquidity/Form/FieldLiquidityShape'
import { useBinIdRange } from '../hooks/useBinIdRange'
import { useBinDensityChartData } from '../hooks/useDensityChartData'
import { usePool } from '../hooks/usePool'
import { getAxisTicks } from '../utils'
import { useTokenRateData } from './useTokenToTokenRateData'

const DEFAULT_ZOOM = {
  initialMin: 0.9,
  initialMax: 1.1,
  min: 0.00001,
  max: 20,
}

export const BinPriceRangePanel: React.FC = () => {
  const { t } = useTranslation()
  const { isMobile } = useMatchBreakpoints()
  const { poolId, chainId } = useInfinityPoolIdRouteParams()
  const { currency0, currency1, baseCurrency, quoteCurrency } = useCurrencyByPoolId({ poolId, chainId })
  const pool = usePool<'Bin'>()
  const [inverted, setInverted] = useInverted()
  const [pricePeriod, setPricePeriod] = useState<Liquidity.PresetRangeItem>(Liquidity.PRESET_RANGE_ITEMS[0])

  const { isLoading: isChartDataLoading, formattedData: liquidityData } = useBinDensityChartData({
    baseCurrency,
    quoteCurrency,
    poolId,
    chainId,
  })

  const { isLoading: isTokenRateLoading, data: rateData } = useTokenRateData({
    baseCurrency,
    quoteCurrency,
    chainId: currency0?.chainId,
    period: pricePeriod.value,
    poolId,
    protocol: Protocol.InfinityBIN,
  })
  const { maxBinId, minBinId } = useBinIdRange()

  const { onLowerUserInput, onUpperUserInput } = useBinPriceRangeCallback({
    currency0,
    currency1,
    minBinId,
    maxBinId,
    binStep: pool?.binStep,
  })

  const price: Price<Currency, Currency> | undefined = useMemo(() => {
    if (!pool) return undefined

    return getCurrencyPriceFromId(pool.activeId, pool.binStep, pool.token0, pool.token1)
  }, [pool])

  const onChangeBothPrice = useCallback(
    (min: string, max: string) => {
      if (inverted) {
        onUpperUserInput(min)
        onLowerUserInput(max)
      } else {
        onLowerUserInput(min)
        onUpperUserInput(max)
      }
    },
    [inverted, onLowerUserInput, onUpperUserInput],
  )
  const onChangeMinPrice = useCallback(
    (min: string) => {
      if (inverted) {
        onUpperUserInput(min)
      } else {
        onLowerUserInput(min)
      }
    },
    [inverted, onLowerUserInput, onUpperUserInput],
  )
  const onChangeMaxPrice = useCallback(
    (max: string) => {
      if (inverted) {
        onLowerUserInput(max)
      } else {
        onUpperUserInput(max)
      }
    },
    [inverted, onLowerUserInput, onUpperUserInput],
  )

  const [{ lowerBinId, upperBinId }] = useBinRangeQueryState()

  const [priceLower, priceUpper] = useMemo(() => {
    if (!pool || isUndefined(pool?.binStep)) return ['', '']

    let minPrice_: Price<Currency, Currency> | undefined
    let maxPrice_: Price<Currency, Currency> | undefined

    if (lowerBinId) {
      minPrice_ = getCurrencyPriceFromId(lowerBinId, pool.binStep, pool.token0, pool.token1)
    }

    if (upperBinId) {
      maxPrice_ = getCurrencyPriceFromId(upperBinId, pool.binStep, pool.token0, pool.token1)
    }

    return [minPrice_, maxPrice_]
  }, [pool, lowerBinId, upperBinId])

  const zoom = useMemo(() => {
    if (!price || !maxBinId || !minBinId || !liquidityData?.length || !pool?.binStep) {
      return DEFAULT_ZOOM
    }
    const maxPrice = getCurrencyPriceFromId(maxBinId, pool.binStep, pool.token0, pool.token1)
    const minPrice = getCurrencyPriceFromId(minBinId, pool.binStep, pool.token0, pool.token1)
    const min = Number(minPrice.divide(price).toSignificant(6))
    const max = Number(maxPrice.divide(price).toSignificant(6))
    return {
      ...DEFAULT_ZOOM,
      initialMin: min * 0.9999,
      initialMax: max * 1.0001,
    }
  }, [price, maxBinId, minBinId, liquidityData?.length, pool?.binStep, pool?.token0, pool?.token1])

  const axisTicks = useMemo(() => getAxisTicks(pricePeriod.value, isMobile), [pricePeriod.value, isMobile])

  return (
    <>
      <FlexGap
        flexDirection={isMobile ? 'column' : 'row'}
        justifyContent={isMobile ? 'flex-start' : 'space-between'}
        gap="16px"
      >
        <Liquidity.PriceRangeDatePicker onChange={setPricePeriod} value={pricePeriod} />
        <Liquidity.RateToggle
          currencyA={baseCurrency}
          handleRateToggle={() => {
            setInverted(!inverted)
          }}
          showReset={false}
        />
      </FlexGap>
      <FlexGap gap="2px" mt="16px" mb="-18px">
        <Text color="textSubtle" small>
          {t('Current Price')}: {inverted ? price?.invert().toFixed(8) : price?.toFixed(8)}
        </Text>
        <Text color="textSubtle" small>
          {t('%assetA% per %assetB%', {
            assetA: inverted ? currency0?.symbol : currency1?.symbol,
            assetB: inverted ? currency1?.symbol : currency0?.symbol,
          })}
        </Text>
      </FlexGap>
      <Box mb="8px">
        <PricePeriodRangeChart
          isLoading={isChartDataLoading || isTokenRateLoading}
          key={currency0?.wrapped.address}
          zoomLevel={zoom}
          baseCurrency={baseCurrency}
          quoteCurrency={quoteCurrency}
          price={price ? parseFloat(inverted ? price.invert().toFixed(8) : price.toFixed(8)) : undefined}
          priceLower={priceLower}
          priceUpper={priceUpper}
          onBothRangeInput={onChangeBothPrice}
          onMinPriceInput={onChangeMinPrice}
          onMaxPriceInput={onChangeMaxPrice}
          formattedData={liquidityData}
          priceHistoryData={rateData}
          axisTicks={axisTicks}
          interactive
        />
      </Box>
      <Box mb="8px">
        <BinRangeSelector
          currency0={currency0}
          currency1={currency1}
          binStep={pool?.binStep ?? null}
          activeBinId={pool?.activeId}
          maxBinId={maxBinId}
          minBinId={minBinId}
        />
      </Box>
      <Box mb="8px">
        <FieldLiquidityShape mt="24px" />
      </Box>
    </>
  )
}
