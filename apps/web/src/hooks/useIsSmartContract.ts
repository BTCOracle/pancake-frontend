import { useQuery } from '@tanstack/react-query'
import { publicClient } from 'utils/viem'
import { Address } from 'viem'
import { useChainId } from 'wagmi'

export const useIsSmartContract = (address?: Address, overrideChainId?: number): boolean => {
  const activeChainId = useChainId()
  const chainId = overrideChainId ?? activeChainId

  const { data } = useQuery({
    queryKey: ['useIsSmartContract', chainId, address],
    queryFn: async () => {
      if (!address) return false

      const client = publicClient({ chainId })

      if (!client) return false

      const code = await client.getCode({ address })

      return code && code !== '0x'
    },
    enabled: !!address,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })

  return !!data
}
