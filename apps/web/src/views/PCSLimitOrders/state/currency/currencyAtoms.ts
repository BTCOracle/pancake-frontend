import { Native } from '@pancakeswap/sdk'
import { CAKE } from '@pancakeswap/tokens'
import { atom } from 'jotai'
import { atomFamily, unwrap } from 'jotai/utils'
import { accountActiveChainAtom } from 'wallet/atoms/accountStateAtoms'
import isEqual from 'lodash/isEqual'
import { currencyAtom } from 'hooks/Tokens'
import { LIMIT_ORDERS_HOOKS_SUPPORTED_CHAINS } from 'config/constants/supportChains'

// TODO: Sync with Query State (inputCurrency & outputCurrency, like swap). Idea: Create -> locationAtom and atomWithUrlQuery
const inputCurrencyFamily = atomFamily(
  (chainId: number) =>
    atom(chainId && LIMIT_ORDERS_HOOKS_SUPPORTED_CHAINS.includes(chainId) ? Native.onChain(chainId).symbol : ''),
  isEqual,
)
const outputCurrencyFamily = atomFamily(
  (chainId: number) =>
    atom(chainId && LIMIT_ORDERS_HOOKS_SUPPORTED_CHAINS.includes(chainId) ? CAKE[chainId].address : ''),
  isEqual,
)

// Currency Id atoms
export const inputCurrencyIdAtom = atom(
  (get) => {
    const { chainId } = get(accountActiveChainAtom)
    // Don't try to resolve currency for unsupported chains
    if (!chainId || !LIMIT_ORDERS_HOOKS_SUPPORTED_CHAINS.includes(chainId)) {
      return undefined
    }
    return get(inputCurrencyFamily(chainId))
  },
  (get, set, newValue: string | undefined) => {
    if (newValue !== undefined) {
      const { chainId } = get(accountActiveChainAtom)

      // Do nothing for unsupported chains
      if (!chainId || !LIMIT_ORDERS_HOOKS_SUPPORTED_CHAINS.includes(chainId)) return

      set(inputCurrencyFamily(chainId), newValue)
    }
  },
)

export const outputCurrencyIdAtom = atom(
  (get) => {
    const { chainId } = get(accountActiveChainAtom)
    // Don't try to resolve currency for unsupported chains
    if (!chainId || !LIMIT_ORDERS_HOOKS_SUPPORTED_CHAINS.includes(chainId)) {
      return undefined
    }
    return get(outputCurrencyFamily(chainId))
  },
  (get, set, newValue: string | undefined) => {
    if (newValue !== undefined) {
      const { chainId } = get(accountActiveChainAtom)

      // Do nothing for unsupported chains
      if (!chainId || !LIMIT_ORDERS_HOOKS_SUPPORTED_CHAINS.includes(chainId)) return

      set(outputCurrencyFamily(chainId), newValue)
    }
  },
)

// Currency Atoms
export const inputCurrencyAtom = unwrap(
  atom((get) => {
    const currencyId = get(inputCurrencyIdAtom)
    // Don't try to resolve currency for unsupported chains
    if (!currencyId) {
      return undefined
    }
    return get(currencyAtom(currencyId))
  }),
  (prev) => prev,
)
export const outputCurrencyAtom = unwrap(
  atom((get) => {
    const currencyId = get(outputCurrencyIdAtom)
    // Don't try to resolve currency for unsupported chains
    if (!currencyId) {
      return undefined
    }
    return get(currencyAtom(currencyId))
  }),
  (prev) => prev,
)
