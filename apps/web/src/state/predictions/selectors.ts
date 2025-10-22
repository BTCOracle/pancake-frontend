import { MINUTE_IN_SECONDS } from '@pancakeswap/utils/getTimePeriods'
import { createSelector } from '@reduxjs/toolkit'
import BigNumber from 'bignumber.js'
import orderBy from 'lodash/orderBy'
import { Address } from 'viem'
import { NodeLedger, NodeRound, PredictionsState } from '../types'
import { deserializeRound } from './helpers'

const selectCurrentEpoch = (state: PredictionsState) => state.currentEpoch
const selectRounds = (state: PredictionsState) => state.rounds
const selectLedgers = (state: PredictionsState) => state.ledgers
const selectClaimableStatuses = (state: PredictionsState) => state.claimableStatuses
const selectMinBetAmount = (state: PredictionsState) => state.minBetAmount
const selectIntervalSeconds = (state: PredictionsState) => state.intervalSeconds

export const makeGetBetByEpochSelector = (account: Address, epoch: number) =>
  createSelector([selectLedgers], (bets): null | NodeLedger => {
    if (!bets?.[account]) {
      return null
    }

    if (!bets[account][epoch]) {
      return null
    }

    return {
      amount: BigInt(bets[account][epoch].amount),
      claimed: bets[account][epoch].claimed,
      position: bets[account][epoch].position,
    }
  })

export const makeGetIsClaimableSelector = (epoch: number) =>
  createSelector([selectClaimableStatuses], (claimableStatuses) => {
    return claimableStatuses[epoch] || false
  })

export const getRoundsByCloseOracleIdSelector = createSelector([selectRounds], (rounds) => {
  return (
    rounds &&
    (Object.keys(rounds).reduce((accum, epoch) => {
      const parsed = deserializeRound(rounds[epoch])
      return {
        ...accum,
        ...(parsed.closeOracleId && {
          [parsed.closeOracleId]: parsed,
        }),
      }
    }, {}) as { [key: string]: NodeRound })
  )
})

export const getBigNumberRounds = createSelector([selectRounds], (rounds) => {
  return (
    rounds &&
    (Object.keys(rounds).reduce((accum, epoch) => {
      return {
        ...accum,
        [epoch]: deserializeRound(rounds[epoch]),
      }
    }, {}) as { [key: string]: NodeRound })
  )
})

export const getSortedRoundsSelector = createSelector([getBigNumberRounds], (rounds) => {
  return rounds && orderBy(Object.values(rounds), ['epoch'], ['asc'])
})

export const getSortedRoundsCurrentEpochSelector = createSelector(
  [selectCurrentEpoch, getSortedRoundsSelector],
  (currentEpoch, sortedRounds) => {
    return {
      currentEpoch,
      rounds: sortedRounds,
    }
  },
)

export const getMinBetAmountSelector = createSelector([selectMinBetAmount], (b) => BigInt(b))

export const getCurrentRoundCloseTimestampSelector = createSelector(
  [selectCurrentEpoch, getBigNumberRounds, selectIntervalSeconds],
  (currentEpoch, rounds, intervalSeconds) => {
    if (!currentEpoch) {
      return undefined
    }

    const currentRound = rounds?.[currentEpoch - 1]

    if (!currentRound) {
      return undefined
    }

    const now = Math.floor(Date.now() / 1000)

    // Current round cancelled
    if (!currentRound.closeTimestamp || currentRound.closeTimestamp < now) {
      const calculatedCloseTime = Number(currentRound.lockTimestamp) + intervalSeconds

      // If the calculated close time is in the past, this indicates the service was paused
      if (calculatedCloseTime < now) {
        // Try to use the next round's startTimestamp for accurate timing
        const nextRound = rounds?.[currentEpoch] // Open Round

        if (nextRound?.startTimestamp) {
          const nextRoundStart = Number(nextRound.startTimestamp)
          // Current round should close when next round starts
          if (nextRoundStart > now) {
            return nextRoundStart
          }

          // Check Next to Next Round (after Open Round)
          const nextNextRound = rounds?.[currentEpoch + 1]

          if (nextNextRound?.startTimestamp) {
            const nextNextRoundStart = Number(nextNextRound.startTimestamp)

            if (nextNextRoundStart > now) {
              return nextNextRoundStart
            }
          }
        }

        // If we can't get accurate timing, return -1 to show "Starting Soon" in Label.tsx
        return -1
      }

      return calculatedCloseTime
    }

    return Number(currentRound.closeTimestamp)
  },
)

export const getIntervalTimeInMinutes = createSelector([selectIntervalSeconds], (intervalSeconds: number) => {
  return new BigNumber(intervalSeconds).div(MINUTE_IN_SECONDS).toNumber()
})
