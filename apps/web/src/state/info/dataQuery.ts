import { STABLE_SUPPORTED_CHAIN_IDS } from '@pancakeswap/stable-swap-sdk'
import dayjs from 'dayjs'
import { getLpFeesAndApr } from 'utils/getLpFeesAndApr'
import { getPercentChange } from 'utils/infoDataHelpers'
import { explorerApiClient } from './api/client'
import { operations } from './api/schema'
import { TransactionType } from './types'

export interface V2TokenDataQuery {
  signal?: AbortSignal
  chainName?: 'bsc' | 'ethereum' | 'arbitrum'
  chainId?: number
  address?: string
  type: 'stableSwap' | 'swap'
}

export async function fetchV2TokenData({ chainId, signal, chainName, address, type }: V2TokenDataQuery) {
  if (!chainName || !address) {
    throw new Error('No chain name')
  }
  if (type === 'stableSwap' && STABLE_SUPPORTED_CHAIN_IDS.includes(chainId as number)) {
    return explorerApiClient
      .GET('/cached/tokens/stable/{chainName}/{address}', {
        signal,
        params: {
          path: {
            chainName:
              chainName as operations['getCachedTokensStableByChainNameByAddress']['parameters']['path']['chainName'],
            address,
          },
        },
      })
      .then((res) => res.data)
      .then((data) => transformToken(data))
  }

  return explorerApiClient
    .GET('/cached/tokens/v2/{chainName}/{address}', {
      signal,
      params: {
        path: {
          chainName,
          address,
        },
      },
    })
    .then((res) => res.data)
    .then((data) => transformToken(data))
}

export async function fetchV2PoolsForToken({ signal, chainName, chainId, address, type }: V2TokenDataQuery) {
  if (!chainName || !address) {
    throw new Error('No chain name')
  }
  if (type === 'stableSwap' && STABLE_SUPPORTED_CHAIN_IDS.includes(chainId as number)) {
    return explorerApiClient
      .GET('/cached/pools/stable/{chainName}/list/top', {
        signal,
        params: {
          query: {
            token: address,
          },
          path: {
            chainName:
              chainName as operations['getCachedPoolsStableByChainNameListTop']['parameters']['path']['chainName'],
          },
        },
      })
      .then((res) => res.data)
      .then((data) => transformPoolsForToken(data))
  }
  return explorerApiClient
    .GET('/cached/pools/v2/{chainName}/list/top', {
      params: {
        query: {
          token: address,
        },
        path: {
          chainName,
        },
      },
    })
    .then((res) => res.data)
    .then((data) => transformPoolsForToken(data))
}

export async function fetchV2ChartsTvlData({ signal, chainName, address, type }: V2TokenDataQuery) {
  if (!chainName) {
    throw new Error('No chain name')
  }
  return explorerApiClient
    .GET('/cached/tokens/chart/{chainName}/{address}/{protocol}/tvl', {
      signal,
      params: {
        path: {
          address: address as string,
          chainName,
          protocol: type === 'stableSwap' ? 'stable' : 'v2',
        },
        query: {
          period: '1Y',
        },
      },
    })
    .then((res) =>
      res?.data?.map((d) => ({
        date: dayjs(d.bucket as string).unix(),
        liquidityUSD: d.tvlUSD ? +d.tvlUSD : 0,
      })),
    )
}

export async function fetchV2ChartsVolumeData({ signal, chainName, address, type }: V2TokenDataQuery) {
  if (!chainName) {
    throw new Error('No chain name')
  }
  return explorerApiClient
    .GET('/cached/tokens/chart/{chainName}/{address}/{protocol}/volume', {
      signal,
      params: {
        path: {
          address: address as string,
          chainName,
          protocol: type === 'stableSwap' ? 'stable' : 'v2',
        },
        query: {
          period: '1Y',
        },
      },
    })
    .then((res) =>
      res.data?.map((d) => ({
        date: dayjs(d.bucket as string).unix(),
        volumeUSD: d.volumeUSD ? +d.volumeUSD : 0,
      })),
    )
}

