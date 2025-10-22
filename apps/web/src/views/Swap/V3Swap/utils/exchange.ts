import { isSolana } from '@pancakeswap/chains'
import { HOOK_CATEGORY, findHook } from '@pancakeswap/infinity-sdk'
import { OrderType } from '@pancakeswap/price-api-sdk'
import {
  Currency,
  CurrencyAmount,
  Fraction,
  ONE_HUNDRED_PERCENT,
  Percent,
  Price,
  TradeType,
  UnifiedCurrency,
  UnifiedCurrencyAmount,
  ZERO,
} from '@pancakeswap/sdk'
import { Route, SmartRouter, SmartRouterTrade } from '@pancakeswap/smart-router'
import { formatPrice, parseNumberToFraction } from '@pancakeswap/utils/formatFractions'
import { FeeAmount } from '@pancakeswap/v3-sdk'
import { displaySymbolWithChainName } from '@pancakeswap/widgets-internal'

import { BIPS_BASE, INPUT_FRACTION_AFTER_FEE } from 'config/constants/exchange'
import last from 'lodash/last'
import { Field } from 'state/swap/actions'
import { isAddressEqual } from 'utils'
import { basisPointsToPercent } from 'utils/exchange'
import { zeroAddress } from 'viem'
import { BridgeOrderFee } from 'views/Swap/Bridge/utils'
import { BridgeOrderWithCommands, InterfaceOrder, isBridgeOrder, isSolanaBridge } from 'views/Swap/utils'

export type SlippageAdjustedAmounts = {
  [field in Field]?: UnifiedCurrencyAmount<UnifiedCurrency> | null
}

// computes the minimum amount out and maximum amount in for a trade given a user specified allowed slippage in bips
export function computeSlippageAdjustedAmounts(
  order: InterfaceOrder | undefined | null,
  allowedSlippage: number,
): SlippageAdjustedAmounts {
  if (order?.type === OrderType.DUTCH_LIMIT || order?.type === OrderType.PCS_SVM) {
    return {
      [Field.INPUT]: order.trade.maximumAmountIn,
      [Field.OUTPUT]: order.trade.minimumAmountOut,
    }
  }

  const trade = order?.trade

  if (!trade) {
    return {
      [Field.INPUT]: undefined,
      [Field.OUTPUT]: undefined,
    }
  }

  const pct = basisPointsToPercent(allowedSlippage)

  const bridgeOrder = order as BridgeOrderWithCommands
  const length = bridgeOrder?.commands?.length

  if (isSolanaBridge(order)) {
    return {
      [Field.INPUT]: trade.inputAmount,
      [Field.OUTPUT]: CurrencyAmount.fromRawAmount(
        trade.outputAmount.currency,
        BigInt(order.bridgeTransactionData.minimumOutputAmount ?? '0'),
      ),
    }
  }

  if (isBridgeOrder(order) && bridgeOrder.commands && length) {
    const isBridgeOnly = length === 1
    const isBridgeToSwap = length === 2 && bridgeOrder.commands[length - 1].type === OrderType.PCS_CLASSIC

    if (isBridgeOnly) {
      return {
        [Field.INPUT]: trade.inputAmount,
        [Field.OUTPUT]: trade.outputAmount,
      }
    }

    if (!isBridgeToSwap) {
      return {
        [Field.INPUT]: trade.inputAmount,
        // last command is swap order, and is already slippaged
        [Field.OUTPUT]: last(bridgeOrder.commands)!.trade.outputAmount,
      }
    }
  }

  return {
    [Field.INPUT]: trade && SmartRouter.maximumAmountIn(trade, pct),
    // NOTE: slippaged both regular and bridge order
    [Field.OUTPUT]: trade && SmartRouter.minimumAmountOut(trade, pct),
  }
}

export type TradeEssentialForPriceBreakdown = Pick<SmartRouterTrade<TradeType>, 'inputAmount' | 'outputAmount'> & {
  routes: Pick<Route, 'percent' | 'pools' | 'path' | 'inputAmount'>[]
}

export interface TradePriceBreakdown {
  priceImpactWithoutFee?: Percent | null
  lpFeeAmount?: CurrencyAmount<Currency> | null
}

export interface SVMTradePriceBreakdown {
  priceImpactWithoutFee?: Percent | null
  lpFeeAmount?: UnifiedCurrencyAmount<UnifiedCurrency> | null
}

