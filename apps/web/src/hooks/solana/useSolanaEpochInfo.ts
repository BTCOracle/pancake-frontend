import { EpochInfo } from '@solana/web3.js'
import { useQuery } from '@tanstack/react-query'
import { SLOW_INTERVAL } from 'config/constants'
import { useSolanaConnectionWithRpcAtom } from './useSolanaConnectionWithRpcAtom'

export const useSolanaEpochInfo = () => {
  const connection = useSolanaConnectionWithRpcAtom()

  return useQuery({
    queryKey: ['solana-epoch-info', connection.rpcEndpoint],
    queryFn: async (): Promise<EpochInfo> => {
      const epochInfo = await connection.getEpochInfo()
      return epochInfo
    },
    enabled: !!connection,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchInterval: SLOW_INTERVAL,
    staleTime: SLOW_INTERVAL / 2,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  })
}
