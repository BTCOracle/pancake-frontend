import BigNumber from 'bignumber.js'
import { BIG_ZERO } from '@pancakeswap/utils/bigNumber'
import { getBalanceNumber, getFullDisplayBalance, getDecimalAmount } from '@pancakeswap/utils/formatBalance'
import memoize from 'lodash/memoize'
import { Token } from '@pancakeswap/sdk'
import { Pool } from '@pancakeswap/widgets-internal'

// min deposit and withdraw amount
export const MIN_LOCK_AMOUNT = new BigNumber(10000000000000)

export const ENABLE_EXTEND_LOCK_AMOUNT = new BigNumber(100000000000000)

export const convertSharesToCake = (
  shares: BigNumber,
  cakePerFullShare: BigNumber,
  decimals = 18,
  decimalsToRound = 3,
  fee?: BigNumber,
) => {
  const sharePriceNumber = getBalanceNumber(cakePerFullShare, decimals)
  const amountInCake = new BigNumber(shares.multipliedBy(sharePriceNumber)).minus(fee || BIG_ZERO)
  const cakeAsNumberBalance = getBalanceNumber(amountInCake, decimals)
  const cakeAsBigNumber = getDecimalAmount(new BigNumber(cakeAsNumberBalance), decimals)
  const cakeAsDisplayBalance = getFullDisplayBalance(amountInCake, decimals, decimalsToRound)
  return { cakeAsNumberBalance, cakeAsBigNumber, cakeAsDisplayBalance }
}

export const convertCakeToShares = (
  cake: BigNumber,
  cakePerFullShare: BigNumber,
  decimals = 18,
  decimalsToRound = 3,
) => {
  const sharePriceNumber = getBalanceNumber(cakePerFullShare, decimals)
  const amountInShares = new BigNumber(cake.dividedBy(sharePriceNumber))
  const sharesAsNumberBalance = getBalanceNumber(amountInShares, decimals)
  const sharesAsBigNumber = getDecimalAmount(new BigNumber(sharesAsNumberBalance), decimals)
  const sharesAsDisplayBalance = getFullDisplayBalance(amountInShares, decimals, decimalsToRound)
  return { sharesAsNumberBalance, sharesAsBigNumber, sharesAsDisplayBalance }
}

export const getPoolBlockInfo = memoize(
  (pool: Pool.DeserializedPool<Token>, currentBlock: number) => {
    const { startTimestamp, endTimestamp, isFinished } = pool
    const shouldShowBlockCountdown = Boolean(!isFinished && startTimestamp && endTimestamp)
    const now = Math.floor(Date.now() / 1000)
    const timeUntilStart = Math.max((startTimestamp || 0) - now, 0)
    const timeRemaining = Math.max((endTimestamp || 0) - now, 0)
    const hasPoolStarted = timeUntilStart <= 0 && timeRemaining > 0
    const timeToDisplay = hasPoolStarted ? timeRemaining : timeUntilStart
    return { shouldShowBlockCountdown, timeUntilStart, timeRemaining, hasPoolStarted, timeToDisplay, currentBlock }
  },
  (pool, currentBlock) => `${pool.startTimestamp}#${pool.endTimestamp}#${pool.isFinished}#${currentBlock}`,
)

export const getICakeWeekDisplay = (ceiling: BigNumber) => {
  const weeks = new BigNumber(ceiling).div(60).div(60).div(24).div(7)
  return Math.round(weeks.toNumber())
}