export async function fetchV2TransactionData({ signal, chainName, chainId, address, type }: V2TokenDataQuery) {
  if (!chainName) {
    throw new Error('No chain name')
  }
  if (type === 'stableSwap' && STABLE_SUPPORTED_CHAIN_IDS.includes(chainId as number)) {
    return explorerApiClient
      .GET('/cached/tx/stable/{chainName}/recent', {
        signal,
        params: {
          path: {
            chainName: chainName as operations['getCachedTxStableByChainNameRecent']['parameters']['path']['chainName'],
          },
          query: {
            token: address,
          },
        },
      })
      .then((res) => res.data)
      .then((data) => transformTransactionData(data))
  }

  return explorerApiClient
    .GET('/cached/tx/v2/{chainName}/recent', {
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
    .then((res) => res.data)
    .then((data) => transformTransactionData(data))
}

export function transformToken(d: any) {
  if (!d) {
    throw new Error('No data')
  }
  return {
    exists: true,
    name: d.name,
    symbol: d.symbol,
    address: d.id,
    decimals: d.decimals,
    volumeUSD: d.volumeUSD24h ? +d.volumeUSD24h : 0,
    volumeUSDChange: 0,
    volumeUSDWeek: d.volumeUSD7d ? +d.volumeUSD7d : 0,
    txCount: d.txCount24h,
    liquidityToken: +d.tvl,
    liquidityUSD: +d.tvlUSD,
    tvlUSD: +d.tvlUSD,
    liquidityUSDChange: getPercentChange(+d.tvlUSD, +d.tvlUSD24h),
    tvlUSDChange: getPercentChange(+d.tvlUSD, +d.tvlUSD24h),
    priceUSD: +d.priceUSD,
    priceUSDChange: getPercentChange(+d.priceUSD, +d.priceUSD24h),
    priceUSDChangeWeek: getPercentChange(+d.priceUSD, +d.priceUSD7d),
  }
}

export function transformPoolsForToken(data_: any) {
  if (!data_) {
    throw new Error('No data')
  }

  return data_.map((d) => {
    const { totalFees24h, totalFees7d, lpFees24h, lpFees7d, lpApr7d } = getLpFeesAndApr(
      +d.volumeUSD24h,
      +d.volumeUSD7d,
      +d.tvlUSD,
    )

    return {
      address: d.id,
      timestamp: dayjs(d.createdAtTimestamp as string).unix(),
      token0: {
        address: d.token0.id,
        symbol: d.token0.symbol,
        name: d.token0.name,
      },
      token1: {
        address: d.token1.id,
        symbol: d.token1.symbol,
        name: d.token1.name,
      },
      volumeUSD: +d.volumeUSD24h,
      volumeUSDChange: 0,
      volumeUSDWeek: +d.volumeUSD7d,
      liquidityUSD: +d.tvlUSD,
      liquidityUSDChange: getPercentChange(+d.tvlUSD, d.tvlUSD24h ? +d.tvlUSD24h : 0),
      totalFees24h,
      totalFees7d,
      lpFees24h,
      lpFees7d,
      lpApr7d,
      liquidityToken0: +d.tvlToken0,
      liquidityToken1: +d.tvlToken1,
      token0Price: +d.token0Price,
      token1Price: +d.token1Price,
      volumeUSDChangeWeek: 0,
    }
  })
}

export function transformTransactionData(data_: any) {
  return data_?.map((d) => {
    return {
      hash: d.transactionHash,
      timestamp: dayjs(d.timestamp as string)
        .unix()
        .toString(),
      sender: d.origin ?? '0x',
      type: d.type === 'swap' ? TransactionType.SWAP : d.type === 'mint' ? TransactionType.MINT : TransactionType.BURN,
      token0Symbol: d.token0.symbol,
      token1Symbol: d.token1.symbol,
      token0Address: d.token0.id,
      token1Address: d.token1.id,
      amountUSD: +d.amountUSD,
      amountToken0: +d.amount0,
      amountToken1: +d.amount1,
    }
  })
}
