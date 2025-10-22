import { atom } from 'jotai'
import { Field, ValidationError } from 'views/PCSLimitOrders/types/limitOrder.types'
import { BigNumber as BN } from 'bignumber.js'
import { formattedAmountsAtom } from './inputAtoms'
import { inputCurrencyAtom, outputCurrencyAtom } from '../currency/currencyAtoms'

export const commitButtonEnabledAtom = atom((get) => {
  const inputCurrency = get(inputCurrencyAtom)
  const outputCurrency = get(outputCurrencyAtom)

  if (!inputCurrency || !outputCurrency) return { enabled: false, errorReason: null }

  const formattedAmounts = get(formattedAmountsAtom)
  const amountA = formattedAmounts[Field.CURRENCY_A]
  const amountB = formattedAmounts[Field.CURRENCY_B]
  const amountABN = BN(amountA)
  const amountBBN = BN(amountB)

  // Has no liquidity (one of the fields has a value and the other doesn't)
  if (!amountABN.isZero() && !amountBBN.isZero() && ((amountA && !amountB) || (!amountA && amountB)))
    return { enabled: false, errorReason: ValidationError.NO_LIQUIDITY }

  const hasValues = amountA && amountB
  if (!hasValues) return { enabled: false, errorReason: null }

  // TODO: Migrate Balance Check to atoms

  return { enabled: true, errorReason: null }
})
