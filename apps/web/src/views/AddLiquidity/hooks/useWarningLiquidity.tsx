import { Currency } from '@pancakeswap/sdk'
import { useModal } from '@pancakeswap/uikit'
import { useCallback, useEffect, useState } from 'react'
import { useCurrency } from 'hooks/Tokens'
import { useActiveChainId } from 'hooks/useActiveChainId'
import SwapWarningModal from 'views/Swap/components/SwapWarningModal'
import shouldShowSwapWarning from 'utils/shouldShowSwapWarning'

export default function useWarningLiquidity(currencyIdA?: string, currencyIdB?: string) {
  const { chainId } = useActiveChainId()
  const currencyA = useCurrency(currencyIdA)
  const currencyB = useCurrency(currencyIdB)
  const [warningCurrency, setWarningCurrency] = useState<Currency | null>(null)

  const [onPresentWarningModal] = useModal(<SwapWarningModal swapCurrency={warningCurrency as any} />, false)

  useEffect(() => {
    if (warningCurrency) {
      onPresentWarningModal()
    }
  }, [warningCurrency, onPresentWarningModal])

  useEffect(() => {
    if (currencyA && shouldShowSwapWarning(chainId, currencyA)) {
      setWarningCurrency(currencyA)
    } else if (currencyB && shouldShowSwapWarning(chainId, currencyB)) {
      setWarningCurrency(currencyB)
    }
  }, [chainId, currencyA, currencyB])

  const warningHandler = useCallback(
    (currency?: Currency) => {
      if (shouldShowSwapWarning(chainId, currency)) {
        setWarningCurrency(currency || null)
      }
    },
    [chainId],
  )

  return warningHandler
}
