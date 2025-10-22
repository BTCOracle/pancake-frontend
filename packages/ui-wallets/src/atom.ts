import { atom } from 'jotai'
import { WalletConfigV2, WalletIds } from './types'

const MAXIMUM_STORE_NUM = 3
export const previouslyUsedEvmWalletsKey = 'previous-used-evm-wallets'
export const previouslyUsedSolanaWalletsKey = 'previous-used-solana-wallets'
const previouslyUsedWalletsStoreSeparator = ','

export const errorAtom = atom<string>('')

export const selectedEvmWalletAtom = atom<WalletConfigV2<unknown> | null>(null)
export const selectedSolanaWalletAtom = atom<WalletConfigV2<unknown> | null>(null)

export const lastUsedEvmWalletNameAtom = atom('', (get, set, update: string) => {
  const list = get(previouslyUsedEvmWalletsAtom)
  set(previouslyUsedEvmWalletsAtom, [update, ...list.filter((i) => i !== update)].slice(0, MAXIMUM_STORE_NUM))
})

export const previouslyUsedEvmWalletsAtom = atom([] as string[], (_get, set, update: string[]) => {
  set(previouslyUsedEvmWalletsAtom, update)
  if (update && Array.isArray(update)) {
    localStorage?.setItem(previouslyUsedEvmWalletsKey, update.join(previouslyUsedWalletsStoreSeparator))
  }
})

previouslyUsedEvmWalletsAtom.onMount = (set) => {
  const preferred = localStorage?.getItem(previouslyUsedEvmWalletsKey)
  if (preferred) {
    set(preferred.split(previouslyUsedWalletsStoreSeparator) as WalletIds[])
  }
}

export const lastUsedSolanaWalletNameAtom = atom('', (get, set, update: string) => {
  const list = get(previouslyUsedSolanaWalletsAtom)
  set(previouslyUsedSolanaWalletsAtom, [update, ...list.filter((i) => i !== update)].slice(0, MAXIMUM_STORE_NUM))
})

export const previouslyUsedSolanaWalletsAtom = atom([] as string[], (_get, set, update: string[]) => {
  set(previouslyUsedSolanaWalletsAtom, update)
  if (update && Array.isArray(update)) {
    localStorage?.setItem(previouslyUsedSolanaWalletsKey, update.join(previouslyUsedWalletsStoreSeparator))
  }
})

previouslyUsedSolanaWalletsAtom.onMount = (set) => {
  const preferred = localStorage?.getItem(previouslyUsedSolanaWalletsKey)
  if (preferred) {
    set(preferred.split(previouslyUsedWalletsStoreSeparator) as WalletIds[])
  }
}
