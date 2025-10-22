import { Currency, Price } from '@pancakeswap/swap-sdk-core'
import { AutoColumn } from '@pancakeswap/uikit'
import { Liquidity, ZoomLevels } from '@pancakeswap/widgets-internal'
import { RangeSelectorV2 } from 'components/Liquidity/RangeSelectorV2'
import { useCLPriceRange } from 'hooks/infinity/useCLPriceRange'
import { useCLPriceRangeCallback } from 'hooks/infinity/useCLPriceRangeCallback'
import { useMemo } from 'react'
import { useClRangeQueryState, useInverted } from 'state/infinity/shared'

type CLRangeSelectorProps = {
  baseCurrency: Currency | undefined
  quoteCurrency: Currency | undefined
  tickSpacing: number | undefined
  currentPrice: Price<Currency, Currency> | undefined | null
  quickAction: number | null
  handleQuickAction: (value: number | null, zoomLevel: ZoomLevels) => void
}

export const CLRangeSelector: React.FC<CLRangeSelectorProps> = ({
  baseCurrency,
  quoteCurrency,
  tickSpacing,
  currentPrice,
  quickAction,
  handleQuickAction,
}) => {
  const [inverted] = useInverted()
  const [{ lowerTick, upperTick }] = useClRangeQueryState()
  const haveRange = useMemo(() => lowerTick !== null && upperTick !== null, [lowerTick, upperTick])

  const { onLowerDecrement, onLowerIncrement, onUpperDecrement, onUpperIncrement, onLowerUserInput, onUpperUserInput } =
    useCLPriceRangeCallback(baseCurrency, quoteCurrency, tickSpacing, currentPrice)

  const { minPrice, maxPrice } = useCLPriceRange(baseCurrency, quoteCurrency, tickSpacing ?? undefined)

  const [
    onMinPriceDecrement,
    onMinPriceIncrement,
    onMaxPriceDecrement,
    onMaxPriceIncrement,
    onMinPriceUserInput,
    onMaxPriceUserInput,
  ] = useMemo(() => {
    return inverted
      ? [onUpperIncrement, onUpperDecrement, onLowerIncrement, onLowerDecrement, onUpperUserInput, onLowerUserInput]
      : [onLowerDecrement, onLowerIncrement, onUpperDecrement, onUpperIncrement, onLowerUserInput, onUpperUserInput]
  }, [
    inverted,
    onLowerDecrement,
    onLowerIncrement,
    onUpperDecrement,
    onUpperIncrement,
    onLowerUserInput,
    onUpperUserInput,
  ])

  return (
    <AutoColumn gap="8px">
      <RangeSelectorV2
        baseCurrency={baseCurrency}
        quoteCurrency={quoteCurrency}
        minPrice={minPrice}
        maxPrice={maxPrice}
        onMinPriceDecrement={onMinPriceDecrement}
        onMinPriceIncrement={onMinPriceIncrement}
        onMaxPriceDecrement={onMaxPriceDecrement}
        onMaxPriceIncrement={onMaxPriceIncrement}
        onMinPriceUserInput={onMinPriceUserInput}
        onMaxPriceUserInput={onMaxPriceUserInput}
      />
      <Liquidity.PriceRangePicker
        tickSpacing={tickSpacing}
        value={haveRange ? quickAction : undefined}
        onChange={handleQuickAction}
      />
    </AutoColumn>
  )
}
