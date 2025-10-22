import { UnifiedCurrency } from '@pancakeswap/swap-sdk-core'
import { useUnifiedCurrency } from 'hooks/Tokens'
import { Field } from 'state/swap/actions'
import { useSwapState } from 'state/swap/hooks'

interface SwapStateCurrency {
  readonly currencyId: string | undefined
  readonly chainId: number | undefined
}

export const useSwapCurrencyIds = (): [SwapStateCurrency | undefined, SwapStateCurrency | undefined] => {
  const { [Field.INPUT]: inputCurrency, [Field.OUTPUT]: outputCurrency } = useSwapState()

  return [inputCurrency, outputCurrency]
}

export const useSwapCurrency = (): [UnifiedCurrency | undefined | null, UnifiedCurrency | undefined | null] => {
  const [stateInputCurrency, stateOutputCurrency] = useSwapCurrencyIds()

  const inputCurrency = useUnifiedCurrency(stateInputCurrency?.currencyId, stateInputCurrency?.chainId)
  const outputCurrency = useUnifiedCurrency(stateOutputCurrency?.currencyId, stateOutputCurrency?.chainId)

  return [inputCurrency, outputCurrency]
}
