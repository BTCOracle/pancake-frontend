import { useQuery } from '@tanstack/react-query'
import { QUERY_SETTINGS_IMMUTABLE } from 'config/constants'
import { useExplorerChainNameByQuery } from 'state/info/api/hooks'
import type { components } from 'state/info/api/schema'
import { multiChainId } from 'state/info/constant'
import { useChainNameByQuery } from 'state/info/hooks'
import { fetchTokenChartData } from 'state/info/queries/tokens/fetchTokenChartData'
import { TokenChartEntry } from 'state/info/types'

export const useTokenChartData = (address: string): TokenChartEntry[] | undefined => {
  const chainName = useChainNameByQuery()
  const chainId = multiChainId[chainName]
  const explorerChainName = useExplorerChainNameByQuery()

  const { data } = useQuery({
    queryKey: [`infinity/info/token/tokenChartData/${chainId}/${address}`, chainId],
    queryFn: ({ signal }) => fetchInfinityTokenChartData(explorerChainName!, address, signal),
    enabled: Boolean(explorerChainName && address && address !== 'undefined'),
    ...QUERY_SETTINGS_IMMUTABLE,
  })
  return data?.data
}

export async function fetchInfinityTokenChartData(
  chainName: components['schemas']['ChainName'],
  address: string,
  signal: AbortSignal,
) {
  const [infinityCl, infinityBin] = await Promise.all([
    fetchTokenChartData('infinityCl', chainName, address, signal),
    fetchTokenChartData('infinityBin', chainName, address, signal),
  ])
  const { data: infinityClData, error: infinityClError } = infinityCl
  const { data: infinityBinData, error: infinityBinError } = infinityBin
  return {
    data: [...(infinityClData ?? []), ...(infinityBinData ?? [])],
    error: infinityClError || infinityBinError,
  }
}
