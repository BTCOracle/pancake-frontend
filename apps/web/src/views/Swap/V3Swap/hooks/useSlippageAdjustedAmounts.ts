import { useAutoSlippageWithFallback } from 'hooks/useAutoSlippageWithFallback'
import { useMemo } from 'react'
import { InterfaceOrder } from 'views/Swap/utils'
import { computeSlippageAdjustedAmounts } from '../utils/exchange'

export function useSlippageAdjustedAmounts(order: InterfaceOrder | undefined | null) {
  const { slippageTolerance } = useAutoSlippageWithFallback()
  return useMemo(() => computeSlippageAdjustedAmounts(order, slippageTolerance), [slippageTolerance, order])
}
