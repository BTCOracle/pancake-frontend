import { atom } from 'jotai'

export type SolanaWalletStatus = 'connected' | 'disconnected' | 'connecting' | 'reconnecting' | null

export const solanaWalletModalAtom = atom(false)
