import { ChainId, getChainIdByChainName } from '@pancakeswap/chains'
import {
  V2TokenDataQuery,
  fetchV2ChartsTvlData,
  fetchV2ChartsVolumeData,
  fetchV2PoolsForToken,
  fetchV2TokenData,
  fetchV2TransactionData,
} from 'state/info/dataQuery'
import { fetchPoolsForToken } from 'state/info/queries/tokens/fetchPoolsForToken'
import { fetchTokenChartData } from 'state/info/queries/tokens/fetchTokenChartData'
import { fetchedTokenData } from 'state/info/queries/tokens/fetchTokenData'
import { fetchTokenTransactions } from 'views/V3Info/data/token/transactions'

type SupportedType = 'swap' | 'v3' | 'stableSwap'

const chainNameForQuery = (chain: string) => {
  switch (chain) {
    case 'eth':
      return 'ethereum'
    case 'polygon-zkevm':
      return 'polygon-zkevm'
    case 'zksync':
      return 'zksync'
    case 'arb':
      return 'arbitrum'
    case 'linea':
      return 'linea'
    case 'base':
      return 'base'
    case 'opbnb':
      return 'opbnb'
    default:
      return 'bsc'
  }
}

const resultsOrUdef = <T>(result: PromiseSettledResult<T>) => (result.status === 'fulfilled' ? result.value : undefined)

export const queryTokenInfo = async (chain?: string, address?: string, type?: SupportedType) => {
  if (!chain || !address || !type) {
    return null
  }

  const queryChainName = chainNameForQuery(chain)!

  switch (type) {
    case 'stableSwap':
    case 'swap': {
      const chainId = getChainIdByChainName(chain) || ChainId.BSC
      const query: V2TokenDataQuery = {
        chainName: queryChainName as 'bsc' | 'ethereum' | 'arbitrum',
        chainId: parseInt(chainId as any as string),
        address,
        type,
      }
      const result = await Promise.allSettled([
        fetchV2TokenData(query),
        fetchV2PoolsForToken(query),
        fetchV2TransactionData(query),
        fetchV2ChartsVolumeData(query),
        fetchV2ChartsTvlData(query),
      ])

      const [token, pool, transactions, chartVolume, chartTvl] = result

      return {
        token: resultsOrUdef(token),
        pool: resultsOrUdef(pool),
        transactions: resultsOrUdef(transactions),
        chartVolume: resultsOrUdef(chartVolume),
        chartTvl: resultsOrUdef(chartTvl),
      }
    }

    case 'v3': {
      const result = await Promise.allSettled([
        fetchPoolsForToken(address, queryChainName),
        fetchedTokenData(queryChainName, address),
        fetchTokenTransactions(address, queryChainName),
        fetchTokenChartData('v3', queryChainName, address),
      ])
      const poolsData = resultsOrUdef(result[0])
      const token = resultsOrUdef(result[1])
      const transactions = resultsOrUdef(result[2])
      const charts = resultsOrUdef(result[3])

      return {
        token: token?.data,
        pool: poolsData?.data,
        transactions: transactions?.data,
        charts: charts?.data,
      }
    }
    default: {
      return null
    }
  }
}
