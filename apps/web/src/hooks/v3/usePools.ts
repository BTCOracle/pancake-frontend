import { BigintIsh, Currency, Token } from '@pancakeswap/swap-sdk-core'
import { DEPLOYER_ADDRESSES, FeeAmount, Pool, computePoolAddress } from '@pancakeswap/v3-sdk'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { v3PoolStateABI } from 'config/abi/v3PoolState'
import { QUERY_SETTINGS_IMMUTABLE, QUERY_SETTINGS_WITHOUT_INTERVAL_REFETCH } from 'config/constants'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useMemo } from 'react'
import { useMultipleContractSingleDataWagmi } from 'state/multicall/hooks'
import { publicClient } from 'utils/viem'
import { Address } from 'viem'
import { PoolState } from './types'

// Classes are expensive to instantiate, so this caches the recently instantiated pools.
// This avoids re-instantiating pools as the other pools in the same request are loaded.
export class PoolCache {
  // Evict after 128 entries. Empirically, a swap uses 64 entries.
  private static MAX_ENTRIES = 128

  // These are FIFOs, using unshift/pop. This makes recent entries faster to find.
  private static pools: Pool[] = []

  private static addresses: { key: string; address: string }[] = []

  static getPoolAddress(deployerAddress: Address, tokenA: Token, tokenB: Token, fee: FeeAmount): Address {
    if (this.addresses.length > this.MAX_ENTRIES) {
      this.addresses = this.addresses.slice(0, this.MAX_ENTRIES / 2)
    }

    const { address: addressA } = tokenA
    const { address: addressB } = tokenB
    const key = `${deployerAddress}:${addressA}:${addressB}:${fee.toString()}`

    const found = this.addresses.find((address) => address.key === key)
    if (found) return found.address as Address

    const address = {
      key,
      address: computePoolAddress({
        deployerAddress,
        tokenA,
        tokenB,
        fee,
      }),
    }

    this.addresses.unshift(address)
    return address.address
  }

  static getPool(
    tokenA: Token,
    tokenB: Token,
    fee: FeeAmount,
    sqrtPriceX96: BigintIsh,
    liquidity: BigintIsh,
    tick: number,
    feeProtocol?: number,
  ): Pool {
    if (this.pools.length > this.MAX_ENTRIES) {
      this.pools = this.pools.slice(0, this.MAX_ENTRIES / 2)
    }

    const found = this.pools.find(
      (pool) =>
        pool.token0 === tokenA &&
        pool.token1 === tokenB &&
        pool.fee === fee &&
        pool.sqrtRatioX96 === sqrtPriceX96 &&
        pool.liquidity === liquidity &&
        pool.tickCurrent === tick,
    )
    if (found) return found

    const pool = new Pool(tokenA, tokenB, fee, sqrtPriceX96, liquidity, tick)
    pool.feeProtocol = feeProtocol
    this.pools.unshift(pool)
    return pool
  }
}

type Slot0Result = { result: [bigint, number, number, number, number, number, boolean] }

type LiquidityResult = { result: bigint | undefined }

export function getPoolStateAndPool(
  tokens: [Token, Token, FeeAmount] | undefined,
  slot0Result: Slot0Result | undefined,
  liquidityResult: LiquidityResult | undefined,
  isLoading: boolean,
): [PoolState, Pool | null] {
  if (isLoading) return [PoolState.LOADING, null]
  if (!tokens || !slot0Result || !liquidityResult) return [PoolState.INVALID, null]

  const [token0, token1, fee] = tokens
  const { result: slot0 } = slot0Result

  const liquidity = liquidityResult.result

  if (!slot0 || typeof liquidity === 'undefined') return [PoolState.NOT_EXISTS, null]

  const [sqrtPriceX96, tick, , , , feeProtocol] = slot0

  if (!sqrtPriceX96 || sqrtPriceX96 === 0n) return [PoolState.NOT_EXISTS, null]

  try {
    const pool = PoolCache.getPool(token0, token1, fee, sqrtPriceX96, liquidity, tick, feeProtocol)
    return [PoolState.EXISTS, pool]
  } catch (error) {
    console.error('Error when constructing the pool', error)
    return [PoolState.INVALID, null]
  }
}

