import { Currency } from '@pancakeswap/swap-sdk-core'
import { atom } from 'jotai'

import currencyId from 'utils/currencyId'
import { Field } from 'views/PCSLimitOrders/types/limitOrder.types'
import { independentFieldAtom } from 'views/PCSLimitOrders/state/form/fieldAtoms'
import { accountActiveChainAtom } from 'wallet/atoms/accountStateAtoms'
import { getCurrencyAddress } from 'utils/getCurrencyAddress'
import { outputCurrencyAtom, inputCurrencyAtom, inputCurrencyIdAtom, outputCurrencyIdAtom } from './currencyAtoms'
import { customMarketPriceAtom } from '../form/customMarketPriceAtom'
import { supportedPoolsListAtom } from '../pools/poolsListAtom'

export const setCurrencyAtom = atom(
  null,
  async (get, set, { field, newCurrency }: { field: Field; newCurrency: Currency }) => {
    const newId = currencyId(newCurrency)

    const otherCurrency = field === Field.CURRENCY_A ? await get(outputCurrencyAtom) : await get(inputCurrencyAtom)

    if (otherCurrency && newCurrency.equals(otherCurrency)) {
      // Flip Currencies
      set(flipCurrenciesAtom)
      return
    }

    // Clear custom market price when currency changes since it's no longer valid
    set(customMarketPriceAtom, undefined)

    if (field === Field.CURRENCY_A) {
      set(inputCurrencyIdAtom, newId)

      // Further, check if input currency is selected and that the current output currency makes a valid pair
      const { chainId } = get(accountActiveChainAtom)
      const allPools = await get(supportedPoolsListAtom)
      const validPools = allPools.filter(
        (pool) =>
          (pool.chainId === chainId &&
            pool.currency0 === getCurrencyAddress(newCurrency) &&
            pool.currency1 === getCurrencyAddress(otherCurrency)) ||
          (pool.currency0 === getCurrencyAddress(otherCurrency) && pool.currency1 === getCurrencyAddress(newCurrency)),
      )

      // Reset output token if not a valid pair
      if (validPools.length === 0) {
        set(outputCurrencyIdAtom, '')
      }
    } else set(outputCurrencyIdAtom, newId)
  },
)

export const flipCurrenciesAtom = atom(null, (get, set) => {
  const idA = get(inputCurrencyIdAtom)
  const idB = get(outputCurrencyIdAtom)
  const independentField = get(independentFieldAtom)

  // Clear custom market price when currencies are flipped since the price direction changes
  set(customMarketPriceAtom, undefined)

  set(inputCurrencyIdAtom, idB)
  set(outputCurrencyIdAtom, idA)
  set(independentFieldAtom, independentField === Field.CURRENCY_A ? Field.CURRENCY_B : Field.CURRENCY_A)
})
