import {
  BinPoolManagerAbi,
  INFI_BIN_POOL_MANAGER_ADDRESSES,
  PoolKey,
  decodeHooksRegistration,
  getIdFromPrice,
  getPoolId,
  getPriceFromId,
  isInfinitySupported,
} from '@pancakeswap/infinity-sdk'
import { multicallByGasLimit } from '@pancakeswap/multicall'
import { ChainId, Native } from '@pancakeswap/sdk'
import { BigintIsh, Currency, getCurrencyAddress, sortCurrencies } from '@pancakeswap/swap-sdk-core'
import { Address, Hex, decodeFunctionResult, encodeFunctionData } from 'viem'

import { BIN_HOOK_PRESETS_BY_CHAIN, BIN_PRESETS_BY_CHAIN } from '../../constants'
import { getPairCombinations } from '../../v3-router/functions'
import { createOnChainPoolFactory } from '../../v3-router/providers'
import { PoolMeta } from '../../v3-router/providers/poolProviders/internalTypes'
import { InfinityBinPool, OnChainProvider, PoolType } from '../../v3-router/types'
import { getInfinityPoolFetchConfig } from '../constants'
import { GetInfinityCandidatePoolsParams } from '../types'

type WithMulticallGasLimit = {
  gasLimit?: BigintIsh
}

type WithClientProvider = {
  clientProvider?: OnChainProvider
}

export async function getInfinityBinCandidatePools({
  currencyA,
  currencyB,
  clientProvider,
  gasLimit,
}: GetInfinityCandidatePoolsParams) {
  const pools = await getInfinityBinCandidatePoolsWithoutBins({
    currencyA,
    currencyB,
    clientProvider,
  })
  if (!pools.length) {
    return []
  }
  return fillPoolsWithBins({
    pools,
    clientProvider,
    gasLimit,
  })
}

export async function getInfinityBinCandidatePoolsWithoutBins({
  currencyA,
  currencyB,
  clientProvider,
}: Omit<GetInfinityCandidatePoolsParams, 'gasLimit'>) {
  if (!currencyA || !currencyB) {
    throw new Error(`Invalid currencyA ${currencyA} or currencyB ${currencyB}`)
  }
  const native = Native.onChain(currencyA?.chainId)
  const wnative = native.wrapped
  const pairs = await getPairCombinations(currencyA, currencyB)
  const pairsWithNative = [...pairs]
  for (const pair of pairs) {
    const index = pair.findIndex((c) => c.wrapped.equals(wnative))
    if (index >= 0) {
      const pairWithNative = [...pair]
      pairWithNative[index] = native
      pairsWithNative.push(pairWithNative as [Currency, Currency])
    }
  }
  return getInfinityBinPoolsWithoutBins(pairsWithNative, clientProvider)
}

type InfinityBinPoolMeta = PoolMeta & {
  fee: number
  protocolFee?: number
  poolManager: Address
  binStep: number
  hooks: Address
  hooksRegistrationBitmap?: Hex | number
}

export const getInfinityBinPoolsWithoutBins = createOnChainPoolFactory<InfinityBinPool, InfinityBinPoolMeta>({
  abi: BinPoolManagerAbi,
  getPossiblePoolMetas: async ([currencyA, currencyB]) => {
    const { chainId } = currencyA
    if (!isInfinitySupported(chainId))
      throw new Error(`Failed to get bin pools. Infinity not supported on chain ${chainId}`)
    const [currency0, currency1] = sortCurrencies([currencyA, currencyB])
    const poolIdList = new Set<string>()
    const metas: InfinityBinPoolMeta[] = []
    const binPresets = BIN_PRESETS_BY_CHAIN[chainId]
    for (const { fee, binStep } of binPresets) {
      const hookPresets = BIN_HOOK_PRESETS_BY_CHAIN[chainId]
      for (const { address: hooks, registrationBitmap, poolKeyOverride } of hookPresets) {
        const poolKey: PoolKey<'Bin'> = {
          currency0: getCurrencyAddress(currency0),
          currency1: getCurrencyAddress(currency1),
          fee,
          parameters: {
            binStep,
            hooksRegistration:
              registrationBitmap !== undefined ? decodeHooksRegistration(registrationBitmap) : undefined,
          },
          poolManager: INFI_BIN_POOL_MANAGER_ADDRESSES[chainId],
          hooks,
          ...(poolKeyOverride ?? {}),
        }
        const id = getPoolId(poolKey)
        if (poolIdList.has(id)) {
          continue
        }

        poolIdList.add(id)
        metas.push({
          currencyA,
          currencyB,
          fee,
          binStep,
          hooks,
          poolManager: poolKey.poolManager,
          id,
          hooksRegistrationBitmap: registrationBitmap,
          ...poolKeyOverride,
        })
      }
    }
    return metas
  },
  buildPoolInfoCalls: ({ id, poolManager: address }) => [
    {
      address,
      functionName: 'getSlot0',
      args: [id],
    },
  ],
  buildPool: ({ currencyA, currencyB, id, binStep, poolManager, hooks, hooksRegistrationBitmap }, [slot0]) => {
    if (!slot0 || !slot0[0]) {
      return null
    }
    const [activeId, protocolFee, lpFee] = slot0
    const [currency0, currency1] = sortCurrencies([currencyA, currencyB])
    return {
      id,
      type: PoolType.InfinityBIN,
      currency0,
      currency1,
      fee: lpFee,
      protocolFee,
      activeId,
      binStep,
      poolManager,
      hooks,
      hooksRegistrationBitmap,
    }
  },
})

