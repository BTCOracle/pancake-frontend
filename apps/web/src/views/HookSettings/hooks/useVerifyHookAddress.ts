import { ChainId } from '@pancakeswap/chains'
import { useQuery } from '@tanstack/react-query'
import debounce from 'lodash/debounce'
import { useEffect, useMemo, useState } from 'react'
import { rewardApiClient } from 'state/farmsV4/api/client'
import { chainIdToExplorerInfoChainName } from 'state/info/api/client'
import { isAddress } from 'viem/utils'

export const useVerifyHookAddress = ({ chainId, hookAddress }: { chainId?: number; hookAddress?: string }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['isVerified', chainId, hookAddress],
    queryFn: async () => {
      const unVerifyed = { isVerified: false, isUpgradable: false }
      if (!chainId || !hookAddress) {
        return unVerifyed
      }
      if (!isAddress(hookAddress)) {
        return unVerifyed
      }
      const resp = await rewardApiClient.GET('/farms/verification/verify-contract', {
        // @todo @ChefJerry remove this after the backend is ready
        baseUrl:
          chainId === ChainId.BSC_TESTNET ? 'https://test.v4.pancakeswap.com/' : 'https://infinity.pancakeswap.com/',
        params: {
          query: {
            address: hookAddress,
            network: chainIdToExplorerInfoChainName[chainId],
          },
        },
      })
      return resp.data ?? unVerifyed
    },
    enabled: Boolean(chainId && hookAddress),
    retry: false,
  })
  return useMemo(
    () => ({
      isVerified: data?.isVerified ?? false,
      isUpgradable: data?.isUpgradable ?? false,
      isLoading,
    }),
    [data?.isVerified, data?.isUpgradable, isLoading],
  )
}

export const useDebouncedVerifyHookAddress = ({ chainId, hookAddress }: { chainId?: number; hookAddress?: string }) => {
  const [debouncedHookAddress, setDebouncedHookAddress] = useState(hookAddress)

  useEffect(() => {
    const handler = debounce((value) => setDebouncedHookAddress(value), 1000)
    handler(hookAddress)
    return () => handler.cancel()
  }, [hookAddress])

  return useVerifyHookAddress({ chainId, hookAddress: debouncedHookAddress })
}
