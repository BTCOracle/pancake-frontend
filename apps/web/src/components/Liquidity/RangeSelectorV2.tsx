import { useTranslation } from '@pancakeswap/localization'
import { Currency, Price } from '@pancakeswap/swap-sdk-core'
import { Grid, GridProps, Text } from '@pancakeswap/uikit'
import { formatPrice } from '@pancakeswap/utils/formatFractions'
import React, { useMemo } from 'react'
import { StepCounterV2 } from './StepCounterV2'

export type RangeSelectorV2Props = {
  baseCurrency: Currency | undefined
  quoteCurrency: Currency | undefined
  minPrice: Price<Currency, Currency> | string | undefined
  maxPrice: Price<Currency, Currency> | string | undefined
  minPriceIncrementDisabled?: boolean
  maxPriceIncrementDisabled?: boolean
  minPriceDecrementDisabled?: boolean
  maxPriceDecrementDisabled?: boolean
  onMaxPriceDecrement: () => void
  onMaxPriceIncrement: () => void
  onMinPriceDecrement: () => void
  onMinPriceIncrement: () => void
  onMaxPriceUserInput: (value?: string) => void
  onMinPriceUserInput: (value?: string) => void
  minError?: boolean
  maxError?: boolean
  inverted?: boolean
} & GridProps

export const RangeSelectorV2: React.FC<RangeSelectorV2Props> = ({
  baseCurrency,
  quoteCurrency,
  minPrice,
  maxPrice,
  onMinPriceDecrement,
  onMinPriceIncrement,
  onMaxPriceDecrement,
  onMaxPriceIncrement,
  onMinPriceUserInput,
  onMaxPriceUserInput,
  minPriceIncrementDisabled,
  maxPriceIncrementDisabled,
  minPriceDecrementDisabled,
  maxPriceDecrementDisabled,
  minError,
  maxError,
  ...props
}) => {
  const { t } = useTranslation()
  const [minPriceValue, maxPriceValue] = useMemo(
    () => [
      minPrice instanceof Price ? (minPrice.denominator ? formatPrice(minPrice, 8) : '0') : minPrice,
      maxPrice instanceof Price ? (maxPrice.denominator ? formatPrice(maxPrice, 8) : '0') : maxPrice,
    ],
    [minPrice, maxPrice],
  )

  return (
    <Grid gridTemplateColumns={['1fr', null, null, '1fr 1fr']} gridGap="8px" width="100%" {...props}>
      <StepCounterV2
        error={minError}
        baseCurrency={baseCurrency}
        quoteCurrency={quoteCurrency}
        value={minPriceValue}
        decrement={onMinPriceDecrement}
        increment={onMinPriceIncrement}
        incrementDisabled={minPriceIncrementDisabled}
        decrementDisabled={minPriceDecrementDisabled}
        onUserInput={onMinPriceUserInput}
        title={
          <Text color="secondary" fontSize="12px" textTransform="uppercase" bold>
            {t('Min Price')}
          </Text>
        }
      />
      <StepCounterV2
        error={maxError}
        baseCurrency={baseCurrency}
        quoteCurrency={quoteCurrency}
        value={maxPriceValue}
        decrement={onMaxPriceDecrement}
        increment={onMaxPriceIncrement}
        incrementDisabled={maxPriceIncrementDisabled}
        decrementDisabled={maxPriceDecrementDisabled}
        onUserInput={onMaxPriceUserInput}
        title={
          <Text color="secondary" fontSize="12px" textTransform="uppercase" bold>
            {t('Max Price')}
          </Text>
        }
      />
    </Grid>
  )
}
