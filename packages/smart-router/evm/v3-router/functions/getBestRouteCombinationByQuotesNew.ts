/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ChainId } from '@pancakeswap/chains'
import { Currency, CurrencyAmount, Fraction, TradeType } from '@pancakeswap/sdk'

import { RemoteLogger } from '@pancakeswap/utils/RemoteLogger'
import { keccak256 } from 'viem'
import { usdGasTokensByChain } from '../../constants'
import { BestRoutes, L1ToL2GasCosts, RouteWithQuote } from '../types'
import { getPoolAddress } from '../utils'

interface Config {
  minSplits?: number
  maxSplits?: number
}

export function getBestRouteCombinationByQuotesNew(
  amount: CurrencyAmount<Currency>,
  quoteCurrency: Currency,
  routesWithQuote: RouteWithQuote[],
  tradeType: TradeType,
  config: Config,
  quoteId?: string,
): BestRoutes | null {
  const logger = RemoteLogger.getLogger(quoteId)
  const maxSplits = config.maxSplits || 4
  // Fill user's order by better price router first
  const weightedRoutes = routesWithQuote.map((route) => {
    const price =
      tradeType === TradeType.EXACT_INPUT
        ? new Fraction(route.quoteAdjustedForGas.quotient, route.amount.quotient)
        : new Fraction(route.amount.quotient, route.quoteAdjustedForGas.quotient)

    const val = Number.parseFloat(price.toSignificant(6))
    return {
      data: route,
      weight: route.percent,
      value: val,
      key: hashRouteWithQuote(route),
    } as FillTarget<RouteWithQuote>
  })
  const filled = fillOrders(weightedRoutes, 100, maxSplits)
  const bestRoutes = filled.selectedItems.map((x) => x.data)
  const sumPercents = bestRoutes.reduce((sum, route) => sum + route.percent, 0)
  if (sumPercents !== 100) {
    throw new Error(`Sum of percents is not 100, got ${sumPercents}`)
  }
  // eslint-disable-next-line
  const chainId: ChainId = amount.currency.chainId
  // const now = Date.now()

  logger.debug('--- END percentToQuotes ---')

  const swapRoute = computeSwapGasAdjustedQuotes(bestRoutes, chainId, tradeType)

  // Due to potential loss of precision when taking percentages of the input it is possible that the sum of the amounts of each
  // route of our optimal quote may not add up exactly to exactIn or exactOut.
  //
  // We check this here, and if there is a mismatch
  // add the missing amount to a random route. The missing amount size should be neglible so the quote should still be highly accurate.
  const { routes: routeAmounts } = swapRoute
  const totalAmount = routeAmounts.reduce(
    (total, routeAmount) => total.add(routeAmount.amount),
    CurrencyAmount.fromRawAmount(routeAmounts[0]!.amount.currency, 0),
  )

  const missingAmount = amount.subtract(totalAmount)
  if (missingAmount.greaterThan(0)) {
    logger.debug(
      `Optimal route's amounts did not equal exactIn/exactOut total. Adding missing amount to last route in array. missingAmount=${missingAmount.quotient.toString()}`,
    )

    routeAmounts[routeAmounts.length - 1]!.amount = routeAmounts[routeAmounts.length - 1]!.amount.add(missingAmount)
  }

  const { routes, quote: quoteAmount, estimatedGasUsed, estimatedGasUsedUSD } = swapRoute
  const quote = CurrencyAmount.fromRawAmount(quoteCurrency, quoteAmount.quotient)
  const isExactIn = tradeType === TradeType.EXACT_INPUT
  return {
    routes: routes.map(({ type, amount: routeAmount, quote: routeQuoteAmount, pools, path, percent }) => {
      const routeQuote = CurrencyAmount.fromRawAmount(quoteCurrency, routeQuoteAmount.quotient)
      return {
        percent,
        type,
        pools,
        path,
        inputAmount: isExactIn ? routeAmount : routeQuote,
        outputAmount: isExactIn ? routeQuote : routeAmount,
      }
    }),
    gasEstimate: estimatedGasUsed,
    gasEstimateInUSD: estimatedGasUsedUSD,
    inputAmount: isExactIn ? amount : quote,
    outputAmount: isExactIn ? quote : amount,
  }
}

