import { Percent } from '@pancakeswap/swap-sdk-core'
import { atom, useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

export const INITIAL_ALLOWED_SLIPPAGE = 50

const userSlippageAtom = atomWithStorage('pcs:slippage', INITIAL_ALLOWED_SLIPPAGE)
const solanaUserSlippageAtom = atomWithStorage('_r_swap_slippage_', INITIAL_ALLOWED_SLIPPAGE)

const liquidityUserSlippageAtom = atomWithStorage('pcs:liquiditySlippage', INITIAL_ALLOWED_SLIPPAGE)

export const userSlippageAtomWithLocalStorage = atom(
  (get) => {
    const slippage = get(userSlippageAtom)
    if (slippage < 1) return INITIAL_ALLOWED_SLIPPAGE
    return slippage
  },
  (_get, set, slippage: number) => {
    if (typeof slippage === 'number') {
      set(userSlippageAtom, slippage)
    }
  },
)

export const solanaUserSlippageAtomWithLocalStorage = atom(
  (get) => {
    const slippage = get(solanaUserSlippageAtom)
    if (slippage < 1) return INITIAL_ALLOWED_SLIPPAGE
    return slippage
  },
  (_get, set, slippage: number) => {
    if (typeof slippage === 'number') {
      set(solanaUserSlippageAtom, slippage)
    }
  },
)

export const liquidityUserSlippageAtomWithLocalStorage = atom(
  (get) => get(liquidityUserSlippageAtom),
  (_get, set, slippage: number) => {
    if (typeof slippage === 'number') {
      set(liquidityUserSlippageAtom, slippage)
    }
  },
)

export const useUserSlippage = () => {
  return useAtom(userSlippageAtomWithLocalStorage)
}

export const useLiquidityUserSlippage = () => {
  return useAtom(liquidityUserSlippageAtomWithLocalStorage)
}

export const useSolanaUserSlippage = () => {
  return useAtom(solanaUserSlippageAtomWithLocalStorage)
}

// Derived atom for slippage as a Percent
const userSlippagePercentAtom = atom((get) => {
  const slippage = get(userSlippageAtom)
  return new Percent(slippage, 10_000)
})

export const useUserSlippagePercent = () => {
  return useAtom(userSlippagePercentAtom)
}
