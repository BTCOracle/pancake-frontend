import { Loadable } from '@pancakeswap/utils/Loadable'
import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import { quoteTraceAtom } from 'quoter/perf/quoteTracker'
import { BridgeTradeError, type QuoteQuery } from 'quoter/quoter.types'
import { isEqualQuoteQuery } from 'quoter/utils/PoolHashHelper'
import { type InterfaceOrder } from 'views/Swap/utils'
import { bestSameChainAtom } from './bestSameChainAtom'
import { placeholderAtom } from './placeholderAtom'
import { handlePlaceholderForPendingResult } from '../utils/placeholderHandler'

import { CrossChainPatternClassifier } from '../utils/crosschain-utils/CrossChainPatternClassifier'
import { ContextBuilder } from '../utils/crosschain-utils/utils/ContextBuilder'

export const bestCrossChainQuoteWithoutPlaceHolderAtom = atomFamily((option: QuoteQuery) => {
  return atom((get) => {
    if (option.amount && option.currency) {
      // Catch all errors here
      try {
        const isCrossChain = option.baseCurrency?.chainId !== option.currency?.chainId

        // If unexpected same chain quote, throw an error
        if (!isCrossChain) {
          throw new BridgeTradeError('Same chain is not supported')
        }

        const routesLoadable = ContextBuilder.getAvailableRoutes(option, get)

        if (routesLoadable.isPending()) {
          return Loadable.Pending<InterfaceOrder>()
        }

        if (routesLoadable.isFail()) {
          return Loadable.Fail<InterfaceOrder>(routesLoadable.error)
        }

        const routes = routesLoadable.unwrapOr(undefined) || []

        // Since ContextBuilder already validate the routes, we can safely build the context
        const context = ContextBuilder.build(option, routes, get)

        const strategy = CrossChainPatternClassifier.createStrategyForContext(context)

        return strategy.executeQuote()
      } catch (error: unknown) {
        return Loadable.Fail<InterfaceOrder>(error as BridgeTradeError)
      }
    }

    return Loadable.Nothing<InterfaceOrder>()
  })
}, isEqualQuoteQuery)

export const bestCrossChainQuoteAtom = atomFamily((_option: QuoteQuery) => {
  return atom(async (get) => {
    const isCrossChain =
      _option.baseCurrency && _option.currency && _option.baseCurrency?.chainId !== _option.currency?.chainId

    // handle cross chain quote
    if (isCrossChain) {
      const perf = get(quoteTraceAtom({ ..._option, routeKey: 'cross-chain' }))
      perf.tracker.track('start')
      try {
        const result = await get(bestCrossChainQuoteWithoutPlaceHolderAtom(_option))

        if (result.isPending()) {
          const placeHolder = get(placeholderAtom(_option.placeholderHash || ''))
          if (placeHolder) {
            return handlePlaceholderForPendingResult<InterfaceOrder>({
              result,
              placeholder: placeHolder,
              placeholderHash: _option.placeholderHash,
            })
          }
        }

        if (result.isFail()) {
          perf.tracker.fail(result.error)
        } else if (result.isJust()) {
          perf.tracker.success(result.value)
        }

        return result.setExtra('placeholderHash', _option.placeholderHash!)
      } finally {
        perf.tracker.report()
      }
    } else {
      return get(bestSameChainAtom(_option))
    }
  })
}, isEqualQuoteQuery)
