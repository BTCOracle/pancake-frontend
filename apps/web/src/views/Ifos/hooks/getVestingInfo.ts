import { PoolIds } from '@pancakeswap/ifos'
import { getFullDisplayBalance } from '@pancakeswap/utils/formatBalance'
import BigNumber from 'bignumber.js'
import { VestingData } from './vesting/fetchUserWalletIfoData'

export const getVestingInfo = (poolId: PoolIds, data: VestingData) => {
  const { token } = data.ifo
  const { vestingStartTime } = data.userVestingData
  const {
    isVestingInitialized,
    vestingComputeReleasableAmount,
    offeringAmountInToken,
    vestingInformationPercentage,
    vestingReleased,
    vestingInformationDuration,
  } = data.userVestingData[poolId]

  const currentTimeStamp = Date.now()
  const timeVestingEnd = (vestingStartTime + vestingInformationDuration) * 1000
  const isVestingOver = currentTimeStamp > timeVestingEnd

  const vestingPercentage = new BigNumber(vestingInformationPercentage).times(0.01)

  const releasedAtSaleEnd = new BigNumber(offeringAmountInToken).times(new BigNumber(1).minus(vestingPercentage))

  const amountReleased = new BigNumber(releasedAtSaleEnd).plus(vestingReleased).plus(vestingComputeReleasableAmount)

  const alreadyClaimed = new BigNumber(releasedAtSaleEnd).plus(vestingReleased)
  const received = alreadyClaimed.gt(0) ? getFullDisplayBalance(alreadyClaimed, token.decimals, 4) : '0'

  const remain = new BigNumber(offeringAmountInToken).minus(amountReleased)
  const claimableAmount = isVestingOver
    ? new BigNumber(vestingComputeReleasableAmount).plus(remain)
    : vestingComputeReleasableAmount
  const claimable = claimableAmount.gt(0) ? getFullDisplayBalance(claimableAmount, token.decimals, 4) : '0'

  const remaining = remain.gt(0) ? getFullDisplayBalance(remain, token.decimals, 4) : '0'

  const total = new BigNumber(received).plus(claimable).plus(remaining)
  const percentage = total.eq(0)
    ? {
        receivedPercentage: 0,
        amountAvailablePercentage: 0,
      }
    : {
        receivedPercentage: new BigNumber(received).div(total).times(100).toNumber(),
        amountAvailablePercentage:
          new BigNumber(received).div(total).times(100).toNumber() +
          new BigNumber(claimable).div(total).times(100).toNumber(),
      }

  return {
    isVestingInitialized,
    isVestingOver,
    vestingPercentage,
    releasedAtSaleEnd,
    amountReleased,
    received,
    claimable,
    remaining,
    percentage,
  }
}

export const getHasClaimable = (poolIds: PoolIds[], data: VestingData | null) => {
  if (!data) {
    return false
  }

  return poolIds.some((poolId) => {
    const { claimable } = getVestingInfo(poolId, data)
    return claimable !== '0'
  })
}