type GetBinIdParams = {
  activeId: number
  binStep: number
  // plus / minus range in percentage. e.g. 0.1 -> 10% plus / minus
  priceRange: number
}

function getBinIdList<T extends object>({
  activeId,
  binStep,
  priceRange,
  ...rest
}: GetBinIdParams & T): (Omit<T, keyof GetBinIdParams> & { binId: number })[] {
  const price = getPriceFromId(activeId, binStep)
  const [idLower, idUpper] = [
    getIdFromPrice(price * (1 - priceRange), binStep),
    getIdFromPrice(price * (1 + priceRange), binStep),
  ]
  const binIds: (Omit<T, keyof GetBinIdParams> & { binId: number })[] = []
  for (let i = idLower; i <= idUpper; i += 1) {
    binIds.push({
      ...rest,
      binId: i,
    } as Omit<T, keyof GetBinIdParams> & { binId: number })
  }
  return binIds
}

type FillPoolsWithBinsParams = {
  pools: InfinityBinPool[]
  priceRange?: number
} & WithClientProvider &
  WithMulticallGasLimit

export async function fillPoolsWithBins({
  pools,
  clientProvider,
  gasLimit,
  priceRange = 0.05,
}: FillPoolsWithBinsParams): Promise<InfinityBinPool[]> {
  if (!pools.length) {
    return []
  }
  const chainId: ChainId = pools[0]?.currency0.chainId
  const client = clientProvider?.({ chainId })
  if (!client) {
    throw new Error('Fill pools with ticks failed. No valid public client or tick lens found.')
  }
  const { gasLimit: gasLimitPerCall, retryGasMultiplier } = getInfinityPoolFetchConfig(chainId)
  const binIds = pools
    .map(({ binStep, activeId }, i) =>
      getBinIdList<{ poolIndex: number }>({ activeId, binStep, poolIndex: i, priceRange }),
    )
    .reduce<{ binId: number; poolIndex: number }[]>((acc, cur) => {
      acc.push(...cur)
      return acc
    }, [])
  const res = await multicallByGasLimit(
    binIds.map(({ poolIndex, binId }) => ({
      target: pools[poolIndex].poolManager,
      callData: encodeFunctionData({
        abi: BinPoolManagerAbi,
        args: [pools[poolIndex].id, binId],
        functionName: 'getBin',
      }),
      gasLimit: gasLimitPerCall / 20n, // get Bin is small
    })),
    {
      chainId,
      client,
      gasLimit,
      retryFailedCallsWithGreaterLimit: {
        gasLimitMultiplier: retryGasMultiplier,
      },
    },
  )
  const poolsWithBins = pools.map((p) => ({ ...p }))
  for (const [index, result] of res.results.entries()) {
    const { poolIndex, binId } = binIds[index]
    const pool = poolsWithBins[poolIndex]
    const data = result.success
      ? decodeFunctionResult({
          abi: BinPoolManagerAbi,
          functionName: 'getBin',
          data: result.result as `0x${string}`,
        })
      : undefined
    if (!data) {
      continue
    }
    const [reserveX, reserveY] = data
    if (reserveX === 0n && reserveY === 0n) {
      continue
    }
    const binReserve = {
      reserveX,
      reserveY,
    }
    if (!pool.reserveOfBin) {
      pool.reserveOfBin = {
        [binId]: binReserve,
      }
      continue
    }
    pool.reserveOfBin[binId] = binReserve
  }
  // Filter those pools with no bins found
  return poolsWithBins.filter((p) => p.reserveOfBin)
}
