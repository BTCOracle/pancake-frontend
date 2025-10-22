import { ApiV3PoolInfoConcentratedItem } from '@pancakeswap/solana-core-sdk'
import { atom, useAtomValue } from 'jotai'
import { atomFamily } from 'jotai/utils'

export type SolanaV3Pool = ApiV3PoolInfoConcentratedItem & {
  liquidity?: bigint
  tickCurrent?: number
  isFarming?: boolean
}

export const solanaV3PoolIdsAtom = atom<string[]>([])

export const solanaV3PoolsAtomFamily = atomFamily((poolId: string) => {
  return atom<SolanaV3Pool | null>(null)
})

export const addSolanaV3PoolAtom = atom(null, (get, set, pool: SolanaV3Pool | null) => {
  if (!pool) return
  const ids = get(solanaV3PoolIdsAtom)
  if (ids.includes(pool.id)) {
    return
  }
  set(solanaV3PoolIdsAtom, [...ids, pool.id])
  set(solanaV3PoolsAtomFamily(pool.id), pool)
})

export const updateSolanaV3PoolAtom = atom(null, (get, set, pool: Partial<SolanaV3Pool> & { id: string }) => {
  const ids = get(solanaV3PoolIdsAtom)
  if (!ids.includes(pool.id)) {
    return
  }
  set(solanaV3PoolsAtomFamily(pool.id), { ...get(solanaV3PoolsAtomFamily(pool.id)), ...pool } as SolanaV3Pool)
})

export const removeSolanaV3PoolAtom = atom(null, (get, set, pool: SolanaV3Pool) => {
  const ids = get(solanaV3PoolIdsAtom)
  if (!ids.includes(pool.id)) {
    return
  }
  set(
    solanaV3PoolIdsAtom,
    ids.filter((id) => id !== pool.id),
  )
  set(solanaV3PoolsAtomFamily(pool.id), null)
})

export const allSolanaV3PoolsAtom = atom((get) => {
  const ids = get(solanaV3PoolIdsAtom)
  return ids.map((id) => get(solanaV3PoolsAtomFamily(id)))
})

export const useSolanaV3Pool = (poolId: string | undefined) => {
  return useAtomValue(solanaV3PoolsAtomFamily(poolId ?? ''))
}
