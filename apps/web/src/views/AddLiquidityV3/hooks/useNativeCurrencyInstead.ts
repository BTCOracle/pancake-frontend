import { Currency } from '@pancakeswap/sdk'

import { useCallback, useMemo } from 'react'
import { useRouter } from 'next/router'
import useNativeCurrency from 'hooks/useNativeCurrency'
import currencyId from 'utils/currencyId'

interface UseNativeCurrencyInsteadProps {
  baseCurrency: Currency | null | undefined
  quoteCurrency: Currency | null | undefined
  feeAmount: number | undefined
}

/**
 * For V3 & V2 Add Liquidity pages, we need to handle the case where the user wants to use the native currency instead of the wrapped currency.
 * This is because the universal farms overlay shows only Wrapped Native pairs, but user should be able to deposit in native currency.
 */
export const useNativeCurrencyInstead = ({ baseCurrency, quoteCurrency, feeAmount }: UseNativeCurrencyInsteadProps) => {
  const router = useRouter()
  const native = useNativeCurrency()

  const useNativeInstead = useMemo(() => {
    if (!router.isReady) return false

    return (
      router.query.currency?.includes(native.symbol) ||
      router.query.currency?.includes(native.symbol.toLowerCase()) ||
      false
    )
  }, [router.query.currency, native.symbol, router.isReady])

  const canUseNativeCurrency = useMemo(() => {
    return (
      baseCurrency?.wrapped.address === native.wrapped.address ||
      quoteCurrency?.wrapped.address === native.wrapped.address
    )
  }, [baseCurrency, native, quoteCurrency])

  const handleUseNative = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const checked = event.target.checked

      if (!baseCurrency || !quoteCurrency) return

      if (checked) {
        // Turn Wrapped Currency to Native
        const replaceCurrency0 = baseCurrency?.wrapped.address === native.wrapped.address

        const newCurrencyQuery = replaceCurrency0
          ? [native.symbol, currencyId(quoteCurrency)]
          : [currencyId(baseCurrency), native.symbol]

        if (feeAmount) {
          newCurrencyQuery.push(feeAmount.toString())
        }

        router.replace({
          query: {
            ...router.query,
            // @ts-ignore
            currency: newCurrencyQuery,
          },
        })
      } else {
        const newCurrencyQuery = [baseCurrency?.wrapped.address ?? '', quoteCurrency?.wrapped.address ?? '']

        if (feeAmount) {
          // @ts-ignore
          newCurrencyQuery.push(feeAmount.toString())
        }

        // Turn Native to Wrapped Currency
        router.replace({
          query: {
            ...router.query,
            currency: newCurrencyQuery,
          },
        })
      }
    },
    [baseCurrency, currencyId, feeAmount, native, quoteCurrency, router],
  )

  return {
    canUseNativeCurrency,
    handleUseNative,
    useNativeInstead,
  }
}
