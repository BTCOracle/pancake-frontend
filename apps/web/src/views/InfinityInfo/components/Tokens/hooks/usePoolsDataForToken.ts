import { useQuery } from '@tanstack/react-query'
import { QUERY_SETTINGS_IMMUTABLE } from 'config/constants'
import { explorerApiClient } from 'state/info/api/client'
import { useExplorerChainNameByQuery } from 'state/info/api/hooks'
import type { components, operations } from 'state/info/api/schema'
import { useChainNameByQuery } from 'state/info/hooks'
import { PoolDataForView } from 'state/info/types'
import { calculateInfiFeePercent } from 'views/Swap/V3Swap/utils/exchange'

export const usePoolsDataForToken = (address: string): PoolDataForView[] | undefined => {
  const chainName = useChainNameByQuery()
  const explorerChainName = useExplorerChainNameByQuery()

  const { data } = useQuery({
    queryKey: [`infinity/info/pool/poolsDataForToken/${chainName}/${address}`],

    queryFn: async ({ signal }) => {
      const resp = await fetchPoolsForToken(address, explorerChainName!, signal)
      if (resp.error) {
        return {
          data: [],
        }
      }
      return {
        data: resp.data.map((item) => {
          if (item.protocolFee) {
            const { totalFee } = calculateInfiFeePercent(item.feeTier, item.protocolFee)
            return {
              ...item,
              feeTier: totalFee,
            } as PoolDataForView
          }
          return item
        }),
      }
    },
    enabled: Boolean(explorerChainName && address && address !== 'undefined'),
    ...QUERY_SETTINGS_IMMUTABLE,
  })
  return data?.data
}

/**
 * Fetch top addresses by volume
 */
export async function fetchPoolsForToken(
  address: string,
  chainName: components['schemas']['ChainName'],
  signal: AbortSignal,
): Promise<{ error: boolean; data: PoolDataForView[] }> {
  try {
    const data = await explorerApiClient.GET('/cached/pools/infinity/{chainName}/list/top', {
      signal,
      params: {
        path: {
          chainName,
        },
        query: {
          token: address,
        },
      },
    })

    return {
      data: data.data?.map(transformPoolData) ?? [],
      error: false,
    }
  } catch {
    return {
      error: true,
      data: [],
    }
  }
}

const transformPoolData = (
  item: operations['getCachedPoolsInfinityByChainNameListTop']['responses']['200']['content']['application/json'][number],
): PoolDataForView => {
  return {
    feeTier: item.feeTier ?? 0,
    address: item.id,
    volumeUSD: Number.parseFloat(item.volumeUSD24h),
    volumeUSDWeek: Number.parseFloat(item.volumeUSD7d),
    token0: { ...item.token0, address: item.token0.id, derivedETH: 0 },
    token1: { ...item.token1, address: item.token1.id, derivedETH: 0 },
    feeUSD: Number.parseFloat(item.totalFeeUSD),
    liquidity: Number.parseFloat(item.liquidity ?? '0'),
    sqrtPrice: Number.parseFloat(item.sqrtPrice ?? '0'),
    tick: item.tick ?? 0,
    tvlUSD: Number.parseFloat(item.tvlUSD),
    token0Price: Number.parseFloat(item.token0Price),
    token1Price: Number.parseFloat(item.token1Price),
    tvlToken0: Number.parseFloat(item.tvlToken0),
    tvlToken1: Number.parseFloat(item.tvlToken1),
    volumeUSDChange: 0,
    tvlUSDChange: 0,
    protocolFee: Number.parseInt(item.protocolFee ?? '0'),
  }
}
