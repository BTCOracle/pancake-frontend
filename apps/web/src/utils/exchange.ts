import { Currency, CurrencyAmount, Percent, Trade, TradeType } from '@pancakeswap/sdk'
import { pancakeRouter02ABI } from 'config/abi/IPancakeRouter02'
import { BIPS_BASE, V2_ROUTER_ADDRESS } from 'config/constants/exchange'
import { StableTrade } from 'config/constants/types'

import memoize from '@pancakeswap/utils/memoize'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useContract } from 'hooks/useContract'
import { Field } from '../state/swap/actions'

// converts a basis points value to a sdk percent
export const basisPointsToPercent = memoize((num: number): Percent => {
  return new Percent(BigInt(num), BIPS_BASE)
})

export function calculateSlippageAmount(value: CurrencyAmount<Currency>, slippage: number): [bigint, bigint] {
  if (slippage < 0 || slippage > 10000) {
    throw Error(`Unexpected slippage value: ${slippage}`)
  }
  return [
    (value.quotient * BigInt(10000 - slippage)) / BIPS_BASE,
    (value.quotient * BigInt(10000 + slippage)) / BIPS_BASE,
  ]
}

export function useRouterContract() {
  const { chainId } = useActiveChainId()
  return useContract(chainId && V2_ROUTER_ADDRESS[chainId], pancakeRouter02ABI)
}

// computes price breakdown for the trade
export { computeTradePriceBreakdown, warningSeverity } from './compuateTradePriceBreakdown'

// computes the minimum amount out and maximum amount in for a trade given a user specified allowed slippage in bips

export function computeSlippageAdjustedAmounts(
  trade: Trade<Currency, Currency, TradeType> | StableTrade | undefined,
  allowedSlippage: number,
): { [field in Field]?: CurrencyAmount<Currency> } {
  const pct = basisPointsToPercent(allowedSlippage)
  return {
    [Field.INPUT]: trade?.maximumAmountIn(pct),
    [Field.OUTPUT]: trade?.minimumAmountOut(pct),
  }
}

export function formatExecutionPrice(
  trade?: Trade<Currency, Currency, TradeType> | StableTrade,
  inverted?: boolean,
): string {
  if (!trade) {
    return ''
  }
  return inverted
    ? `${trade.executionPrice.invert().toSignificant(6)} ${trade.inputAmount.currency.symbol} / ${
        trade.outputAmount.currency.symbol
      }`
    : `${trade.executionPrice.toSignificant(6)} ${trade.outputAmount.currency.symbol} / ${
        trade.inputAmount.currency.symbol
      }`
}
