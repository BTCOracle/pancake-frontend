import { explorerApiClient } from 'state/info/api/client'
import { components } from 'state/info/api/schema'
import { PoolDataForView } from 'state/info/types'
import { transformPoolData } from 'state/info/utils'

/**
 * Fetch top addresses by volume
 */
export async function fetchPoolsForToken(
  address: string,
  chainName: components['schemas']['ChainName'],
  signal?: AbortSignal,
): Promise<{ error: boolean; data: PoolDataForView[] }> {
  try {
    const data = await explorerApiClient.GET('/cached/pools/v3/{chainName}/list/top', {
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