// computes price breakdown for the trade
export function computeTradePriceBreakdown(trade?: TradeEssentialForPriceBreakdown | null): TradePriceBreakdown {
  if (!trade) {
    return {
      priceImpactWithoutFee: undefined,
      lpFeeAmount: null,
    }
  }

  const { routes, outputAmount, inputAmount } = trade
  let feePercent = new Percent(0)
  let outputAmountWithoutPriceImpact = CurrencyAmount.fromRawAmount(trade.outputAmount.currency, 0)
  for (const route of routes) {
    const { inputAmount: routeInputAmount, pools, percent } = route
    const routeFeePercent = ONE_HUNDRED_PERCENT.subtract(
      pools.reduce<Percent>((currentFee, pool) => {
        if (SmartRouter.isV2Pool(pool)) {
          return currentFee.multiply(INPUT_FRACTION_AFTER_FEE)
        }
        if (SmartRouter.isStablePool(pool)) {
          return currentFee.multiply(ONE_HUNDRED_PERCENT.subtract(pool.fee))
        }
        if (SmartRouter.isV3Pool(pool)) {
          return currentFee.multiply(ONE_HUNDRED_PERCENT.subtract(v3FeeToPercent(pool.fee)))
        }
        if (SmartRouter.isInfinityClPool(pool) || SmartRouter.isInfinityBinPool(pool)) {
          let poolFee = pool.fee
          // override pool fee if the pool is a dynamic fee pool
          if (pool.hooks && !isAddressEqual(pool.hooks, zeroAddress)) {
            const hook = findHook(pool.hooks, trade.inputAmount.currency.chainId)
            if (hook && hook.category?.includes(HOOK_CATEGORY.DynamicFees) && hook.defaultFee) {
              poolFee = hook.defaultFee
            }
          }
          const infinityFeePercent = new Percent(calculateInfiFeePercent(poolFee, pool.protocolFee).totalFee, 1e6)
          return currentFee.multiply(ONE_HUNDRED_PERCENT.subtract(infinityFeePercent))
        }
        return currentFee
      }, ONE_HUNDRED_PERCENT),
    )
    // Not accurate since for stable swap, the lp fee is deducted on the output side
    feePercent = feePercent.add(
      routeFeePercent.multiply(Percent.toPercent(parseNumberToFraction(percent / 100) || new Fraction(0))),
    )

    try {
      const midPrice = SmartRouter.getMidPrice(route)
      outputAmountWithoutPriceImpact = outputAmountWithoutPriceImpact.add(
        CurrencyAmount.fromRawAmount(
          trade.outputAmount.currency,
          midPrice.wrapped.quote(routeInputAmount.wrapped).quotient,
        ),
      )
    } catch (error) {
      console.error('Error calculating output amount:', error)
      outputAmountWithoutPriceImpact = CurrencyAmount.fromRawAmount(trade.outputAmount.currency, 0)
      break
    }
  }

  if (outputAmountWithoutPriceImpact.quotient === ZERO) {
    return {
      priceImpactWithoutFee: undefined,
      lpFeeAmount: null,
    }
  }

  const priceImpactRaw = outputAmountWithoutPriceImpact.subtract(outputAmount).divide(outputAmountWithoutPriceImpact)
  const priceImpactPercent = new Percent(priceImpactRaw.numerator, priceImpactRaw.denominator)
  const priceImpactWithoutFee = priceImpactPercent.subtract(feePercent)
  const lpFeeAmount = inputAmount.multiply(feePercent)

  return {
    priceImpactWithoutFee,
    lpFeeAmount,
  }
}

export function formatExecutionPrice(
  executionPrice?: Price<Currency, Currency>,
  inputAmount?: CurrencyAmount<Currency>,
  outputAmount?: CurrencyAmount<Currency>,
  inverted?: boolean,
): string {
  if (!executionPrice || !inputAmount || !outputAmount) {
    return ''
  }

  const isBridge = inputAmount.currency.chainId !== outputAmount.currency.chainId

  return inverted
    ? `${formatPrice(executionPrice.invert(), 6)} ${displaySymbolWithChainName(
        inputAmount.currency,
        isBridge,
      )} / ${displaySymbolWithChainName(outputAmount.currency, isBridge)}`
    : `${formatPrice(executionPrice, 6)} ${displaySymbolWithChainName(
        outputAmount.currency,
        isBridge,
      )} / ${displaySymbolWithChainName(inputAmount.currency, isBridge)}`
}

export function v3FeeToPercent(fee: FeeAmount): Percent {
  return new Percent(fee, BIPS_BASE * 100n)
}

export function calculateInfiFeePercent(lpFee: number, protocolFee?: number) {
  const protocolFee1 = (protocolFee ?? 0) & 0xfff
  const totalFee = (protocolFee1 + ((1e6 - protocolFee1) * lpFee) / 1e6).toFixed(0)

  return {
    totalFee: Number(totalFee),
    lpFee,
    protocolFee: protocolFee1,
  }
}

// Helper function to find the highest price impact from multiple breakdowns
export function findHighestPriceImpact(breakdowns: BridgeOrderFee[]): Percent | null | undefined {
  return breakdowns.reduce((highest, breakdown) => {
    // Skip if current breakdown has no price impact
    if (!breakdown.priceImpactWithoutFee) return highest

    // If no highest value yet, use current one
    if (!highest) return breakdown.priceImpactWithoutFee

    // Compare and keep the higher value
    if (highest.lessThan(breakdown.priceImpactWithoutFee)) {
      return breakdown.priceImpactWithoutFee
    }

    return highest
  }, null as Percent | null)
}
