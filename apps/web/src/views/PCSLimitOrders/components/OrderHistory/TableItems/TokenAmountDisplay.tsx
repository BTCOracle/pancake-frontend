import { Currency } from '@pancakeswap/sdk'
import { FlexGap } from '@pancakeswap/uikit'
import { CurrencyLogo, NumberDisplay } from '@pancakeswap/widgets-internal'

interface TokenAmountDisplayProps {
  currency: Currency
  amount: string
}
export const TokenAmountDisplay = ({ currency, amount }: TokenAmountDisplayProps) => {
  return (
    <FlexGap gap="8px" alignItems="center">
      <CurrencyLogo mt="2px" currency={currency} />
      <NumberDisplay value={amount} maximumSignificantDigits={6} suffix={` ${currency.symbol}`} small bold />
    </FlexGap>
  )
}
