import { getCurrencyPriceFromId } from '@pancakeswap/infinity-sdk'
import { useTranslation } from '@pancakeswap/localization'
import { Currency, Price } from '@pancakeswap/swap-sdk-core'
import { AutoRow, Flex, SyncAltIcon, Text } from '@pancakeswap/uikit'
import { RangePriceSection } from 'components/RangePriceSection'
import React, { useMemo, useState } from 'react'
import { InfinityBinPositionDetail } from 'state/farmsV4/state/accountPositions/type'
import { formatPrice } from 'utils/formatCurrencyAmount'
import RateToggle from 'views/AddLiquidityV3/formViews/V3FormView/components/RateToggle'

// export function formatBinIdPrice(
//   price: Price<Currency, Currency> | undefined,
//   locale: string,
//   placeholder?: string,
// ) {
//   if (!price && placeholder !== undefined) {
//     return placeholder
//   }

//   return formatPrice(price, 6, locale)
// }

type BinPositionPriceSectionProps = {
  price0: Price<Currency, Currency> | undefined
  price1: Price<Currency, Currency> | undefined
  currency0: Currency | undefined
  currency1: Currency | undefined
  isMobile?: boolean
  position: InfinityBinPositionDetail | undefined
  activeId: number | undefined
}

export const BinPositionPriceSection: React.FC<BinPositionPriceSectionProps> = ({
  currency0,
  currency1,
  isMobile,
  position,
  activeId,
}) => {
  const {
    t,
    currentLanguage: { locale },
  } = useTranslation()
  const [inverted, setInverted] = useState(false)
  const binStep = position?.poolKey?.parameters.binStep
  const price =
    activeId && binStep && currency0 && currency1
      ? getCurrencyPriceFromId(activeId, binStep, currency0, currency1)
      : undefined
  const minPrice = useMemo(() => {
    return position?.minBinId && binStep && currency0 && currency1
      ? getCurrencyPriceFromId(position.minBinId, binStep, currency0, currency1)
      : undefined
  }, [position?.minBinId, binStep, currency0, currency1])
  const maxPrice = useMemo(() => {
    return position?.maxBinId && binStep && currency0 && currency1
      ? getCurrencyPriceFromId(position.maxBinId, binStep, currency0, currency1)
      : undefined
  }, [position?.maxBinId, binStep, currency0, currency1])

  return (
    <>
      <AutoRow justifyContent="space-between" mb="16px" mt="24px">
        <Text fontSize="12px" color="secondary" bold textTransform="uppercase">
          {t('Price Range')}
        </Text>
        {currency0 && currency1 && (
          <RateToggle currencyA={inverted ? currency1 : currency0} handleRateToggle={() => setInverted(!inverted)} />
        )}
      </AutoRow>
      <AutoRow mb="8px">
        <Flex alignItems="center" justifyContent="space-between" width="100%" flexWrap={['wrap', 'wrap', 'nowrap']}>
          <RangePriceSection
            mr={['0', '0', '16px']}
            mb={['8px', '8px', '0']}
            title={t('Min Price')}
            price={formatPrice(inverted ? maxPrice?.invert() : minPrice, 6, locale)}
            currency0={inverted ? currency0 : currency1}
            currency1={inverted ? currency1 : currency0}
          />
          {isMobile ? null : <SyncAltIcon width="24px" mx="16px" />}
          <RangePriceSection
            ml={['0', '0', '16px']}
            title={t('Max Price')}
            price={formatPrice(inverted ? minPrice?.invert() : maxPrice, 6, locale)}
            currency0={inverted ? currency0 : currency1}
            currency1={inverted ? currency1 : currency0}
          />
        </Flex>
      </AutoRow>

      {currency0 && currency1 ? (
        <RangePriceSection
          title={t('Current Price')}
          currency0={inverted ? currency0 : currency1}
          currency1={inverted ? currency1 : currency0}
          price={formatPrice(inverted ? price?.invert() : price, 6, locale)}
        />
      ) : null}
    </>
  )
}
