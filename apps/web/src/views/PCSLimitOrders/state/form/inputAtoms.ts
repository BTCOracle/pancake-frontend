import { atom } from 'jotai'
import tryParseAmount from '@pancakeswap/utils/tryParseAmount'
import { formatAmount } from '@pancakeswap/utils/formatFractions'
import { Field } from 'views/PCSLimitOrders/types/limitOrder.types'
import { Token } from '@pancakeswap/sdk'
import { BigNumber as BN } from 'bignumber.js'
import { parseUnits } from '@pancakeswap/utils/viem/parseUnits'
import { independentFieldAtom, typedValueAtom } from './fieldAtoms'
import { inputCurrencyAtom, outputCurrencyAtom } from '../currency/currencyAtoms'
import { customMarketPriceAtom } from './customMarketPriceAtom'
import { currentMarketPriceAtom } from './currentMarketPriceAtom'
import { ticksAtom } from './ticksAtom'

const independentAmountAtom = atom((get) => {
  const value = get(typedValueAtom)
  const independentField = get(independentFieldAtom)

  const inputCurrency = get(inputCurrencyAtom)
  const outputCurrency = get(outputCurrencyAtom)

  const currency = independentField === Field.CURRENCY_A ? inputCurrency : outputCurrency
  return tryParseAmount<Token>(value, currency as Token)
})

const dependentAmountAtom = atom((get) => {
  const customMarketPrice = get(customMarketPriceAtom)
  const currentMarketPrice = get(currentMarketPriceAtom)

  const independentField = get(independentFieldAtom)
  const independentAmount = get(independentAmountAtom)

  const quoteCurrency = independentField === Field.CURRENCY_A ? get(outputCurrencyAtom) : get(inputCurrencyAtom)

  if (!independentAmount || !quoteCurrency || (!currentMarketPrice && !customMarketPrice)) return undefined

  const tickData = get(ticksAtom)
  if (!tickData) return undefined

  // Get sqrt price from lower and upper ticks
  const { sqrtPrice } = tickData
  if (!sqrtPrice.isFinite() || sqrtPrice.isZero()) return undefined

  const price = independentField === Field.CURRENCY_A ? sqrtPrice : BN(1).dividedBy(sqrtPrice)
  const amount = BN(independentAmount.toExact()).multipliedBy(price)
  return tryParseAmount<Token>(amount.toString(), quoteCurrency as Token)
})

export const formattedAmountsAtom = atom((get) => {
  const typedValue = get(typedValueAtom)

  if (!typedValue) {
    return {
      [Field.CURRENCY_A]: '',
      [Field.CURRENCY_B]: '',
    }
  }

  const independentField = get(independentFieldAtom)
  const dependentAmount = get(dependentAmountAtom)
  const formattedDependentAmount = formatAmount(dependentAmount) || ''

  // Use current independent field for both normal and custom market price scenarios
  return {
    [Field.CURRENCY_A]: independentField === Field.CURRENCY_A ? typedValue : formattedDependentAmount,
    [Field.CURRENCY_B]: independentField === Field.CURRENCY_B ? typedValue : formattedDependentAmount,
  }
})

export const parsedAmountsAtom = atom((get) => {
  const inputCurrency = get(inputCurrencyAtom)
  const outputCurrency = get(outputCurrencyAtom)
  const formattedAmounts = get(formattedAmountsAtom)

  if (!inputCurrency || !outputCurrency)
    return {
      [Field.CURRENCY_A]: undefined,
      [Field.CURRENCY_B]: undefined,
    }

  return {
    [Field.CURRENCY_A]: parseUnits(formattedAmounts[Field.CURRENCY_A], inputCurrency.decimals),
    [Field.CURRENCY_B]: parseUnits(formattedAmounts[Field.CURRENCY_B], outputCurrency.decimals),
  }
})

/// Setters
export const setInputAtom = atom(null, (_get, set, { field, value }: { field: Field; value: string | undefined }) => {
  set(typedValueAtom, value ?? '')
  set(independentFieldAtom, field)
})
