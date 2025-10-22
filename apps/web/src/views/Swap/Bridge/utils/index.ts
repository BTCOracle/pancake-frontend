import { isSolana } from '@pancakeswap/chains'
import { OrderType } from '@pancakeswap/price-api-sdk'
import { Percent } from '@pancakeswap/swap-sdk-core'
import { BridgeOrderWithCommands, isBridgeOrder, isXOrder } from 'views/Swap/utils'
import {
  computeTradePriceBreakdown,
  SVMTradePriceBreakdown,
  TradePriceBreakdown,
} from 'views/Swap/V3Swap/utils/exchange'
import { detectHasDynamicHook } from 'views/SwapSimplify/hooks/useHasDynamicHook'

export interface BridgeOrderFee extends TradePriceBreakdown {
  type: OrderType
  hasDynamicFee?: boolean
}

export function getBridgeOrderPriceImpact(
  priceBreakdown?: BridgeOrderFee[] | TradePriceBreakdown | SVMTradePriceBreakdown,
): Percent | null | undefined {
  return Array.isArray(priceBreakdown)
    ? // find the highest priceImpactWithoutFee
      priceBreakdown
        .filter((p) => !p || p.type !== OrderType.PCS_BRIDGE)
        .reduce((highest, current) => {
          if (
            !highest ||
            (highest && current.priceImpactWithoutFee && current.priceImpactWithoutFee.greaterThan(highest))
          ) {
            return current.priceImpactWithoutFee
          }
          return highest
        }, priceBreakdown[0]?.priceImpactWithoutFee)
    : priceBreakdown?.priceImpactWithoutFee
}

export function computeBridgeOrderFee(order: BridgeOrderWithCommands): BridgeOrderFee | BridgeOrderFee[] {
  if (!isBridgeOrder(order)) {
    throw new Error('computeBridgeOrderFee only support bridge order')
  }

  if (isSolana(order.trade.inputAmount.currency.chainId) || isSolana(order.trade.outputAmount.currency.chainId)) {
    // Convert native percent string (e.g., "-0.27") to Percent object
    let priceImpactWithoutFee: Percent | undefined
    if (order.bridgeTransactionData.totalImpactPct) {
      const impactValue = parseFloat(order.bridgeTransactionData.totalImpactPct)
      // Take absolute value and convert to Percent (divide by 100 to convert from percentage to decimal)
      const absImpact = Math.abs(impactValue)
      // Create Percent with numerator as the impact value (scaled by 10000) and denominator as 10000
      // This handles decimal percentages properly: 0.27% = 27/10000
      priceImpactWithoutFee = new Percent(Math.round(absImpact * 10000), 1000000)
    }

    return {
      priceImpactWithoutFee,
      lpFeeAmount: order.bridgeFee,
      type: OrderType.PCS_BRIDGE,
    }
  }

  if (!order.noSlippageCommands) {
    return {
      priceImpactWithoutFee: undefined,
      lpFeeAmount: undefined,
      type: OrderType.PCS_BRIDGE,
    }
  }

  return order.noSlippageCommands.map((command) => {
    if (command.type === OrderType.PCS_BRIDGE) {
      return {
        // TODO: add price impact for bridge
        priceImpactWithoutFee: undefined,
        lpFeeAmount: order.bridgeFee,
        type: command.type,
      }
    }

    const o = isXOrder(command) ? command.ammTrade : command?.trade

    return {
      ...computeTradePriceBreakdown(o),
      hasDynamicFee: detectHasDynamicHook(o),
      type: command.type,
    }
  })
}
