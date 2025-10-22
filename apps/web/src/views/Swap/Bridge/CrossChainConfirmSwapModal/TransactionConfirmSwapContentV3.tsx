import { Currency, CurrencyAmount, TradeType } from '@pancakeswap/sdk'
import { ConfirmationModalContent } from '@pancakeswap/widgets-internal'
import { memo, useCallback, useMemo } from 'react'
import { Field } from 'state/swap/actions'
import { maxUnifiedAmountSpend } from 'utils/maxAmountSpend'
import { computeBridgeOrderFee } from 'views/Swap/Bridge/utils'
import { EVMInterfaceOrder, InterfaceOrder, isBridgeOrder, isXOrder } from 'views/Swap/utils'
import {
  computeSlippageAdjustedAmounts as computeSlippageAdjustedAmountsWithSmartRouter,
  computeTradePriceBreakdown as computeTradePriceBreakdownWithSmartRouter,
} from 'views/Swap/V3Swap/utils/exchange'
import { SwapModalFooterV3 } from './SwapModalFooterV3'
import SwapModalHeaderV3 from './SwapModalHeaderV3'

/**
 * Returns true if the trade requires a confirmation of details before we can submit it
 * @param tradeA trade A
 * @param tradeB trade B
 */
function tradeMeaningfullyDiffers(tradeA: InterfaceOrder['trade'], tradeB: InterfaceOrder['trade']): boolean {
  return (
    tradeA.tradeType !== tradeB.tradeType ||
    !tradeA.inputAmount.currency.equals(tradeB.inputAmount.currency) ||
    !tradeA.inputAmount.equalTo(tradeB.inputAmount) ||
    !tradeA.outputAmount.currency.equals(tradeB.outputAmount.currency) ||
    !tradeA.outputAmount.equalTo(tradeB.outputAmount)
  )
}

interface TransactionConfirmSwapContentV3Props {
  order: EVMInterfaceOrder | undefined | null
  originalOrder: EVMInterfaceOrder | undefined | null
  // trade: Trade | undefined | null
  // originalTrade: Trade | undefined | null
  onAcceptChanges: () => void
  allowedSlippage: number
  onConfirm: () => void
  recipient?: string | null
  currencyBalances?: {
    INPUT?: CurrencyAmount<Currency>
    OUTPUT?: CurrencyAmount<Currency>
  }
}

export const TransactionConfirmSwapContentV3 = memo<TransactionConfirmSwapContentV3Props>(
  function TransactionConfirmSwapContentV3Comp({
    order,
    recipient,
    originalOrder,
    allowedSlippage,
    currencyBalances,
    onConfirm,
    onAcceptChanges,
  }) {
    const showAcceptChanges = useMemo(
      () => Boolean(order && originalOrder && tradeMeaningfullyDiffers(order.trade, originalOrder.trade)),
      [originalOrder, order],
    )

    const slippageAdjustedAmounts = useMemo(
      () => computeSlippageAdjustedAmountsWithSmartRouter(order, allowedSlippage),
      [order, allowedSlippage],
    )
    const priceBreakdown = useMemo(
      () =>
        isBridgeOrder(order)
          ? computeBridgeOrderFee(order)
          : computeTradePriceBreakdownWithSmartRouter(isXOrder(order) ? undefined : order?.trade),
      [order],
    )

    const isEnoughInputBalance = useMemo(() => {
      if (order?.trade?.tradeType !== TradeType.EXACT_OUTPUT) return null

      const isInputBalanceExist = !!(currencyBalances && currencyBalances[Field.INPUT])
      const inputCurrencyAmount = isInputBalanceExist ? maxUnifiedAmountSpend(currencyBalances[Field.INPUT]) : null
      return inputCurrencyAmount && slippageAdjustedAmounts && slippageAdjustedAmounts[Field.INPUT]
        ? inputCurrencyAmount.greaterThan(slippageAdjustedAmounts[Field.INPUT]) ||
            inputCurrencyAmount.equalTo(slippageAdjustedAmounts[Field.INPUT])
        : false
    }, [order?.trade?.tradeType, currencyBalances, slippageAdjustedAmounts])

    const modalHeader = useCallback(() => {
      return order ? (
        <SwapModalHeaderV3
          inputAmount={order.trade.inputAmount}
          outputAmount={order.trade.outputAmount}
          currencyBalances={currencyBalances}
          tradeType={order.trade.tradeType}
          priceImpactWithoutFee={(!Array.isArray(priceBreakdown) && priceBreakdown.priceImpactWithoutFee) || undefined}
          isEnoughInputBalance={isEnoughInputBalance ?? undefined}
          recipient={recipient ?? undefined}
          showAcceptChanges={showAcceptChanges}
          onAcceptChanges={onAcceptChanges}
        />
      ) : null
    }, [order, currencyBalances, priceBreakdown, isEnoughInputBalance, recipient, showAcceptChanges, onAcceptChanges])

    const modalBottom = useCallback(() => {
      return order ? (
        <SwapModalFooterV3
          order={order}
          tradeType={order.trade.tradeType}
          inputAmount={order.trade.inputAmount}
          outputAmount={order.trade.outputAmount}
          priceBreakdown={priceBreakdown}
          disabledConfirm={showAcceptChanges}
          slippageAdjustedAmounts={slippageAdjustedAmounts ?? undefined}
          isEnoughInputBalance={isEnoughInputBalance ?? undefined}
          onConfirm={onConfirm}
        />
      ) : null
    }, [order, priceBreakdown, showAcceptChanges, slippageAdjustedAmounts, isEnoughInputBalance, onConfirm])

    return <ConfirmationModalContent topContent={modalHeader} bottomContent={modalBottom} />
  },
)
