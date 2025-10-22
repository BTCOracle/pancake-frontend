import { OrderType } from '@pancakeswap/price-api-sdk'
import { InfinityRouter, SmartRouter } from '@pancakeswap/smart-router'
import { TradeType } from '@pancakeswap/swap-sdk-core'
import { withTimeout } from '@pancakeswap/utils/withTimeout'
import { currencyUSDPriceAtom } from 'hooks/useCurrencyUsdPrice'
import { nativeCurrencyAtom } from 'hooks/useNativeCurrency'
import { globalWorkerAtom } from 'hooks/useWorker'
import { atomFamily } from 'jotai/utils'
import { QUOTE_TIMEOUT } from 'quoter/consts'
import { quoteTraceAtom } from 'quoter/perf/quoteTracker'
import { QuoteQuery } from 'quoter/quoter.types'
import { createQuoteProvider } from 'quoter/utils/createQuoteProvider'
import { createPoolQuery } from 'quoter/utils/createQuoteQuery'
import { filterPools } from 'quoter/utils/filterPoolsV3'
import { gasPriceWeiAtom } from 'quoter/utils/gasPriceAtom'
import { getAllowedPoolTypes } from 'quoter/utils/getAllowedPoolTypes'
import { isEqualQuoteQuery } from 'quoter/utils/PoolHashHelper'
import { fetchCandidatePoolsLite } from 'quoter/utils/poolQueries'
import { InterfaceOrder } from 'views/Swap/utils'
import { accountActiveChainAtom } from 'wallet/atoms/accountStateAtoms'
import { atomWithLoadable } from './atomWithLoadable'

export const bestAMMTradeFromQuoterWorkerAtom = atomFamily((option: QuoteQuery) => {
  const { amount, currency, tradeType, maxSplits, gasLimit } = option
  return atomWithLoadable(async (get) => {
    const { account } = get(accountActiveChainAtom)
    if (!amount || !amount.currency || !currency) {
      return undefined
    }
    const quoteProvider = createQuoteProvider({
      gasLimit,
    })
    const worker = await get(globalWorkerAtom)

    if (!worker) {
      throw new Error('Quote worker not initialized')
    }
    const controller = new AbortController()
    const perf = get(quoteTraceAtom(option))
    perf.tracker.track('start')
    const { chainId } = currency
    const query = withTimeout(
      async () => {
        const { poolQuery, poolOptions } = createPoolQuery(option, controller)
        const candidatePools = await fetchCandidatePoolsLite(poolQuery, poolOptions)
        perf.tracker.track('pool_success')

        const filtered = filterPools(candidatePools)

        const quoteCurrencyUsdPrice = await get(currencyUSDPriceAtom(currency))
        const nativeCurrency = get(nativeCurrencyAtom(currency.chainId))
        const nativeCurrencyUsdPrice = await get(currencyUSDPriceAtom(nativeCurrency))

        const gasPriceWei = await get(gasPriceWeiAtom(currency?.chainId))
        const quoterConfig = (quoteProvider as ReturnType<typeof SmartRouter.createQuoteProvider>)?.getConfig?.()
        const result = await worker.getBestTrade({
          chainId: currency.chainId,
          currency: SmartRouter.Transformer.serializeCurrency(currency),
          tradeType: tradeType || TradeType.EXACT_INPUT,
          amount: {
            currency: SmartRouter.Transformer.serializeCurrency(amount.currency),
            value: amount.quotient.toString(),
          },
          gasPriceWei: typeof gasPriceWei !== 'function' ? gasPriceWei?.toString() : undefined,
          maxHops: 3,
          maxSplits,
          poolTypes: getAllowedPoolTypes(option),
          candidatePools: filtered.map(SmartRouter.Transformer.serializePool),
          onChainQuoterGasLimit: quoterConfig?.gasLimit?.toString(),
          quoteCurrencyUsdPrice,
          nativeCurrencyUsdPrice,
          signal: controller.signal,
          account,
        })
        const parsed = SmartRouter.Transformer.parseTrade(currency.chainId, result as any)
        parsed.quoteQueryHash = option.hash
        const order = {
          type: OrderType.PCS_CLASSIC,
          trade: parsed as any as InfinityRouter.InfinityTradeWithoutGraph<TradeType>,
        } as InterfaceOrder
        perf.tracker.success(order)
        return order
      },
      {
        ms: QUOTE_TIMEOUT[chainId],
        abort: () => {
          controller?.abort()
        },
      },
    )

    try {
      return await query()
    } catch (ex) {
      perf.tracker.fail(ex)
      controller?.abort()
      throw ex
    } finally {
      perf.tracker.report()
    }
  })
}, isEqualQuoteQuery)
