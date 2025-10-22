import { BIG_ZERO } from '@pancakeswap/utils/bigNumber'
import { createSelector } from '@reduxjs/toolkit'
import BigNumber from 'bignumber.js'
import { State } from '../types'
import { transformPool } from './helpers'

const selectPoolsData = (state: State) => state.pools.data
const selectPoolData = (sousId) => (state: State) => state.pools.data.find((p) => p.sousId === sousId)
const selectUserDataLoaded = (state: State) => state.pools.userDataLoaded
const selectIfo = (state: State) => state.pools.ifo
const selectIfoUserCredit = (state: State) => state.pools.ifo.credit ?? BIG_ZERO

export const makePoolWithUserDataLoadingSelector = (sousId: number) =>
  createSelector([selectPoolData(sousId), selectUserDataLoaded], (pool, userDataLoaded) => {
    return { pool: pool ? transformPool(pool) : undefined, userDataLoaded }
  })

export const poolsWithUserDataLoadingSelector = createSelector(
  [selectPoolsData, selectUserDataLoaded],
  (pools, userDataLoaded) => {
    return { pools: pools.map(transformPool), userDataLoaded }
  },
)

export const poolsSelector = createSelector([poolsWithUserDataLoadingSelector], (poolsWithUserDataLoading) => {
  const { pools, userDataLoaded } = poolsWithUserDataLoading
  const withoutCakePool = pools.filter((pool) => pool.sousId !== 0)

  const allPools = [...withoutCakePool]
  return { pools: allPools, userDataLoaded }
})

export const ifoCreditSelector = createSelector([selectIfoUserCredit], (ifoUserCredit) => {
  return new BigNumber(ifoUserCredit)
})

export const ifoCeilingSelector = createSelector([selectIfo], (ifoData) => {
  return new BigNumber(ifoData.ceiling)
})
