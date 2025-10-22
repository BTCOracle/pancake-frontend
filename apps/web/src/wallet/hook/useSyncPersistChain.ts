import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { allCasesNameToChainId } from '@pancakeswap/chains'
import { useSwitchNetworkV2 } from './useSwitchNetworkV2'

export const useSyncPersistChain = () => {
  const router = useRouter()
  const { query } = router
  const chain = (query.chain || '') as string
  const persistChain = query.persistChain ? String(query.persistChain) : null
  const { switchNetwork } = useSwitchNetworkV2()

  useEffect(() => {
    if (chain && persistChain) {
      const chainId = allCasesNameToChainId[chain]
      if (chainId) {
        switchNetwork(chainId)
      }
    }
  }, [chain, persistChain, switchNetwork])
}
