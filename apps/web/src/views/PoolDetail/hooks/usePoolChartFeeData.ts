import { Protocol } from '@pancakeswap/farms'
import { useQuery } from '@tanstack/react-query'
import { QUERY_SETTINGS_IMMUTABLE, QUERY_SETTINGS_WITHOUT_INTERVAL_REFETCH } from 'config/constants'
import { INFINITY_PROTOCOLS } from 'config/constants/protocols'
import dayjs from 'dayjs'
import { ChartSupportedProtocol } from 'hooks/v3/types'
import { explorerApiClient } from 'state/info/api/client'
import { useExplorerChainNameByQuery } from 'state/info/api/hooks'
import { components } from 'state/info/api/schema'

const fetchChartFeeData = async (
  address: string,
  chainName: components['schemas']['ChainName'],
  protocol: ChartSupportedProtocol,
  signal?: AbortSignal,
) => {
  try {
    const resp = await explorerApiClient.GET('/cached/pools/chart/{protocol}/{chainName}/{address}/fees', {
      signal,
      params: {
        path: {
          protocol,
          address,
          chainName,
        },
      },
    })
    if (!resp.data) {
      return []
    }

    return resp.data.map((d) => {
      return {
        time: d.bucket as string,
        dateTime: dayjs(d.bucket as string).format('YYYY-MM-DD HH:mm:ss'),
        value: d.feeUSD ? parseFloat(d.feeUSD) ?? 0 : 0,
      }
    })
  } catch (error) {
    console.error('debug fetchChartFeeData error', error)
    return []
  }
}

export const usePoolChartFeeData = (address?: string, protocol?: Protocol) => {
  const chainName = useExplorerChainNameByQuery()

  return useQuery({
    queryKey: ['poolChartFeeData', chainName, address],
    queryFn: () => {
      if (!protocol || ![...INFINITY_PROTOCOLS, Protocol.V3].includes(protocol)) {
        return undefined
      }
      return fetchChartFeeData(address!, chainName!, protocol as ChartSupportedProtocol)
    },
    enabled: Boolean(address && chainName && protocol),
    ...QUERY_SETTINGS_IMMUTABLE,
    ...QUERY_SETTINGS_WITHOUT_INTERVAL_REFETCH,
  })
}
