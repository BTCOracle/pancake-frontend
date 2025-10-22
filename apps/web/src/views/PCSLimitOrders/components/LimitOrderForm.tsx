import { useTranslation } from '@pancakeswap/localization'
import { ErrorIcon, Message, Skeleton, Text } from '@pancakeswap/uikit'
import CurrencyInputPanelSimplify from 'components/CurrencyInputPanelSimplify'
import { FlipButton } from 'components/FlipButton'
import { useAtomValue, useSetAtom } from 'jotai'
import { Suspense, useCallback } from 'react'
import { FormContainer } from 'views/SwapSimplify/InfinitySwap/FormContainer'
import { formattedAmountsAtom, setInputAtom } from 'views/PCSLimitOrders/state/form/inputAtoms'
import { Currency } from '@pancakeswap/sdk'
import { inputCurrencyAtom, outputCurrencyAtom } from '../state/currency/currencyAtoms'
import { Field } from '../types/limitOrder.types'
import { flipCurrenciesAtom, setCurrencyAtom } from '../state/currency/setCurrencyAtoms'
import { useSupportedTokens } from '../hooks/useSupportedTokens'
import { useLimitOrderUserBalance } from '../hooks/useLimitOrderUserBalance'

export const LimitOrderForm = () => {
  const { t } = useTranslation()
  const { inputTokens, outputTokens, isNativeInputSupported, isNativeOutputSupported } = useSupportedTokens()

  const { maxInputBalance, maxOutputBalance, getPercentInputCurrency, getPercentOutputCurrency } =
    useLimitOrderUserBalance()

  const inputCurrency = useAtomValue(inputCurrencyAtom)
  const outputCurrency = useAtomValue(outputCurrencyAtom)
  const formattedAmounts = useAtomValue(formattedAmountsAtom)

  const setInput = useSetAtom(setInputAtom)
  const setCurrency = useSetAtom(setCurrencyAtom)
  const flipCurrencies = useSetAtom(flipCurrenciesAtom)

  const { showMinimumUSDWarning, showMinimumBNBWarning } = useLimitOrderUserBalance()

  const handleInput = useCallback(
    (field: Field, value: string | undefined) => {
      if (value === formattedAmounts[field]) return
      setInput({ field, value })
    },
    [formattedAmounts, setInput],
  )

  return (
    <>
      <FormContainer>
        <Suspense fallback={<Skeleton animation="pulse" variant="round" width="100%" height="80px" />}>
          <CurrencyInputPanelSimplify
            id="limit-order-input"
            currency={inputCurrency}
            otherCurrency={outputCurrency}
            tokensToShow={inputTokens}
            showNative={isNativeInputSupported}
            title={
              <Text color="textSubtle" small bold>
                {t('Sell')}
              </Text>
            }
            defaultValue={formattedAmounts[Field.CURRENCY_A]}
            onUserInput={(value) => handleInput(Field.CURRENCY_A, value)}
            onCurrencySelect={(c) => setCurrency({ field: Field.CURRENCY_A, newCurrency: c as Currency })}
            showCommonBases={false}
            supportCrossChain={false}
            showUSDPrice
            showMaxButton
            onPercentInput={(percent) => handleInput(Field.CURRENCY_A, getPercentInputCurrency(percent))}
            onMax={() => handleInput(Field.CURRENCY_A, maxInputBalance)}
          />
        </Suspense>
        {showMinimumUSDWarning && (
          <Message
            variant="danger"
            padding="12px"
            style={{ borderRadius: '20px' }}
            icon={<ErrorIcon color="destructive" width="24px" height="24px" />}
          >
            <Text lineHeight="1.8" small>
              {showMinimumBNBWarning
                ? t('Order Size must meet a minimum of 0.05 BNB')
                : t('Order Size must meet a minimum of 50 USD')}
            </Text>
          </Message>
        )}
        <Suspense fallback={<Skeleton animation="pulse" variant="round" width="100%" height="40px" />}>
          <FlipButton onFlip={flipCurrencies} />
        </Suspense>
        <Suspense fallback={<Skeleton animation="pulse" variant="round" width="100%" height="80px" />}>
          <CurrencyInputPanelSimplify
            id="limit-order-output"
            currency={outputCurrency}
            otherCurrency={inputCurrency}
            tokensToShow={outputTokens}
            showNative={isNativeOutputSupported}
            title={
              <Text color="textSubtle" small bold>
                {t('Buy')}
              </Text>
            }
            defaultValue={formattedAmounts[Field.CURRENCY_B]}
            onUserInput={(value) => handleInput(Field.CURRENCY_B, value)}
            onCurrencySelect={(c) => setCurrency({ field: Field.CURRENCY_B, newCurrency: c as Currency })}
            showCommonBases={false}
            supportCrossChain={false}
            showUSDPrice
            showMaxButton
            onPercentInput={(percent) => handleInput(Field.CURRENCY_B, getPercentOutputCurrency(percent))}
            onMax={() => handleInput(Field.CURRENCY_B, maxOutputBalance)}
          />
        </Suspense>
      </FormContainer>
    </>
  )
}
