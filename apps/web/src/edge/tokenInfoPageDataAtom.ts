/* eslint-disable no-nested-ternary */

import { ChainId, getChainIdByChainName } from '@pancakeswap/chains'
import { getCurrencyAddress } from '@pancakeswap/swap-sdk-core'
import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import isEqual from 'lodash/isEqual'
import { atomWithLoadable } from 'quoter/atom/atomWithLoadable'
import {
  fetchV2ChartsTvlData,
  fetchV2ChartsVolumeData,
  fetchV2PoolsForToken,
  fetchV2TokenData,
  fetchV2TransactionData,
  V2TokenDataQuery,
} from 'state/info/dataQuery'
import { fetchPoolsForToken } from 'state/info/queries/tokens/fetchPoolsForToken'
import { fetchTokenChartData } from 'state/info/queries/tokens/fetchTokenChartData'
import { fetchedTokenData } from 'state/info/queries/tokens/fetchTokenData'
import { PoolDataForView } from 'state/info/types'
import { mockCurrency } from 'utils/mockCurrency'
import { fetchTokenTransactions } from 'views/V3Info/data/token/transactions'

interface TokenInfoParams {
  address: string
  chain: string
  type: 'swap' | 'stableSwap' | 'v3'
}

const buildV2Query = (params: TokenInfoParams): V2TokenDataQuery => {
  const chainId = getChainIdByChainName(params.chain) || ChainId.BSC
  return {
    chainName: chainNameForQuery(params.chain) as any,
    chainId: parseInt(chainId as any as string),
    address: params.address,
    type: params.type as 'swap' | 'stableSwap',
  }
}

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

const basicTokenInfoAtom = atomFamily((params: TokenInfoParams) => {
  return atomWithLoadable(async () => {
    const chainId = getChainIdByChainName(params.chain)
    if (!chainId) {
      return undefined
    }
    const currency = await mockCurrency(params.address as `0x${string}`, Number(chainId))
    return {
      name: currency?.symbol,
      symbol: currency?.symbol,
      decimals: currency?.decimals,
      address: getCurrencyAddress(currency),
    }
  })
})
const v2TokenDataAtom = atomFamily((params: TokenInfoParams) => {
  return atomWithLoadable(async () => {
    if (params.type !== 'swap' && params.type !== 'stableSwap') {
      return undefined
    }
    const query = buildV2Query(params)
    const tokenInfo = await fetchV2TokenData(query)
    return tokenInfo
  })
}, isEqual)

const v2PoolsForTokenAtom = atomFamily((params: TokenInfoParams) => {
  return atomWithLoadable(async () => {
    if (params.type !== 'swap' && params.type !== 'stableSwap') {
      return undefined
    }
    const query = buildV2Query(params)
    return fetchV2PoolsForToken(query)
  })
}, isEqual)

const v2TransactionDataAtom = atomFamily((params: TokenInfoParams) => {
  return atomWithLoadable(async () => {
    if (params.type !== 'swap' && params.type !== 'stableSwap') {
      return undefined
    }
    const query = buildV2Query(params)
    return fetchV2TransactionData(query)
  })
}, isEqual)

const v2ChartVolumeDataAtom = atomFamily((params: TokenInfoParams) => {
  return atomWithLoadable(async () => {
    if (params.type !== 'swap' && params.type !== 'stableSwap') {
      return undefined
    }
    const query = buildV2Query(params)
    return fetchV2ChartsVolumeData(query)
  })
}, isEqual)

const v2ChartTvlDataAtom = atomFamily((params: TokenInfoParams) => {
  return atomWithLoadable(async () => {
    if (params.type !== 'swap' && params.type !== 'stableSwap') {
      return undefined
    }
    const query = buildV2Query(params)
    return fetchV2ChartsTvlData(query)
  })
}, isEqual)

const v3PoolsForTokenAtom = atomFamily((params: TokenInfoParams) => {
  return atomWithLoadable(async () => {
    if (params.type !== 'v3') {
      return undefined
    }
    const chainName = chainNameForQuery(params.chain)
    return fetchPoolsForToken(params.address, chainName).then((res) => res.data)
  })
}, isEqual)

const v3TokenDataAtom = atomFamily((params: TokenInfoParams) => {
  return atomWithLoadable(async () => {
    if (params.type !== 'v3') {
      return undefined
    }
    const chainName = chainNameForQuery(params.chain)
    const res = await fetchedTokenData(chainName as any, params.address)

    return res.data
  })
}, isEqual)

const v3TransactionsAtom = atomFamily((params: TokenInfoParams) => {
  return atomWithLoadable(async () => {
    if (params.type !== 'v3') {
      return undefined
    }
    const chainName = chainNameForQuery(params.chain)
    const res = await fetchTokenTransactions(params.address, chainName as any)
    return res.data
  })
}, isEqual)

const v3ChartDataAtom = atomFamily((params: TokenInfoParams) => {
  return atomWithLoadable(async () => {
    if (params.type !== 'v3') {
      return undefined
    }
    const chainName = chainNameForQuery(params.chain)
    const res = await fetchTokenChartData('v3', chainName as any, params.address)
    return res.data
  })
}, isEqual)

export const tokenInfoV2PageDataAtom = atomFamily((params: TokenInfoParams) => {
  return atom((get) => {
    const token = get(v2TokenDataAtom(params))
    const pool = get(v2PoolsForTokenAtom(params)).unwrapOr(undefined)
    const transactions = get(v2TransactionDataAtom(params)).unwrapOr(undefined)
    const chartVolume = get(v2ChartVolumeDataAtom(params)).unwrapOr(undefined)
    const chartTvl = get(v2ChartTvlDataAtom(params)).unwrapOr(undefined)
    const tokenData = token.unwrapOr(undefined)
    const basicTokenInfo = get(basicTokenInfoAtom(params)).unwrapOr(undefined) as typeof tokenData
    return {
      token: token.isJust() ? tokenData : basicTokenInfo,
      pool,
      transactions,
      chartVolume,
      chartTvl,
      charts: undefined,
      loading: !token.isJust(),
    }
  })
}, isEqual)

export const tokenInfoV3PageDataAtom = atomFamily((params: TokenInfoParams) => {
  return atom((get) => {
    const token = get(v3TokenDataAtom(params))
    const pool = get(v3PoolsForTokenAtom(params)).unwrapOr(undefined) as PoolDataForView[] | undefined
    const transactions = get(v3TransactionsAtom(params)).unwrapOr(undefined)
    const charts = get(v3ChartDataAtom(params)).unwrapOr(undefined)
    const tokenData = token.unwrapOr(undefined)
    const basicTokenInfo = get(basicTokenInfoAtom(params)).unwrapOr(undefined) as typeof tokenData | undefined
    return {
      token: token.isJust() ? token.unwrap() : basicTokenInfo,
      pool,
      transactions,
      charts,
      loading: !token.isJust(),
    }
  })
}, isEqual)
