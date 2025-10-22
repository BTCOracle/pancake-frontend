import { FARMING_OFFCHAIN_ABI, INFI_FARMING_DISTRIBUTOR_ADDRESSES } from '@pancakeswap/infinity-sdk'
import { useQuery } from '@tanstack/react-query'
import { publicClient } from 'utils/viem'

export const useMerkleTreeRootFromDistributor = (chainId?: number) => {
  const { data } = useQuery({
    queryKey: ['use-merkletree-root', chainId],
    queryFn: async () => {
      if (!chainId) return undefined
      const client = publicClient({ chainId })
      return client.readContract({
        abi: FARMING_OFFCHAIN_ABI,
        address: INFI_FARMING_DISTRIBUTOR_ADDRESSES[chainId!],
        functionName: 'getMerkleTreeRoot',
      })
    },
    enabled: Boolean(chainId),
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  })
  return data
}