function computeSwapGasAdjustedQuotes(
  bestSwap: RouteWithQuote[],
  chainId: ChainId,
  tradeType: TradeType,
  gasCostsL1ToL2?: L1ToL2GasCosts,
) {
  const quoteGasAdjusted = sumFn(bestSwap.map((route) => route.quoteAdjustedForGas))

  const estimatedGasUsed = bestSwap.reduce((sum, route) => sum + route.gasEstimate, 0n)

  const usdToken = usdGasTokensByChain[chainId]?.[0]
  if (!usdToken) {
    throw new Error(`No USD token for computing gas costs on chain ${chainId}`)
  }
  const usdTokenDecimals = usdToken.decimals

  const gasCostsL1 = gasCostsL1ToL2 ?? {
    gasUsedL1: 0n,
    gasCostL1USD: CurrencyAmount.fromRawAmount(usdToken, 0),
    gasCostL1QuoteToken: CurrencyAmount.fromRawAmount(bestSwap[0].quote.currency, 0),
  }

  const estimatedGasUsedUSDs = bestSwap.map((route) => {
    const decimalsDiff = usdTokenDecimals - route.gasCostInUSD.currency.decimals
    if (decimalsDiff >= 0) {
      return CurrencyAmount.fromRawAmount(usdToken, route.gasCostInUSD.quotient * 10n ** BigInt(decimalsDiff))
    }
    return CurrencyAmount.fromRawAmount(usdToken, route.gasCostInUSD.quotient / 10n ** BigInt(-decimalsDiff))
  })

  let estimatedGasUsedUSD = sumFn(estimatedGasUsedUSDs)

  if (!estimatedGasUsedUSD.currency.equals(gasCostsL1.gasCostL1USD.currency)) {
    const decimalsDiff = usdTokenDecimals - gasCostsL1.gasCostL1USD.currency.decimals
    estimatedGasUsedUSD = estimatedGasUsedUSD.add(
      CurrencyAmount.fromRawAmount(usdToken, gasCostsL1.gasCostL1USD.quotient * 10n ** BigInt(decimalsDiff)),
    )
  } else {
    estimatedGasUsedUSD = estimatedGasUsedUSD.add(gasCostsL1.gasCostL1USD)
  }

  const estimatedGasUsedQuoteToken = sumFn(bestSwap.map((route) => route.gasCostInToken)).add(
    gasCostsL1.gasCostL1QuoteToken,
  )

  const quote = sumFn(bestSwap.map((route) => route.quote))

  const adjustedQuoteGas =
    tradeType === TradeType.EXACT_INPUT
      ? quoteGasAdjusted.subtract(gasCostsL1.gasCostL1QuoteToken)
      : quoteGasAdjusted.add(gasCostsL1.gasCostL1QuoteToken)

  const sortedRoutes = [...bestSwap].sort((a, b) => {
    if (b.amount.greaterThan(a.amount)) return 1
    if (a.amount.greaterThan(b.amount)) return -1
    return 0
  })

  return {
    quote,
    quoteGasAdjusted: adjustedQuoteGas,
    estimatedGasUsed,
    estimatedGasUsedUSD,
    estimatedGasUsedQuoteToken,
    routes: sortedRoutes,
  }
}

function sumFn(currencyAmounts: CurrencyAmount<Currency>[]): CurrencyAmount<Currency> {
  let sum = currencyAmounts[0]!
  for (let i = 1; i < currencyAmounts.length; i++) {
    sum = sum.add(currencyAmounts[i]!)
  }
  return sum
}

function hashRouteWithQuote(route: RouteWithQuote): string {
  const { pools } = route
  const poolStr = pools.map((pool) => getPoolAddress(pool)).join('-')
  return keccak256(`0x${poolStr}`)
}
interface FillTarget<T> {
  weight: number
  value: number
  key: string
  data: T
}

function fillOrders<T>(
  items: FillTarget<T>[],
  maxWeight: number,
  maxItems: number,
): { totalValue: number; selectedItems: FillTarget<T>[] } {
  const groups = new Map<string, FillTarget<T>[]>()
  for (const item of items) {
    if (!groups.has(item.key)) {
      groups.set(item.key, [])
    }
    groups.get(item.key)!.push(item)
  }

  const uniqueKeys = Array.from(groups.keys())
  const m = uniqueKeys.length

  // i: the number of unique keys
  // w: current total weight
  // k: exact number of items
  const dp: number[][][] = Array.from({ length: m + 1 }, () =>
    Array.from({ length: maxWeight + 1 }, () => Array(maxItems + 1).fill(0)),
  )

  for (let i = 1; i <= m; i++) {
    const groupItems = groups.get(uniqueKeys[i - 1])!
    for (let w = 0; w <= maxWeight; w++) {
      for (let k = 0; k <= maxItems; k++) {
        dp[i][w][k] = dp[i - 1][w][k]

        if (k > 0) {
          for (const item of groupItems) {
            if (w >= item.weight) {
              dp[i][w][k] = Math.max(dp[i][w][k], dp[i - 1][w - item.weight][k - 1] + item.value)
            }
          }
        }
      }
    }
  }

  let totalValue = 0
  let optimalW = 0
  let optimalK = 0

  for (let k = 1; k <= maxItems; k++) {
    for (let w = 0; w <= maxWeight; w++) {
      if (dp[m][w][k] > totalValue) {
        totalValue = dp[m][w][k]
        optimalW = w
        optimalK = k
      }
    }
  }

  const selectedItems: FillTarget<T>[] = []
  let w = optimalW
  let k = optimalK

  for (let i = m; i > 0 && k > 0; i--) {
    const groupItems = groups.get(uniqueKeys[i - 1])!
    let chosenItem: FillTarget<T> | null = null

    for (const item of groupItems) {
      if (w >= item.weight && dp[i][w][k] === dp[i - 1][w - item.weight][k - 1] + item.value) {
        chosenItem = item
        break
      }
    }

    if (chosenItem) {
      selectedItems.push(chosenItem)
      w -= chosenItem.weight
      k -= 1
    }
  }

  return {
    totalValue,
    selectedItems: selectedItems.reverse(),
  }
}
