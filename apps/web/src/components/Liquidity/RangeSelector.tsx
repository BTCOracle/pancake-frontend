import { useTranslation } from '@pancakeswap/localization'
import { Currency, Price, Token, sortCurrencies } from '@pancakeswap/swap-sdk-core'
import { FlexGap, FlexGapProps, Text } from '@pancakeswap/uikit'
import { Bound } from 'config/constants/types'
import { priceToClosestTick } from 'hooks/infinity/utils'
import { useMemo } from 'react'
import { StepCounter } from './StepCounter'

interface RangeSelectorProps extends FlexGapProps {
  currencyA?: Currency | null
  currencyB?: Currency | null
  priceLower?: Price<Currency, Currency>
  priceUpper?: Price<Currency, Currency>
  ticksAtLimit: { [bound in Bound]?: boolean | undefined }
  tickSpaceLimits?: { [bound in Bound]?: number | undefined }
  onMinPriceChange: (value?: Price<Currency | Token, Currency | Token>) => void
  onMaxPriceChange: (value?: Price<Currency | Token, Currency | Token>) => void
  onLowerDecrement: () => Price<Currency, Currency> | undefined
  onLowerIncrement: () => Price<Currency, Currency> | undefined
  onUpperDecrement: () => Price<Currency, Currency> | undefined
  onUpperIncrement: () => Price<Currency, Currency> | undefined
}

export const RangeSelector = ({
  currencyA,
  currencyB,
  priceLower,
  priceUpper,
  ticksAtLimit,
  tickSpaceLimits,
  onMinPriceChange,
  onMaxPriceChange,
  onLowerDecrement,
  onLowerIncrement,
  onUpperDecrement,
  onUpperIncrement,

  ...props
}: RangeSelectorProps) => {
  const { t } = useTranslation()

  const isSorted = useMemo(() => {
    if (!currencyA || !currencyB) return true

    const [currency0] = sortCurrencies([currencyA, currencyB])

    return currency0 === currencyA
  }, [currencyA, currencyB])

  const leftPrice = isSorted ? priceLower : priceUpper?.invert()
  const rightPrice = isSorted ? priceUpper : priceLower?.invert()

  const leftValue = useMemo(() => {
    if (ticksAtLimit[isSorted ? Bound.LOWER : Bound.UPPER]) return '0'

    if (
      tickSpaceLimits?.[Bound.LOWER] !== undefined &&
      leftPrice &&
      priceToClosestTick(leftPrice) <= tickSpaceLimits[Bound.LOWER]
    ) {
      return '0'
    }

    return leftPrice?.toSignificant(5) ?? ''
  }, [isSorted, leftPrice, tickSpaceLimits, ticksAtLimit])

  const rightValue = useMemo(() => {
    if (ticksAtLimit[isSorted ? Bound.UPPER : Bound.LOWER]) return '∞'

    if (
      tickSpaceLimits?.[Bound.LOWER] !== undefined &&
      rightPrice &&
      priceToClosestTick(rightPrice) <= tickSpaceLimits[Bound.LOWER]
    ) {
      return '0'
    }

    if (
      tickSpaceLimits?.[Bound.UPPER] !== undefined &&
      rightPrice &&
      priceToClosestTick(rightPrice) >= tickSpaceLimits[Bound.UPPER]
    ) {
      return '∞'
    }

    return rightPrice?.toSignificant(5) ?? ''
  }, [isSorted, rightPrice, tickSpaceLimits, ticksAtLimit])

  return (
    <>
      <FlexGap gap="16px" width="100%" {...props}>
        <StepCounter
          value={leftValue}
          decrement={isSorted ? onLowerDecrement : onUpperDecrement}
          increment={isSorted ? onLowerIncrement : onUpperIncrement}
          decrementDisabled={ticksAtLimit[isSorted ? Bound.LOWER : Bound.UPPER]}
          incrementDisabled={ticksAtLimit[isSorted ? Bound.LOWER : Bound.UPPER]}
          onUserInput={onMinPriceChange}
          title={
            <Text color="secondary" style={{ textTransform: 'uppercase' }} small bold>
              {t('Min Price')}
            </Text>
          }
          tokenA={currencyA}
          tokenB={currencyB}
        />
        <StepCounter
          value={rightValue}
          decrement={isSorted ? onUpperDecrement : onLowerIncrement}
          increment={isSorted ? onUpperIncrement : onLowerDecrement}
          incrementDisabled={ticksAtLimit[isSorted ? Bound.UPPER : Bound.LOWER]}
          decrementDisabled={ticksAtLimit[isSorted ? Bound.UPPER : Bound.LOWER]}
          onUserInput={onMaxPriceChange}
          title={
            <Text color="secondary" style={{ textTransform: 'uppercase' }} small bold>
              {t('Max Price')}
            </Text>
          }
          tokenA={currencyA}
          tokenB={currencyB}
        />
      </FlexGap>
    </>
  )
}
