import { useQuery } from '@tanstack/react-query'
import { QUERY_SETTINGS_IMMUTABLE } from 'config/constants'
import { useMemo } from 'react'
import { solExplorerApiClient } from 'state/info/api/client'

interface SolanaChartPoint {
  time: string
  value: number
}

interface SolanaChartData {
  line: SolanaChartPoint[]
}

const fetchSolanaChartData = async (
  poolId: string,
  type: 'tvl' | 'volume' | 'liquidity',
  signal?: AbortSignal,
): Promise<SolanaChartData> => {
  try {
    const response = await solExplorerApiClient.GET('/cached/v1/pools/line/liquidity', {
      signal,
      params: {
        query: {
          poolId,
        },
      },
    })

    if (!response.data?.data) {
      return { line: [] }
    }

    return {
      line: response.data.data.map((d) => ({
        time: d.timestamp.toString(),
        value: d.liquidity,
      })),
    }
  } catch (error) {
    console.error(`Error fetching Solana ${type} chart data:`, error)
    return { line: [] }
  }
}

export const useSolanaPoolChartVolumeData = (poolId: string | undefined) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['solanaPoolChartVolume', poolId],
    queryFn: () => {
      if (!poolId) {
        return { line: [] }
      }
      return fetchSolanaChartData(poolId, 'volume')
    },
    enabled: !!poolId,
    retry: 3,
    retryDelay: 1000,
    ...QUERY_SETTINGS_IMMUTABLE,
  })

  const formattedData = useMemo(() => {
    return data?.line ?? []
  }, [data])

  return {
    data: formattedData,
    isLoading,
    error,
  }
}
