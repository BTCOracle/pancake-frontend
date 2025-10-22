import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'

import { SPLToken } from '@pancakeswap/swap-sdk-core'
import { TokenListKey } from 'config/solana-list'
import { atomWithStorageSync } from 'utils/atomWithStorageSync'
import { solanaTokens } from '@pancakeswap/tokens'

// Atom to store the list of SPLToken
export const solanaTokenListAtom = atom<SPLToken[]>([solanaTokens.cake, solanaTokens.usdc, solanaTokens.usdt])

// AtomFamily to get a token by address from the list
export const solanaTokenAtomFamily = atomFamily((address?: string) =>
  atom((get) => (address ? get(solanaTokenListAtom).find((token) => token.address === address) : undefined)),
)

// Dynamic atom to manage Solana list settings
// This will automatically support any new token list keys added to SOLANA_LISTS
export const solanaListSettingsAtom = atomWithStorageSync<
  Record<Exclude<TokenListKey, TokenListKey.PANCAKESWAP>, boolean>
>('pcs:solana-token-list-settings', {
  [TokenListKey.RAYDIUM]: true,
  [TokenListKey.JUPITER]: true,
})
