import { InfinityBinPool, InfinityClPool } from '../../v3-router/types'

export interface InfinityPoolTvlReference extends Pick<InfinityClPool | InfinityBinPool, 'id'> {
  tvlUSD: bigint | string
}

export type InfinityPoolTvlReferenceMap = Record<`0x${string}`, InfinityPoolTvlReference>

export const getInfinityPoolTvl = (map: InfinityPoolTvlReferenceMap, poolId: `0x${string}`) => {
  const ref = map[poolId]
  const tvlUsd = BigInt(ref ? ref.tvlUSD : 0n)
  return tvlUsd
}
