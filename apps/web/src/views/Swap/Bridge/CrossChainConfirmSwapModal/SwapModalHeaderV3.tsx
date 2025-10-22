import { useTranslation } from '@pancakeswap/localization'
import { Currency, CurrencyAmount, Percent, TradeType } from '@pancakeswap/sdk'
import { AutoColumn, Button, ErrorIcon, Text } from '@pancakeswap/uikit'
import truncateHash from '@pancakeswap/utils/truncateHash'
import { RowBetween, RowFixed } from 'components/Layout/Row'

import { formatAmount } from '@pancakeswap/utils/formatFractions'
import { DualCurrencyDisplay } from '@pancakeswap/widgets-internal'
import { DISPLAY_PRECISION } from 'config/constants/formatting'
import { warningSeverity } from 'utils/exchange'
import { getFullChainNameById } from 'utils/getFullChainNameById'
import { SwapShowAcceptChanges } from 'views/Swap/components/styleds'

export default function SwapModalHeaderV3({
  inputAmount,
  outputAmount,
  tradeType,
  currencyBalances,
  priceImpactWithoutFee,
  isEnoughInputBalance,
  recipient,
  showAcceptChanges,
  onAcceptChanges,
}: {
  inputAmount: CurrencyAmount<Currency>
  outputAmount: CurrencyAmount<Currency>
  currencyBalances?: {
    INPUT?: CurrencyAmount<Currency>
    OUTPUT?: CurrencyAmount<Currency>
  }
  tradeType: TradeType
  priceImpactWithoutFee?: Percent
  isEnoughInputBalance?: boolean
  recipient?: string
  showAcceptChanges: boolean
  onAcceptChanges: () => void
}) {
  const { t } = useTranslation()

  const priceImpactSeverity = warningSeverity(priceImpactWithoutFee)

  const inputTextColor =
    showAcceptChanges && tradeType === TradeType.EXACT_OUTPUT && isEnoughInputBalance
      ? 'primary'
      : tradeType === TradeType.EXACT_OUTPUT && !isEnoughInputBalance
      ? 'failure'
      : 'text'

  const outputTextColor =
    priceImpactSeverity > 2 ? 'failure' : showAcceptChanges && tradeType === TradeType.EXACT_INPUT ? 'primary' : 'text'

  const truncatedRecipient = recipient ? truncateHash(recipient) : ''

  const recipientInfoText = t('Output will be sent to %recipient%', {
    recipient: truncatedRecipient,
  })

  const [recipientSentToText, postSentToText] = recipientInfoText.split(truncatedRecipient)

  return (
    <AutoColumn gap="md">
      <DualCurrencyDisplay
        mt="8px"
        inputCurrency={inputAmount.currency}
        outputCurrency={outputAmount.currency}
        inputAmount={formatAmount(inputAmount, DISPLAY_PRECISION)}
        outputAmount={formatAmount(outputAmount, DISPLAY_PRECISION)}
        inputChainName={getFullChainNameById(inputAmount.currency.chainId)}
        outputChainName={getFullChainNameById(outputAmount.currency.chainId)}
        inputTextColor={inputTextColor}
        outputTextColor={outputTextColor}
      />

      {showAcceptChanges ? (
        <SwapShowAcceptChanges justify="flex-start" gap="0px">
          <RowBetween>
            <RowFixed>
              <ErrorIcon mr="8px" />
              <Text bold> {t('Price Updated')}</Text>
            </RowFixed>
            <Button onClick={onAcceptChanges}>{t('Accept')}</Button>
          </RowBetween>
        </SwapShowAcceptChanges>
      ) : null}
      {tradeType === TradeType.EXACT_OUTPUT && !isEnoughInputBalance && (
        <AutoColumn justify="flex-start" gap="sm" style={{ padding: '24px 0 0 0px' }}>
          <Text fontSize={12} color="failure" textAlign="left" style={{ width: '100%' }}>
            {t('Insufficient input token balance. Your transaction may fail.')}
          </Text>
        </AutoColumn>
      )}
      {recipient ? (
        <AutoColumn justify="flex-start" gap="sm" style={{ padding: '12px 0 0 0px' }}>
          <Text fontSize={12} color="textSubtle">
            {recipientSentToText}
            <b title={recipient}>{truncatedRecipient}</b>
            {postSentToText}
          </Text>
        </AutoColumn>
      ) : null}
    </AutoColumn>
  )
}
