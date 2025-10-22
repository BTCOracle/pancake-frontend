import { atom, useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

type SocialProvider = 'google' | 'x' | 'telegram' | 'discord' | null

const privySocialLoginAtom = atomWithStorage<boolean>('pcs:privySocialLogin', false, undefined, {
  getOnInit: true,
})

const socialLoginProviderAtom = atomWithStorage<SocialProvider>('pcs:socialLoginProvider', null, undefined, {
  getOnInit: true,
})

export function usePrivySocialLoginAtom() {
  return useAtom(privySocialLoginAtom)
}

export function useSocialLoginProviderAtom() {
  return useAtom(socialLoginProviderAtom)
}

export const walletModalAtom = atom<boolean>(false)

export function useWalletModalAtom() {
  return useAtom(walletModalAtom)
}
