import { ChainId, UnifiedChainId } from '@pancakeswap/chains'
import { Protocol, supportedChainIdV4 } from '@pancakeswap/farms'
import { atom, useAtom, useAtomValue } from 'jotai'
import isEqual from 'lodash/isEqual'
import uniqWith from 'lodash/uniqWith'
import { useMemo } from 'react'
import { isAddressEqual } from 'utils'
import { isAddress } from 'viem'
import { farmPoolsAtom } from '../farmPools/atom'
import { ChainIdAddressKey, PoolInfo } from '../type'

export enum PoolSortBy {
  APR = 'apr24h',
  TVL = 'tvlUSD',
  VOL = 'volumeUSD24h',
}

export interface FetchPoolsProps {
  protocols?: Protocol[]
  chains?: UnifiedChainId[]
  tokens?: ChainIdAddressKey[]
  pageNo?: number
}

export type ExtendPoolsQuery = FetchPoolsProps & {
  orderBy: PoolSortBy
  pools?: ChainIdAddressKey[]
  before: string
  after: string
}

export const DEFAULT_QUERIES = {
  protocols: Object.values(Protocol),
  orderBy: PoolSortBy.VOL,
  chains: [...supportedChainIdV4] as ChainId[],
  pools: [],
  tokens: [],
  before: '',
  after: '',
}

export const extendPoolsAtom = atom([] as PoolInfo[], (get, set, values: PoolInfo[], replaced = false) => {
  // remove duplicates pools with farmPoolsAtom
  const farms = get(farmPoolsAtom)
  const newData = values.filter(
    (pool) => !farms.some((farm) => isAddressEqual(farm.lpAddress, pool.lpAddress) && farm.protocol === pool.protocol),
  )

  const updatedPools = replaced ? newData : uniqWith([...get(extendPoolsAtom), ...newData], isEqual)
  set(extendPoolsAtom, updatedPools)
})

export const useExtendPoolsAtom = () => {
  const [pools, setPools] = useAtom(extendPoolsAtom)
  const farms = useAtomValue(farmPoolsAtom)

  return useMemo(
    () => ({
      pools,
      setPools: (values: PoolInfo[], replaced = false, removeFarms = false) => {
        const newData = removeFarms
          ? values.filter(
              (pool) =>
                !farms.some(
                  (farm) =>
                    pool.lpAddress &&
                    isAddress(pool.lpAddress) &&
                    isAddressEqual(farm.lpAddress, pool.lpAddress) &&
                    farm.protocol === pool.protocol,
                ),
            )
          : values

        setPools(newData, replaced)
      },
    }),
    [farms, pools, setPools],
  )
}
