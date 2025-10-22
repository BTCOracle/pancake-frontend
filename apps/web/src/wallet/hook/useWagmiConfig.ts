import { isInBinance } from '@binance/w3w-utils'
import { useEffect } from 'react'
import { createW3WWagmiConfig, createWagmiConfig } from 'utils/wagmi'
import { eip6963Providers } from 'wallet/WalletProvider'
import { atom, useAtom } from 'jotai'

export const wagmiConfigAtom = atom<any>(undefined)
export const useWagmiConfig = () => {
  const [wagmiConfig, setWagmiConfig] = useAtom(wagmiConfigAtom)

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const handleAnnounceProvider = (event: any) => {
      if (!event?.detail || typeof event.detail !== 'object') {
        console.warn("[wallet] Ignored 'eip6963:announceProvider' event: invalid detail: ", event?.detail)
        return
      }
      const { provider, info } = event.detail
      if (!provider || !info?.uuid) return
      const exists = eip6963Providers.some((p) => p.info.uuid === info.uuid)
      if (exists) {
        return
      }
      eip6963Providers.push({
        provider,
        info,
      })
    }
    window.addEventListener('eip6963:announceProvider', handleAnnounceProvider)
    window.dispatchEvent(new Event('eip6963:requestProvider'))

    const timer = setTimeout(() => {
      console.log(`[wallet] init wagmi config`)
      setWagmiConfig(typeof window !== 'undefined' && isInBinance() ? createW3WWagmiConfig() : createWagmiConfig())
    })

    return () => {
      window.removeEventListener('eip6963:announceProvider', handleAnnounceProvider)
      clearTimeout(timer)
    }
  }, [setWagmiConfig])

  return wagmiConfig
}
