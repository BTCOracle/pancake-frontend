import { ChainId } from '@pancakeswap/chains'
import {
  CLPoolManagerAbi,
  INFI_CL_POOL_MANAGER_ADDRESSES,
  PoolKey,
  decodeHooksRegistration,
  findHook,
  getPoolId,
  isInfinitySupported,
} from '@pancakeswap/infinity-sdk'
import { Native } from '@pancakeswap/sdk'
import { BigintIsh, Currency, getCurrencyAddress, sortCurrencies } from '@pancakeswap/swap-sdk-core'
import { Address, Hex } from 'viem'

import { CL_HOOK_PRESETS_BY_CHAIN, CL_PRESETS_BY_CHAIN } from '../../constants'
import { getPairCombinations } from '../../v3-router/functions'
import { createOnChainPoolFactory } from '../../v3-router/providers'
import { PoolMeta } from '../../v3-router/providers/poolProviders/internalTypes'
import { InfinityClPool, OnChainProvider, PoolType } from '../../v3-router/types'
import { GetInfinityCandidatePoolsParams } from '../types'
import { fetchCompactPoolsTick } from '../../utils/compactTickQuery.helper'
import { fetchCombinedPoolsTick } from '../../utils/combinedTickQuery.helper'

type WithMulticallGasLimit = {
  gasLimit?: BigintIsh
}

type WithClientProvider = {
  clientProvider?: OnChainProvider
}

export async function getInfinityClCandidatePools({
  currencyA,
  currencyB,
  clientProvider,
  gasLimit,
}: GetInfinityCandidatePoolsParams) {
  const pools = await getInfinityClCandidatePoolsWithoutTicks({
    currencyA,
    currencyB,
    clientProvider,
  })
  return fillClPoolsWithTicks({
    pools,
    clientProvider,
    gasLimit,
  })
}

export async function getInfinityClCandidatePoolsWithoutTicks({
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
  return getInfinityClPoolsWithoutTicks(pairsWithNative, clientProvider)
}

type InfinityClPoolMeta = PoolMeta & {
  fee: number
  protocolFee?: number
  poolManager: Address
  tickSpacing: number
  hooks: Address
  hooksRegistrationBitmap?: Hex | number
}

export const getInfinityClPoolsWithoutTicks = createOnChainPoolFactory<InfinityClPool, InfinityClPoolMeta>({
  abi: CLPoolManagerAbi,
  getPossiblePoolMetas: async ([currencyA, currencyB]) => {
    const { chainId } = currencyA
    if (!isInfinitySupported(chainId))
      throw new Error(`Failed to get cl pools. Infinity not supported on chain ${chainId}`)
    const [currency0, currency1] = sortCurrencies([currencyA, currencyB])
    const poolIdList = new Set<string>()
    const metas: InfinityClPoolMeta[] = []
    const presets = CL_PRESETS_BY_CHAIN[chainId]
    const hookPresets = CL_HOOK_PRESETS_BY_CHAIN[chainId]
    for (const { fee, tickSpacing } of presets) {
      for (const { address: hooks, registrationBitmap, poolKeyOverride } of hookPresets) {
        const poolKey: PoolKey<'CL'> = {
          currency0: getCurrencyAddress(currency0),
          currency1: getCurrencyAddress(currency1),
          fee,
          parameters: {
            tickSpacing,
            hooksRegistration:
              registrationBitmap !== undefined ? decodeHooksRegistration(registrationBitmap) : undefined,
          },
          poolManager: INFI_CL_POOL_MANAGER_ADDRESSES[chainId],
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
          tickSpacing,
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
      functionName: 'getLiquidity',
      args: [id],
    },
    {
      address,
      functionName: 'getSlot0',
      args: [id],
    },
  ],
  buildPool: (
    { currencyA, currencyB, id, tickSpacing, poolManager, hooks, hooksRegistrationBitmap },
    [liquidity, slot0],
  ) => {
    if (!slot0 || !slot0[0]) {
      return null
    }
    const [sqrtPriceX96, tick, protocolFee, lpFee] = slot0
    const [currency0, currency1] = sortCurrencies([currencyA, currencyB])
    const whitelistHook = findHook(hooks, currencyA.wrapped.chainId)
    return {
      id,
      type: PoolType.InfinityCL,
      currency0,
      currency1,
      fee: whitelistHook?.defaultFee ?? lpFee,
      protocolFee,
      liquidity: BigInt(liquidity.toString()),
      sqrtRatioX96: BigInt(sqrtPriceX96.toString()),
      tick: Number(tick),
      tickSpacing,
      poolManager,
      hooks,
      hooksRegistrationBitmap,
    }
  },
})

type FillPoolsWithTicksParams = {
  pools: InfinityClPool[]
} & WithClientProvider &
  WithMulticallGasLimit

export async function fillClPoolsWithTicks({
  pools,
  clientProvider,
  gasLimit,
}: FillPoolsWithTicksParams): Promise<InfinityClPool[]> {
  if (pools.length === 0) {
    return []
  }

  const chainId: ChainId = pools[0]?.currency0.chainId
  const client = clientProvider?.({ chainId })
  if (!client) {
    throw new Error('Fill pools with ticks failed. No valid public client found.')
  }
  const ticksByPool = await fetchCombinedPoolsTick({ pools, clientProvider, gasLimit })
  const poolsWithTicks = pools.map((p) => ({
    ...p,
    ticks: ticksByPool[p.id.toLowerCase()] ?? [],
  }))

  return poolsWithTicks.filter((p) => p.ticks.length)
}
