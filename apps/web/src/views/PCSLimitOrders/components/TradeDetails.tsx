import { useTranslation } from '@pancakeswap/localization'
import { AutoColumn, Box, BoxProps, DottedHelpText, QuestionHelperV2, RowBetween, Text } from '@pancakeswap/uikit'
import { useAtomValue } from 'jotai'
import { formatNumber } from '@pancakeswap/utils/formatNumber'
import { outputCurrencyAtom } from '../state/currency/currencyAtoms'
import { amountReceivedAtom, feesEarnedUSDAtom } from '../state/form/tradeDetailsAtoms'

export const TradeDetails = (props: BoxProps) => {
  const { t } = useTranslation()
  const outputCurrency = useAtomValue(outputCurrencyAtom)

  const feesEarnedData = useAtomValue(feesEarnedUSDAtom)
  const feesEarnedUSD = feesEarnedData?.feesEarnedUSD

  const amountReceived = useAtomValue(amountReceivedAtom)

  if (!feesEarnedUSD && !amountReceived) {
    return null
  }

  return (
    <Box {...props}>
      <AutoColumn gap="8px">
        <RowBetween>
          <QuestionHelperV2 text={t('Minimum fee earned by the user on order fill')}>
            <DottedHelpText>{t('Fees Earned')}</DottedHelpText>
          </QuestionHelperV2>

          <Text small>
            {feesEarnedUSD
              ? `$${formatNumber(feesEarnedUSD, { maxDecimalDisplayDigits: 4, maximumSignificantDigits: 8 })}`
              : '-'}
          </Text>
        </RowBetween>
        <RowBetween>
          <QuestionHelperV2 text={t('Amount you will receive on order fill')}>
            <DottedHelpText>{t('Amount Received')}</DottedHelpText>
          </QuestionHelperV2>

          <Text small>
            {amountReceived
              ? `${formatNumber(amountReceived, { maxDecimalDisplayDigits: 6, maximumSignificantDigits: 8 })} ${
                  outputCurrency?.symbol
                }`
              : '-'}
          </Text>
        </RowBetween>
      </AutoColumn>
    </Box>
  )
}
