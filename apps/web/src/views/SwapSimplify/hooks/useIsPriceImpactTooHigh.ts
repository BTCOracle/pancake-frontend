import { useActiveChainId } from 'hooks/useActiveChainId'
import { useMemo, useRef } from 'react'
import { warningSeverity } from 'utils/exchange'
import { InterfaceOrder } from 'views/Swap/utils'

import { findHighestPriceImpact } from '../../Swap/V3Swap/utils/exchange'
import { usePriceBreakdown } from './usePriceBreakdown'

export const useIsPriceImpactTooHigh = (bestOrder: InterfaceOrder | undefined, isLoading?: boolean) => {
  const { chainId } = useActiveChainId()
  const chainIdRef = useRef(chainId)

  const priceBreakdown = usePriceBreakdown(bestOrder)

  return useMemo(() => {
    let priceImpactWithoutFee

    if (Array.isArray(priceBreakdown)) {
      priceImpactWithoutFee = findHighestPriceImpact(priceBreakdown)
    } else {
      // eslint-disable-next-line
      priceImpactWithoutFee = priceBreakdown.priceImpactWithoutFee
    }

    const warningLevel = warningSeverity(priceImpactWithoutFee)
    if (chainIdRef?.current === chainId) {
      if (!isLoading) return warningLevel >= 3
      return false
    }
    chainIdRef.current = chainId
    return false
  }, [priceBreakdown, chainId, isLoading])
}
