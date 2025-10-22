import { getBestSolanaTrade } from '@pancakeswap/solana-router-sdk'
import { SPLToken, TradeType, UnifiedCurrencyAmount } from '@pancakeswap/swap-sdk-core'
import { Loadable } from '@pancakeswap/utils/Loadable'
import { withTimeout } from '@pancakeswap/utils/withTimeout'
import { atomFamily } from 'jotai/utils'
import { solanaUserSlippageAtomWithLocalStorage, solanaPriorityFeeAtomWithLocalStorage } from '@pancakeswap/utils/user'
import { QUOTE_TIMEOUT } from 'quoter/consts'
import { parseSVMTradeIntoSVMOrder } from 'quoter/utils/svm-utils/parseSVMTradeIntoSVMOrder'
import { type InterfaceOrder } from 'views/Swap/utils'
import { NonEVMChainId } from '@pancakeswap/chains'
import { isEqualQuoteQuery } from 'quoter/utils/PoolHashHelper'
import { NoValidRouteError, type SVMQuoteQuery } from '../quoter.types'
import { atomWithLoadable } from './atomWithLoadable'

export const bestSVMOrderAtom = atomFamily((_option: SVMQuoteQuery) => {
  return atomWithLoadable<InterfaceOrder>(async (get) => {
    const { baseCurrency, currency, amount, tradeType, address } = _option
    const userSlippageTolerance = get(solanaUserSlippageAtomWithLocalStorage)
    const priorityFeeLamports = get(solanaPriorityFeeAtomWithLocalStorage)

    // Early validation
    if (!baseCurrency || !currency || !amount || tradeType === undefined) {
      return Loadable.Nothing<InterfaceOrder>()
    }

    const controller = new AbortController()
    // const perf = get(quoteTraceAtom(_option))
    // perf.tracker.track('start')

    try {
      const query = withTimeout(
        async () => {
          const [inputCurrency, outputCurrency] =
            tradeType === TradeType.EXACT_INPUT ? [baseCurrency, currency] : [currency, baseCurrency]
          // Parse response to SVM order format
          const solTradeRoute = await getBestSolanaTrade({
            // TODO: need to remove as SPLToken
            inputCurrency: inputCurrency as SPLToken,
            outputCurrency: outputCurrency as SPLToken,
            amount: amount as UnifiedCurrencyAmount<SPLToken>,
            tradeType: tradeType as TradeType,
            slippageBps: userSlippageTolerance,
            account: address,
            priorityFeeLamports,
          })

          //   perf.tracker.success(svmOrder)
          return solTradeRoute
        },
        {
          ms: QUOTE_TIMEOUT[NonEVMChainId.SOLANA],
          abort: () => {
            controller.abort()
          },
        },
      )

      let bestOrder: InterfaceOrder | undefined

      const trade = await query()

      // if result.type is SVMOrder, can safely cast to InterfaceOrder
      if (trade) {
        bestOrder = parseSVMTradeIntoSVMOrder(trade, _option)
      }

      if (!bestOrder) {
        return Loadable.Nothing<InterfaceOrder>()
      }

      return Loadable.Just<InterfaceOrder>(bestOrder)
    } catch (error) {
      return Loadable.Fail<InterfaceOrder>(new NoValidRouteError('No valid swap quotes'))
    } finally {
      //   perf.tracker.report()
    }
  })
}, isEqualQuoteQuery)
