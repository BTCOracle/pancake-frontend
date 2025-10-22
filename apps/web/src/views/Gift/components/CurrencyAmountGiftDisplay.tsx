import { CurrencyLogo } from '@pancakeswap/widgets-internal'
import { formatDollarAmount } from 'views/V3Info/utils/numbers'
import { CurrencyAmount, NativeCurrency, Token } from '@pancakeswap/sdk'
import { Flex, FlexProps, Text } from '@pancakeswap/uikit'
import { useStablecoinPrice } from 'hooks/useStablecoinPrice'
import { multiplyPriceByAmount } from 'utils/prices'

export const CurrencyAmountGiftDisplay = ({
  currencyAmount,
  showChainLogo = true,
  ...props
}: {
  currencyAmount: CurrencyAmount<Token | NativeCurrency>
  showChainLogo?: boolean
} & FlexProps) => {
  const stablePrice = useStablecoinPrice(currencyAmount.currency)

  return (
    <Flex {...props}>
      <CurrencyLogo crossOrigin="anonymous" showChainLogo currency={currencyAmount.currency.wrapped} size="40px" />
      <Flex flexDirection="column" ml="8px">
        <Text fontWeight="600" fontSize="14px" color="text">
          {currencyAmount.toSignificant(6)} {currencyAmount.currency.symbol}
        </Text>
        <Text fontSize="12px" color="textSubtle">
          {formatDollarAmount(multiplyPriceByAmount(stablePrice, parseFloat(currencyAmount.toExact())))}
        </Text>
      </Flex>
    </Flex>
  )
}
