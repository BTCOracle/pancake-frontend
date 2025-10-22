import { UnifiedCurrency } from '@pancakeswap/swap-sdk-core'
import { AutoColumn, Row, FlexGap, Text, AtomBoxProps } from '@pancakeswap/uikit'
import { formatNumber } from '@pancakeswap/utils/formatNumber'
import { CurrencyLogo } from '@pancakeswap/widgets-internal'

export const EarningsWithToken: React.FC<{
  currency: UnifiedCurrency
  earningsAmount: number
  earningsUsd: number
  rowProps?: AtomBoxProps
}> = ({ currency, earningsAmount, earningsUsd, rowProps }) => {
  return (
    <AutoColumn>
      <Row gap="8px" {...rowProps}>
        <CurrencyLogo currency={currency} size="16px" />
        <FlexGap gap="8px">
          <Text fontSize="12px" color="textSubtle">
            {formatNumber(earningsAmount)}
          </Text>
          <Text fontSize="12px" color="textSubtle" fontWeight={600}>
            {' '}
            {currency.symbol}{' '}
          </Text>
        </FlexGap>
      </Row>
      <Row gap="8px" justifyContent="flex-end">
        <Text fontSize="12px" color="textSubtle">
          ~${formatNumber(earningsUsd)}
        </Text>
      </Row>
    </AutoColumn>
  )
}
