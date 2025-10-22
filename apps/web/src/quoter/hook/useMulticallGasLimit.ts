import { ChainId } from '@pancakeswap/chains'
import { getDefaultGasLimit, getGasLimitOnChain } from '@pancakeswap/multicall'
import { OnChainProvider } from '@pancakeswap/smart-router'
import { useQuery } from '@tanstack/react-query'
import { atomFamily } from 'jotai/utils'
import { useMemo } from 'react'

import { atomWithAsyncRetry } from 'utils/atomWithAsyncRetry'
import { getViemClients } from 'utils/viem'

const CHAINS_TO_USE_DEFAULT = [ChainId.BASE]

export function useMulticallGasLimit(chainId?: ChainId) {
  const shouldUseDefault = useMemo(() => Boolean(chainId && CHAINS_TO_USE_DEFAULT.includes(chainId)), [chainId])
  const defaultGasLimit = useMemo(() => getDefaultGasLimit(chainId), [chainId])
  const client = useMemo(() => getViemClients({ chainId }), [chainId])

  const { data: gasLimitOnChain } = useQuery({
    queryKey: [chainId],
    queryFn: async () => {
      if (!chainId) {
        throw new Error('chainId is not defined')
      }
      return getGasLimitOnChain({ chainId, client })
    },
    enabled: Boolean(chainId && client && !shouldUseDefault),
    refetchInterval: 30_000,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  })

  return useMemo(
    () => (shouldUseDefault ? defaultGasLimit : gasLimitOnChain),
    [gasLimitOnChain, shouldUseDefault, defaultGasLimit],
  )
}

export const multicallGasLimitAtom = atomFamily((chainId?: ChainId) => {
  return atomWithAsyncRetry({
    asyncFn: async () => {
      return getMulticallGasLimit(getViemClients, chainId)
    },
    fallbackValue: getDefaultGasLimit(chainId),
  })
})

export const getMulticallGasLimit = (provider: OnChainProvider = getViemClients, chainId?: ChainId) => {
  const shouldUseDefault = chainId ? CHAINS_TO_USE_DEFAULT.includes(chainId) : true

  if (shouldUseDefault || !chainId) {
    return getDefaultGasLimit(chainId)
  }

  const client = provider({ chainId })
  return getGasLimitOnChain({ chainId, client })
}
