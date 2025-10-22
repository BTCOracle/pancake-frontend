import { BigintIsh, Currency } from '@pancakeswap/sdk'

import { getPairCombinations } from '../../v3-router/functions'
import { getV3PoolsWithoutTicksOnChain } from '../../v3-router/providers'
import { OnChainProvider, V3Pool } from '../../v3-router/types'
import { fetchCombinedPoolsTick } from '../../utils/combinedTickQuery.helper'

type WithMulticallGasLimit = {
  gasLimit?: BigintIsh
}

type WithClientProvider = {
  clientProvider?: OnChainProvider
}

export type GetV3CandidatePoolsParams = {
  currencyA?: Currency
  currencyB?: Currency
  disableFilterNoTicks?: boolean
} & WithClientProvider &
  WithMulticallGasLimit

export async function getV3CandidatePools({
  currencyA,
  currencyB,
  clientProvider,
  gasLimit,
  disableFilterNoTicks,
}: GetV3CandidatePoolsParams) {
  const pairs = await getPairCombinations(currencyA, currencyB)
  return getV3Pools({ pairs, clientProvider, gasLimit, disableFilterNoTicks })
}

export type GetV3PoolsParams = {
  pairs?: [Currency, Currency][]
  disableFilterNoTicks?: boolean
} & WithClientProvider &
  WithMulticallGasLimit

export async function getV3Pools({ pairs, clientProvider, gasLimit, disableFilterNoTicks }: GetV3PoolsParams) {
  const pools = await getV3PoolsWithoutTicksOnChain(pairs || [], clientProvider)
  if (!pools.length) {
    return pools
  }
  return fillPoolsWithTicks({ pools, clientProvider, gasLimit, disableFilterNoTicks })
}

type FillPoolsWithTicksParams = {
  pools: V3Pool[]
  disableFilterNoTicks?: boolean
} & WithClientProvider &
  WithMulticallGasLimit

async function fillPoolsWithTicks({
  pools,
  clientProvider,
  gasLimit,
  disableFilterNoTicks,
}: FillPoolsWithTicksParams): Promise<V3Pool[]> {
  // Use the combined tick query that tries compact ticks first, then falls back to tickLens
  const finalTicksByPool = await fetchCombinedPoolsTick({
    pools,
    clientProvider,
    gasLimit,
    disableFilterNoTicks,
  })

  const poolsWithTicks = pools.map((p) => ({
    ...p,
    ticks: finalTicksByPool[p.address.toLowerCase()] ?? [],
  }))

  return disableFilterNoTicks ? poolsWithTicks : poolsWithTicks.filter((p) => p.ticks.length)
}
