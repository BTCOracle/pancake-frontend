import { ChainId, NonEVMChainId, UnifiedChainId } from '@pancakeswap/chains'
import { Native, NativeCurrency, SOL, UnifiedNativeCurrency } from '@pancakeswap/sdk'
import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import { useMemo } from 'react'
import { useActiveChainId } from './useActiveChainId'

export function useUnifiedNativeCurrency(overrideChainId?: UnifiedChainId): UnifiedNativeCurrency {
  const { chainId: chainId_ } = useActiveChainId()
  const chainId = overrideChainId ?? chainId_
  return useMemo(() => {
    try {
      if (chainId === NonEVMChainId.SOLANA) {
        return SOL
      }
      return Native.onChain(overrideChainId ?? chainId ?? ChainId.BSC)
    } catch (e) {
      return Native.onChain(ChainId.BSC)
    }
  }, [overrideChainId, chainId])
}

export default function useNativeCurrency(overrideChainId?: ChainId): NativeCurrency {
  const { chainId } = useActiveChainId()
  return useMemo(() => {
    try {
      return Native.onChain(overrideChainId ?? chainId ?? ChainId.BSC)
    } catch (e) {
      return Native.onChain(ChainId.BSC)
    }
  }, [overrideChainId, chainId])
}

export const nativeCurrencyAtom = atomFamily((chainId?: ChainId) => {
  return atom(() => {
    try {
      return Native.onChain(chainId ?? ChainId.BSC)
    } catch (e) {
      return Native.onChain(ChainId.BSC)
    }
  })
})