export function usePools(
  poolKeys: [Currency | undefined | null, Currency | undefined | null, FeeAmount | undefined][],
): [PoolState, Pool | null][] {
  const { chainId: activeChainId } = useActiveChainId()

  const poolChainId = useMemo(() => {
    return poolKeys.find(([currencyA]) => currencyA?.wrapped.chainId)?.[0]?.wrapped.chainId
  }, [poolKeys])

  // TODO: improve this by only using poolChainId.
  const chainId = poolChainId ?? activeChainId

  // NOTE: Ensure poolTokens and poolKeys have the same length.
  const poolTokens: ([Token, Token, FeeAmount] | undefined)[] = useMemo(() => {
    if (!chainId) return new Array(poolKeys.length)

    return poolKeys.map(([currencyA, currencyB, feeAmount]) => {
      if (currencyA && currencyB && feeAmount) {
        const tokenA = currencyA.wrapped
        const tokenB = currencyB.wrapped
        if (tokenA.equals(tokenB)) return undefined

        return tokenA.sortsBefore(tokenB) ? [tokenA, tokenB, feeAmount] : [tokenB, tokenA, feeAmount]
      }
      return undefined
    })
  }, [chainId, poolKeys])

  const poolAddresses: (Address | undefined)[] = useMemo(() => {
    const v3CoreDeployerAddress = chainId && DEPLOYER_ADDRESSES[chainId]
    if (!v3CoreDeployerAddress) return new Array(poolTokens.length)

    return poolTokens.map((value) => value && PoolCache.getPoolAddress(v3CoreDeployerAddress, ...value))
  }, [chainId, poolTokens])

  const { data: slot0s, isLoading: slot0Loading } = useMultipleContractSingleDataWagmi({
    addresses: poolAddresses,
    chainId,
    abi: v3PoolStateABI,
    functionName: 'slot0',
    options: {
      enabled: poolAddresses.length > 0,
      watch: true,
    },
  })

  const { data: liquidities, isLoading: liquidityLoading } = useMultipleContractSingleDataWagmi({
    addresses: poolAddresses,
    chainId,
    abi: v3PoolStateABI,
    functionName: 'liquidity',
    options: {
      enabled: poolAddresses.length > 0,
      watch: true,
    },
  })

  return useMemo(() => {
    return poolKeys.map((_key, index) => {
      const slot0Result = slot0s?.[index] as Slot0Result | undefined
      const liquidityResult = liquidities?.[index] as LiquidityResult | undefined

      return getPoolStateAndPool(poolTokens[index], slot0Result, liquidityResult, slot0Loading || liquidityLoading)
    })
  }, [liquidities, poolKeys, slot0s, poolTokens, slot0Loading, liquidityLoading])
}

export function usePool(
  currencyA: Currency | undefined | null,
  currencyB: Currency | undefined | null,
  feeAmount: FeeAmount | undefined,
): [PoolState, Pool | null] {
  const poolKeys: [Currency | undefined | null, Currency | undefined | null, FeeAmount | undefined][] = useMemo(
    () => [[currencyA, currencyB, feeAmount]],
    [currencyA, currencyB, feeAmount],
  )

  return usePools(poolKeys)[0]
}

