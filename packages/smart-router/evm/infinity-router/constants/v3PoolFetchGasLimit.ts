import { ChainId } from '@pancakeswap/chains'

type V3PoolFetchConfig = {
  gasLimit: bigint
  retryGasMultiplier: number
}

const DEFAULT_FETCH_CONFIG: V3PoolFetchConfig = {
  gasLimit: 3_000_000n,
  retryGasMultiplier: 2,
}

const INFI_BIN_POOL_FETCH_CONFIG: V3PoolFetchConfig = {
  gasLimit: 300_000n,
  retryGasMultiplier: 2,
}

const TICK_QUERY_FETCH_CONFIG: V3PoolFetchConfig = {
  gasLimit: 10_000_000n,
  retryGasMultiplier: 2,
}

const TICK_LENS_FETCH_CONFIG: V3PoolFetchConfig = {
  gasLimit: 500_000n,
  retryGasMultiplier: 2,
}

const V3_POOL_FETCH_CONFIG: { [key in ChainId]?: V3PoolFetchConfig } = {}
const INFI_POOL_FETCH_CONFIG: { [key in ChainId]?: V3PoolFetchConfig } = {}

export function getV3PoolFetchConfig(chainId: ChainId) {
  return V3_POOL_FETCH_CONFIG[chainId] || DEFAULT_FETCH_CONFIG
}

export function getInfinityPoolFetchConfig(chainId: ChainId) {
  return INFI_POOL_FETCH_CONFIG[chainId] || INFI_BIN_POOL_FETCH_CONFIG
}

export function getTickQueryFetchConfig() {
  return TICK_QUERY_FETCH_CONFIG
}

export function getTickLensFetchConfig() {
  return TICK_LENS_FETCH_CONFIG
}
