import { BinPool, Bytes32, Pool as CLPool, DYNAMIC_FEE_FLAG, PoolType } from '@pancakeswap/infinity-sdk'
import { BigintIsh, Currency, sortCurrencies, Token } from '@pancakeswap/swap-sdk-core'
import { BinPoolInfo } from 'state/farmsV4/state/accountPositions/fetcher/infinity/getPoolInfo'
import { LruMap } from 'utils/lru'
import { Address } from 'viem'

export const clPoolCache = new LruMap<CLPool>(8192)

export const binPoolCache = new LruMap<BinPool>(4096)

export const getClPoolWithCache = ({
  chainId,
  poolId,
  tokenA,
  tokenB,
  fee,
  lpFee,
  sqrtRatioX96,
  liquidity,
  tick,
  protocolFee,
  poolType,
  tickSpacing,
}: {
  chainId: number
  poolId: Address | Bytes32
  tokenA: Token
  tokenB: Token
  fee: number
  lpFee: number
  sqrtRatioX96: BigintIsh
  liquidity: BigintIsh
  tick: number
  protocolFee: number
  poolType: PoolType
  tickSpacing: number
}): CLPool => {
  const cacheKey = `${chainId}:${poolId}`
  const cachedPool = clPoolCache.get(cacheKey)
  if (cachedPool) {
    cachedPool.sqrtRatioX96 = BigInt(sqrtRatioX96)
    cachedPool.liquidity = BigInt(liquidity)
    cachedPool.tickCurrent = tick
    clPoolCache.set(cacheKey, cachedPool)
    return cachedPool
  }

  const pool = new CLPool({
    poolType,
    tokenA,
    tokenB,
    fee: lpFee,
    protocolFee,
    dynamic: fee === DYNAMIC_FEE_FLAG,
    sqrtRatioX96,
    liquidity,
    tickCurrent: tick,
    tickSpacing,
  })
  pool.feeProtocol = protocolFee
  clPoolCache.set(cacheKey, pool)
  return pool
}

export const getBinPoolWithCache = ({
  chainId,
  poolId,
  currencyA,
  currencyB,
  rawPoolInfo,
}: {
  chainId: number
  poolId: Address | Bytes32
  currencyA: Currency
  currencyB: Currency
  rawPoolInfo: BinPoolInfo
}): BinPool => {
  const cacheKey = `${chainId}:${poolId}`
  const cachedPool = binPoolCache.get(cacheKey)
  if (cachedPool) {
    cachedPool.activeId = rawPoolInfo.activeId
    binPoolCache.set(cacheKey, cachedPool)
    return cachedPool
  }

  const [currency0, currency1] = sortCurrencies([currencyA, currencyB])

  const pool = {
    poolType: rawPoolInfo.poolType,
    token0: currency0,
    token1: currency1,
    fee: rawPoolInfo.lpFee,
    protocolFee: rawPoolInfo.protocolFee,
    dynamic: rawPoolInfo.fee === DYNAMIC_FEE_FLAG,
    activeId: rawPoolInfo.activeId,
    binStep: rawPoolInfo.parameters.binStep,
    hooksRegistration: rawPoolInfo.parameters.hooksRegistration,
  } satisfies BinPool

  binPoolCache.set(cacheKey, pool)

  return pool
}