export function usePoolsWithMultiChains(
  poolKeys: [Currency | undefined | null, Currency | undefined | null, FeeAmount | undefined][],
): [PoolState, Pool | null][] {
  const poolTokens: ([Token, Token, FeeAmount] | undefined)[] = useMemo(() => {
    return poolKeys.map(([currencyA, currencyB, feeAmount]) => {
      if (currencyA && currencyB && feeAmount) {
        const tokenA = currencyA.wrapped
        const tokenB = currencyB.wrapped
        if (tokenA.equals(tokenB)) return undefined

        return tokenA.sortsBefore(tokenB) ? [tokenA, tokenB, feeAmount] : [tokenB, tokenA, feeAmount]
      }
      return undefined
    })
  }, [poolKeys])

  const poolAddressMap: { [chainId: number]: Address[] } = useMemo(() => {
    return poolTokens.reduce((acc, value) => {
      if (!value) {
        return acc
      }
      const { chainId } = value[0]
      const v3CoreDeployerAddress = DEPLOYER_ADDRESSES[chainId]
      const addr = PoolCache.getPoolAddress(v3CoreDeployerAddress, ...value)
      // eslint-disable-next-line no-param-reassign
      acc[chainId] = acc[chainId] ?? []
      acc[chainId].push(addr)
      return acc
    }, {})
  }, [poolTokens])

  const chainIds = useMemo(() => Object.keys(poolAddressMap), [poolAddressMap])
  const poolAddressesString = useMemo(
    () => chainIds.flatMap((chainId) => poolAddressMap[chainId]).join(','),
    [chainIds, poolAddressMap],
  )

  const { data: poolInfoByChainId } = useQuery({
    queryKey: ['v3PoolInfo', chainIds.join(','), poolAddressesString],
    queryFn: async () => {
      const results = await Promise.all(
        chainIds.map(async (chainId) => {
          const poolAddresses: Address[] = poolAddressMap[chainId]
          const client = publicClient({ chainId: Number(chainId) })

          const slot0Calls = poolAddresses.map((addr) => ({
            address: addr,
            abi: v3PoolStateABI,
            functionName: 'slot0',
          }))

          const liquidityCalls = poolAddresses.map((addr) => ({
            address: addr,
            abi: v3PoolStateABI,
            functionName: 'liquidity',
          }))

          try {
            const [slot0Data, liquidityData] = await Promise.all([
              client.multicall({
                contracts: slot0Calls,
                allowFailure: false,
              }),
              client.multicall({
                contracts: liquidityCalls,
                allowFailure: false,
              }),
            ])

            return { [chainId]: { slot0: slot0Data, liquidity: liquidityData } }
          } catch (error) {
            console.error(`Error fetching data for chainId ${chainId}:`, error)
            return { [chainId]: { slot0: undefined, liquidity: undefined } }
          }
        }),
      )
      return results.reduce((acc, result) => {
        const chainId = Object.keys(result)[0]
        // eslint-disable-next-line no-param-reassign
        acc[chainId] = result[chainId]
        return acc
      }, {} as { slot0: [bigint, number, number, number, number, number, boolean]; liquidity: [bigint, number, number, number, number, number, boolean] })
    },
    enabled: chainIds?.length > 0,
    placeholderData: keepPreviousData,
    ...QUERY_SETTINGS_IMMUTABLE,
    ...QUERY_SETTINGS_WITHOUT_INTERVAL_REFETCH,
  })

  return useMemo(() => {
    const indexMap = {}
    return poolKeys.map((_key, index) => {
      const tokens = poolTokens[index]
      if (!tokens) return [PoolState.INVALID, null]
      const [token0, token1, fee] = tokens

      indexMap[token0.chainId] = (indexMap[token0.chainId] ?? -1) + 1
      const { slot0: slot0s = [], liquidity: liquidities = [] } = poolInfoByChainId?.[token0.chainId] || {}
      const slot0 = slot0s[indexMap[token0.chainId]]
      const liquidity = liquidities[indexMap[token0.chainId]]
      if (typeof slot0 === 'undefined' || typeof liquidity === 'undefined') return [PoolState.INVALID, null]
      const [sqrtPriceX96, tick, , , , feeProtocol] = slot0
      if (!sqrtPriceX96 || sqrtPriceX96 === 0n) return [PoolState.NOT_EXISTS, null]

      try {
        const pool = PoolCache.getPool(token0, token1, fee, sqrtPriceX96, liquidity, tick, feeProtocol)
        return [PoolState.EXISTS, pool]
      } catch (error) {
        console.error('Error when constructing the pool', error)
        return [PoolState.NOT_EXISTS, null]
      }
    })
  }, [poolKeys, poolTokens, poolInfoByChainId])
}

export function usePoolByChainId(
  currencyA: Currency | undefined | null,
  currencyB: Currency | undefined | null,
  feeAmount: FeeAmount | undefined,
): [PoolState, Pool | null] {
  const poolKeys: [Currency | undefined | null, Currency | undefined | null, FeeAmount | undefined][] = useMemo(
    () => [[currencyA, currencyB, feeAmount]],
    [currencyA, currencyB, feeAmount],
  )

  return usePoolsWithMultiChains(poolKeys)[0]
}
