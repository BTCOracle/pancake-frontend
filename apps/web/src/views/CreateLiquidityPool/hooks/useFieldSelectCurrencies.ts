import { UnifiedCurrency } from '@pancakeswap/swap-sdk-core'
import { useSelectIdRouteParams } from 'hooks/dynamicRoute/useSelectIdRoute'
import { useCallback } from 'react'
import currencyId from 'utils/currencyId'
import { useCreateDepositAmounts } from './useCreateDepositAmounts'
import { useCurrencies } from './useCurrencies'

export const useFieldSelectCurrencies = () => {
  const { updateParams } = useSelectIdRouteParams()
  const { baseCurrency, quoteCurrency } = useCurrencies()
  const { resetAmounts, switchDepositAmounts } = useCreateDepositAmounts()

  const handleBaseCurrencySelect = useCallback(
    (currency: UnifiedCurrency) => {
      if (
        (quoteCurrency?.isNative && currency.isNative) ||
        (quoteCurrency?.isToken &&
          currency.isToken &&
          quoteCurrency.address.toLowerCase() === currency.address.toLowerCase())
      ) {
        updateParams({
          currencyIdA: currencyId(quoteCurrency),
          currencyIdB: currencyId(baseCurrency),
        })
        switchDepositAmounts()
      } else {
        updateParams({ currencyIdA: currencyId(currency) })
        resetAmounts()
      }
    },
    [quoteCurrency, updateParams, baseCurrency, switchDepositAmounts, resetAmounts],
  )

  const handleQuoteCurrencySelect = useCallback(
    (currency: UnifiedCurrency) => {
      if (
        (baseCurrency?.isNative && currency.isNative) ||
        (baseCurrency?.isToken &&
          currency.isToken &&
          baseCurrency.address.toLowerCase() === currency.address.toLowerCase())
      ) {
        updateParams({
          currencyIdA: currencyId(quoteCurrency),
          currencyIdB: currencyId(baseCurrency),
        })
        switchDepositAmounts()
      } else {
        updateParams({ currencyIdB: currencyId(currency) })
        resetAmounts()
      }
    },
    [baseCurrency, updateParams, quoteCurrency, switchDepositAmounts, resetAmounts],
  )

  return {
    baseCurrency,
    quoteCurrency,
    handleBaseCurrencySelect,
    handleQuoteCurrencySelect,
  }
}
