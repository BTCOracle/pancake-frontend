import { atomFamily } from 'jotai/utils'
import { type QuoteQuery } from 'quoter/quoter.types'
import { getBridgeAvailableRoutes } from 'views/Swap/Bridge/api'
import { isSolana } from '@pancakeswap/chains'
import { atomWithLoadable } from './atomWithLoadable'

// Atoms for bridge quote
export const availableBridgeRoutesAtom = atomFamily(
  (option: QuoteQuery) => {
    return atomWithLoadable(async () => {
      // Early return if currencies or chainIds are not available
      if (!option.baseCurrency || !option.currency) {
        return []
      }

      // Check if this is a cross-chain request
      const isCrossChain = option.baseCurrency.chainId !== option.currency.chainId
      if (!isCrossChain) {
        return []
      }

      if (isSolana(option.baseCurrency.chainId) || isSolana(option.currency.chainId)) {
        return []
      }

      try {
        // Fetch available routes from the bridge API
        const routes = await getBridgeAvailableRoutes({
          originChainId: option.baseCurrency.chainId,
          destinationChainId: option.currency.chainId,
        })

        return routes || []
      } catch (error) {
        console.error('Failed to fetch bridge routes:', error)
        // TODO: return Loadable.Fail<Route[]>(error)
        return []
      }
    })
  },
  (a, b) => a?.baseCurrency?.chainId === b?.baseCurrency?.chainId && a?.currency?.chainId === b?.currency?.chainId,
)
