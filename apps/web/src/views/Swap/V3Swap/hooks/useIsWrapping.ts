import { useCurrency } from 'hooks/Tokens'
import { useIsWrapping as useIsWrappingHook } from 'hooks/useWrapCallback'
import { Field } from 'state/swap/actions'
import { useSwapState } from 'state/swap/hooks'

export function useIsWrapping() {
  const {
    [Field.INPUT]: { currencyId: inputCurrencyId, chainId: inputChainId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId, chainId: outputChainId },
  } = useSwapState()

  const { typedValue } = useSwapState()
  const inputCurrency = useCurrency(inputCurrencyId, inputChainId)
  const outputCurrency = useCurrency(outputCurrencyId, outputChainId)
  return useIsWrappingHook(inputCurrency, outputCurrency, typedValue)
}
