import { atom } from 'jotai'
import { Field } from 'views/PCSLimitOrders/types/limitOrder.types'
import { BigNumber as BN } from 'bignumber.js'
import { currencyUSDPriceAtom, currencyUSDPriceUnwrapAtom } from 'hooks/useCurrencyUsdPrice'
import { ticksAtom } from './ticksAtom'
import { formattedAmountsAtom } from './inputAtoms'
import { selectedPoolAtom } from '../pools/selectedPoolAtom'
import { outputCurrencyAtom } from '../currency/currencyAtoms'

/**
 * Output Received = input_amount * sqrt(priceLower * priceUpper)
 */
export const outputReceivedAtom = atom((get) => {
  const ticksData = get(ticksAtom)
  if (!ticksData) return undefined

  const { sqrtPrice } = ticksData

  const formattedAmounts = get(formattedAmountsAtom)
  const inputAmount = BN(formattedAmounts[Field.CURRENCY_A])

  if (inputAmount.isNaN() || !inputAmount.isFinite()) return undefined

  // output_received = input_amount * price
  const outputReceived = inputAmount.multipliedBy(sqrtPrice)
  return outputReceived
})

/**
 * Fees Earned = fee_tier * output_received in USD value
 */
export const feesEarnedUSDAtom = atom((get) => {
  const outputCurrency = get(outputCurrencyAtom)
  if (!outputCurrency) return undefined

  const { data: selectedPool } = get(selectedPoolAtom)
  if (!selectedPool) return undefined

  const outputReceived = get(outputReceivedAtom)
  if (!outputReceived) return undefined

  const feeTier = selectedPool.pool.fee / 1e6 // value 1000 => 0.1% tier => 0.001

  // Fees Earned in Output Currency = fee tier * output_received
  const feesEarned = outputReceived.multipliedBy(BN(feeTier))

  const outputCurrencyPrice = get(currencyUSDPriceUnwrapAtom(outputCurrency))
  const feesEarnedUSD = feesEarned.multipliedBy(BN(outputCurrencyPrice))

  return { feesEarned, feesEarnedUSD }
})

/**
 * Amount Received = output_received + fees_earned
 */
export const amountReceivedAtom = atom((get) => {
  const outputReceived = get(outputReceivedAtom)
  if (!outputReceived) return undefined

  const feesEarnedData = get(feesEarnedUSDAtom)
  if (!feesEarnedData) return undefined

  const { feesEarned } = feesEarnedData

  const amountReceived = outputReceived.plus(feesEarned)

  return amountReceived
})
