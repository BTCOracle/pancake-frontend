import { Pool } from '@pancakeswap/infinity-sdk'
import { useTranslation } from '@pancakeswap/localization'
import { Currency, Price } from '@pancakeswap/swap-sdk-core'
import { AutoRow, Flex, SyncAltIcon, Text } from '@pancakeswap/uikit'
import { RangePriceSection } from 'components/RangePriceSection'
import { Bound } from 'config/constants/types'
import { formatTickPrice } from 'hooks/v3/utils/formatTickPrice'
import React, { useMemo } from 'react'
import { formatPrice } from 'utils/formatCurrencyAmount'
import RateToggle from 'views/AddLiquidityV3/formViews/V3FormView/components/RateToggle'

type PositionPriceSectionProps = {
  priceUpper: Price<Currency, Currency> | undefined
  priceLower: Price<Currency, Currency> | undefined
  isMobile: boolean
  currencyBase?: Currency
  currencyQuote?: Currency
  inverted: boolean
  pool: Pool | null
  tickAtLimit: {
    LOWER: boolean
    UPPER: boolean
  }
  setInverted: (value: boolean) => void
}

export const PositionPriceSection: React.FC<PositionPriceSectionProps> = ({
  currencyQuote,
  currencyBase,
  isMobile,
  priceUpper,
  priceLower,
  inverted,
  pool,
  tickAtLimit: _tickAtLimit,
  setInverted,
}) => {
  const {
    t,
    currentLanguage: { locale },
  } = useTranslation()

  const tickAtLimit = useMemo(() => {
    if (inverted) {
      return {
        [Bound.LOWER]: _tickAtLimit[Bound.UPPER],
        [Bound.UPPER]: _tickAtLimit[Bound.LOWER],
      }
    }
    return _tickAtLimit
  }, [_tickAtLimit, inverted])

  return (
    <>
      <AutoRow justifyContent="space-between" mb="16px" mt="24px">
        <Text fontSize="12px" color="secondary" bold textTransform="uppercase">
          {t('Price Range')}
        </Text>
        {currencyBase && currencyQuote && (
          <RateToggle currencyA={currencyBase} handleRateToggle={() => setInverted(!inverted)} />
        )}
      </AutoRow>
      <AutoRow mb="8px">
        <Flex alignItems="center" justifyContent="space-between" width="100%" flexWrap={['wrap', 'wrap', 'nowrap']}>
          <RangePriceSection
            mr={['0', '0', '16px']}
            mb={['8px', '8px', '0']}
            title={t('Min Price')}
            price={formatTickPrice(priceLower, tickAtLimit, Bound.LOWER, locale)}
            currency0={currencyQuote}
            currency1={currencyBase}
          />
          {isMobile ? null : <SyncAltIcon width="24px" mx="16px" />}
          <RangePriceSection
            ml={['0', '0', '16px']}
            title={t('Max Price')}
            price={formatTickPrice(priceUpper, tickAtLimit, Bound.UPPER, locale)}
            currency0={currencyQuote}
            currency1={currencyBase}
          />
        </Flex>
      </AutoRow>
      {pool && currencyQuote && currencyBase ? (
        <RangePriceSection
          title={t('Current Price')}
          currency0={currencyQuote}
          currency1={currencyBase}
          price={formatPrice(inverted ? pool.token1Price : pool.token0Price, 6, locale)}
        />
      ) : null}
    </>
  )
}
