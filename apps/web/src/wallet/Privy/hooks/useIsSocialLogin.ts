import { useSocialLoginProviderAtom } from 'wallet/Privy/atom'

export const useIsSocialLogin = (): boolean => {
  const [provider] = useSocialLoginProviderAtom()
  return Boolean(provider)
}
