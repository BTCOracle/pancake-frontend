import { OrderType } from '@pancakeswap/price-api-sdk'
import { Currency, CurrencyAmount, SPLToken, UnifiedCurrency, UnifiedCurrencyAmount } from '@pancakeswap/swap-sdk-core'
import { useUserSlippage } from '@pancakeswap/utils/user'
import { atom, useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { useAllTypeBestTrade } from 'quoter/hook/useAllTypeBestTrade'
import { Suspense, useCallback, useEffect, useMemo, useRef } from 'react'
import { isBridgeOrder } from 'views/Swap/utils'
import useClassicAutoSlippageTolerance, {
  MIN_DEFAULT_SLIPPAGE_NUMERATOR,
  PCSX_AUTO_SLIPPAGE_TOLERANCE,
  useInputBasedAutoSlippage,
} from './useAutoSlippage'

// Atom to store the user's preference for auto slippage
const autoSlippageEnabledAtom = atomWithStorage('pcs:auto-slippage-enabled-2', true)
const autoSlippageValueAtom = atom(MIN_DEFAULT_SLIPPAGE_NUMERATOR)

export const useAutoSlippageAtom = () => {
  return useAtom(autoSlippageValueAtom)
}

export const useAutoSlippageEnabled = () => {
  return useAtom(autoSlippageEnabledAtom)
}

/**
 * Returns the slippage tolerance based on user settings or auto-calculated value
 * If auto slippage is enabled, it will use the auto-calculated value
 * Otherwise, it will use the user's manually set slippage
 */
export function useAutoSlippageWithFallback(): {
  slippageTolerance: number
  isAuto: boolean
} {
  const [isAutoSlippageEnabled] = useAutoSlippageEnabled()
  const [userSlippageTolerance] = useUserSlippage()
  const [autoSlippageTolerance] = useAutoSlippageAtom()

  return useMemo(() => {
    if (isAutoSlippageEnabled) {
      return {
        slippageTolerance: autoSlippageTolerance,
        isAuto: true,
      }
    }

    return {
      slippageTolerance: userSlippageTolerance,
      isAuto: false,
    }
  }, [isAutoSlippageEnabled, autoSlippageTolerance, userSlippageTolerance])
}

export const useInputBasedAutoSlippageWithFallback = (inputAmount?: UnifiedCurrencyAmount<UnifiedCurrency>) => {
  const [isAutoSlippageEnabled] = useAutoSlippageEnabled()
  const [userSlippageTolerance] = useUserSlippage()

  const isSPLToken = inputAmount?.currency && SPLToken.isSPLToken(inputAmount.currency)

  const { inputBasedSlippage } = useInputBasedAutoSlippage(
    isSPLToken ? undefined : (inputAmount as CurrencyAmount<Currency>),
  )

  return useMemo(() => {
    if (isAutoSlippageEnabled && inputAmount && inputBasedSlippage) {
      return {
        slippageTolerance: Number(inputBasedSlippage.numerator),
        isAuto: true,
      }
    }

    return {
      slippageTolerance: userSlippageTolerance,
      isAuto: false,
    }
  }, [isAutoSlippageEnabled, inputAmount, inputBasedSlippage, userSlippageTolerance])
}

export const AutoSlippageProvider = ({ children }: { children?: React.ReactNode }) => {
  return (
    <>
      {children}
      <Suspense fallback={null}>
        <Sync />
      </Suspense>
    </>
  )
}
export const Sync = () => {
  const result = useAllTypeBestTrade()
  const tradeRef = useRef(result?.bestOrder?.trade)
  const isSameOrder = useMemo(() => {
    // TODO: Temporary add this to avoid error from 'Cannot read properties of undefined (reading 'isToken')'
    if (isBridgeOrder(result?.bestOrder)) {
      return false
    }

    if (!tradeRef.current || !result?.bestOrder?.trade) return false
    return (
      tradeRef.current?.inputAmount?.currency?.equals(result?.bestOrder?.trade?.inputAmount?.currency) &&
      tradeRef.current?.outputAmount?.currency?.equals(result?.bestOrder?.trade?.outputAmount?.currency) &&
      tradeRef.current?.tradeType === result?.bestOrder?.trade?.tradeType &&
      tradeRef.current?.inputAmount?.equalTo(result?.bestOrder?.trade?.inputAmount) &&
      tradeRef.current?.outputAmount?.equalTo(result?.bestOrder?.trade?.outputAmount)
    )
  }, [result?.bestOrder])

  const classicAutoSlippage = useClassicAutoSlippageTolerance(
    result?.bestOrder?.type === OrderType.PCS_SVM ? undefined : result?.bestOrder?.trade,
  )
  const autoSlippage =
    result?.bestOrder?.type === OrderType.DUTCH_LIMIT ? PCSX_AUTO_SLIPPAGE_TOLERANCE : classicAutoSlippage
  const [, setAutoSlippageValue] = useAutoSlippageAtom()
  const updateAutoSlippage = useCallback(() => {
    if (autoSlippage) {
      setAutoSlippageValue(Number(autoSlippage.numerator))
    }
  }, [autoSlippage, setAutoSlippageValue])
  useEffect(() => {
    if (!isSameOrder) {
      tradeRef.current = result?.bestOrder?.trade
      updateAutoSlippage()
    }
  }, [isSameOrder, updateAutoSlippage, result?.bestOrder?.trade])
  return null
}
