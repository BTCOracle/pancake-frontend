import { FeeAmount, Tick, TICK_SPACINGS } from '@pancakeswap/v3-sdk'
import { Address, decodeFunctionResult, encodeFunctionData, Hex } from 'viem'
import { BigintIsh } from '@pancakeswap/swap-sdk-core'
import { ChainId } from '@pancakeswap/chains'
import { multicallByGasLimit } from '@pancakeswap/multicall'
import { InfinityClPool, OnChainProvider, PoolType, V3Pool } from '../v3-router/types'
import { TICK_QUERY_HELPER_ADDRESSES } from '../constants'
import { queryDataAbi } from '../abis/QueryData'
import { getPoolCurrency0 } from '../v3-router/utils'
import { getTickQueryFetchConfig } from '../infinity-router/constants/v3PoolFetchGasLimit'

// mask to extract liquidityNet (lower 128 bits) from the 256-bit packed tick data
const LIQUIDITY_NET_MASK = (1n << 128n) - 1n

/**
 * Decide `len` parameter for compact tick queries.
 *
 * @param priceRangeBps Desired price coverage in basis points (default: 500 bps = ±5%)
 * @param tickSpacing The pool’s tickSpacing
 * @param maxLen Hard cap to avoid blowing gas (default: 1000)
 * @returns len for queryCompactTicks
 */
export function decideCompactTickLen(priceRangeBps: number, tickSpacing: number, maxLen: bigint = 1n): bigint {
  // how many ticks for desired price coverage
  const targetTicks = Math.log(1 + priceRangeBps / 10000) / Math.log(1.0001)

  // each bitmap word covers 256 ticks
  const slotsNeeded = Math.ceil(targetTicks / tickSpacing / 256)

  // len counts ticks in both left + right directions
  const len = BigInt(slotsNeeded * 2 * 256)

  return len > maxLen ? maxLen : len
}

export function decodeTicksFromBytes(data: Hex) {
  if (!data || data === '0x') {
    return [] as Tick[]
  }
  const tickMap = new Map<number, Tick>()
  const hexString = data.slice(2)
  const chunkSize = 64
  for (let offset = 0; offset + chunkSize <= hexString.length; offset += chunkSize) {
    const chunk = `0x${hexString.slice(offset, offset + chunkSize)}`
    const raw = BigInt(chunk)
    const tickIndex = Number(BigInt.asIntN(128, raw >> 128n))
    const liquidityNet = BigInt.asIntN(128, raw & LIQUIDITY_NET_MASK)
    const liquidityGross = liquidityNet < 0n ? -liquidityNet : liquidityNet
    tickMap.set(
      tickIndex,
      new Tick({
        index: tickIndex,
        liquidityNet,
        liquidityGross,
      }),
    )
  }
  return Array.from(tickMap.values()).sort((a, b) => a.index - b.index)
}

type WithMulticallGasLimit = {
  gasLimit?: BigintIsh
}

type WithClientProvider = {
  clientProvider?: OnChainProvider
}

export function getCompactTickQueryCalldata(pool: V3Pool | InfinityClPool, len: bigint) {
  switch (pool.type) {
    case PoolType.V3:
      return encodeFunctionData({
        abi: queryDataAbi,
        args: [pool.address, len],
        functionName: 'queryUniv3TicksSuperCompact',
      })
    case PoolType.InfinityCL:
      return encodeFunctionData({
        abi: queryDataAbi,
        args: [pool.id, len],
        functionName: 'queryPancakeInfinityTicksSuperCompact',
      })
    default:
      throw new Error('Unsupported pool type for tick query')
  }
}

export function decodeCompactTickResult(result: Hex, pool: V3Pool | InfinityClPool) {
  const rawTicks = decodeFunctionResult({
    abi: queryDataAbi,
    functionName:
      pool.type === PoolType.InfinityCL ? 'queryPancakeInfinityTicksSuperCompact' : 'queryUniv3TicksSuperCompact',
    data: result as Hex,
  }) as Hex
  return decodeTicksFromBytes(rawTicks)
}

export function getTickSpacing(pool: V3Pool | InfinityClPool): number {
  if (pool.type === PoolType.V3) {
    return TICK_SPACINGS[Number(pool.fee) as FeeAmount]
  }
  return pool.tickSpacing
}

export async function fetchCompactPoolsTick({
  pools,
  clientProvider,
  gasLimit,
}: {
  pools: (V3Pool | InfinityClPool)[]
} & WithClientProvider &
  WithMulticallGasLimit): Promise<Record<string, Tick[]>> {
  if (!pools.length) return {}

  const currency = getPoolCurrency0(pools[0])
  const { chainId } = currency
  const client = clientProvider?.({ chainId })
  if (!client) throw new Error('No valid public client found.')

  const queryHelperAddress = TICK_QUERY_HELPER_ADDRESSES[chainId as ChainId]
  if (!queryHelperAddress) throw new Error('No tick query helper available.')

  const { retryGasMultiplier } = getTickQueryFetchConfig()

  // const len = decideCompactTickLen(1000, getTickSpacing(pools[0]))
  const gasLimitPerCall = 10_000_000n

  const multiCallArgs = pools.map((pool) => ({
    target: queryHelperAddress as Address,
    callData: getCompactTickQueryCalldata(pool, decideCompactTickLen(1000, getTickSpacing(pool))),
    gasLimit: gasLimitPerCall,
  }))

  const res = await multicallByGasLimit(multiCallArgs, {
    chainId,
    client,
    gasLimit,
    retryFailedCallsWithGreaterLimit: { gasLimitMultiplier: retryGasMultiplier },
  })

  const ticksByPool: Record<string, Tick[]> = {}

  for (const [i, result] of res.results.entries()) {
    if (!result.success || !result.result) continue
    const decoded = decodeCompactTickResult(result.result as Hex, pools[i])
    if (decoded.length) {
      if (pools[i].type === PoolType.InfinityCL) {
        ticksByPool[pools[i].id.toLocaleLowerCase()] = decoded
      } else if (pools[i].type === PoolType.V3) {
        ticksByPool[pools[i].address.toLowerCase()] = decoded
      }
    }
  }

  return ticksByPool
}

export function formatGas(gasUnits: bigint): string {
  if (gasUnits > 1_000_000n) {
    return `${(Number(gasUnits) / 1_000_000).toFixed(2)}M`
  }
  if (gasUnits > 1_000n) {
    return `${(Number(gasUnits) / 1_000).toFixed(2)}K`
  }
  return gasUnits.toString()
}
