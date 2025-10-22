import { atom } from 'jotai'
import { WalletIds } from './legacyWalletIds'
import { WalletConfigV2 } from '../../types'

const MAXIMUM_STORE_NUM = 3

export const errorAtom = atom<string>('')

export const selectedWalletAtom = atom<WalletConfigV2<unknown> | null>(null)

export const lastUsedWalletNameAtom = atom('', (get, set, update: string) => {
  const list = get(previouslyUsedWalletsAtom)
  set(previouslyUsedWalletsAtom, [update, ...list.filter((i) => i !== update)].slice(0, MAXIMUM_STORE_NUM))
})

export const previouslyUsedWalletsKey = 'previous-used-wallets'
const previouslyUsedWalletsStoreSeparator = ','

export const previouslyUsedWalletsAtom = atom([] as string[], (_get, set, update: string[]) => {
  set(previouslyUsedWalletsAtom, update)
  if (update && Array.isArray(update)) {
    localStorage?.setItem(previouslyUsedWalletsKey, update.join(previouslyUsedWalletsStoreSeparator))
  }
})

previouslyUsedWalletsAtom.onMount = (set) => {
  const preferred = localStorage?.getItem(previouslyUsedWalletsKey)
  if (preferred) {
    set(preferred.split(previouslyUsedWalletsStoreSeparator) as WalletIds[])
  }
}
