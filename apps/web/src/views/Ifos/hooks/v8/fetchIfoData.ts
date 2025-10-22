import { Ifo, ifoV8ABI } from '@pancakeswap/ifos'
import { BIG_ZERO } from '@pancakeswap/utils/bigNumber'
import BigNumber from 'bignumber.js'
import { publicClient } from 'utils/wagmi'
import { Address } from 'viem'

export const fetchIfoData = async (account: Address, ifo: Ifo, version: number, chainId: number) => {
  const { address } = ifo
  const client = publicClient({ chainId })
  const [userInfo, amounts] = await client.multicall({
    contracts: [
      {
        address,
        abi: ifoV8ABI,
        functionName: 'viewUserInfo',
        args: [account, [0, 1]],
      },
      {
        address,
        abi: ifoV8ABI,
        functionName: 'viewUserOfferingAndRefundingAmountsForPools',
        args: [account, [0, 1]],
      },
    ],
    allowFailure: false,
  })

  let basicId: Address | null = null
  let unlimitedId: Address | null = null
  if (version >= 3.2) {
    const [basicIdDataResult, unlimitedIdDataResult] = await client.multicall({
      contracts: [
        {
          address,
          abi: ifoV8ABI,
          functionName: 'computeVestingScheduleIdForAddressAndPid',
          args: [account, 0],
        },
        {
          address,
          abi: ifoV8ABI,
          functionName: 'computeVestingScheduleIdForAddressAndPid',
          args: [account, 1],
        },
      ],
    })

    basicId = basicIdDataResult.result ?? null
    unlimitedId = unlimitedIdDataResult.result ?? null
  }

  basicId = basicId || '0x'
  unlimitedId = unlimitedId || '0x'

  let isQualifiedNFT: boolean = false
  let isQualifiedPoints: boolean = false

  let basicSchedule: VestingSchedule | null = null
  let unlimitedSchedule: VestingSchedule | null = null

  let basicReleasableAmount: bigint | null = null
  let unlimitedReleasableAmount: bigint | null = null

  if (version >= 3.1) {
    const [
      isQualifiedNFTResult,
      isQualifiedPointsResult,
      basicScheduleResult,
      unlimitedScheduleResult,
      basicReleasableAmountResult,
      unlimitedReleasableAmountResult,
    ] = await client.multicall({
      contracts: [
        {
          address,
          abi: ifoV8ABI,
          functionName: 'isQualifiedNFT',
          args: [account],
        },
        {
          address,
          abi: ifoV8ABI,
          functionName: 'isQualifiedPoints',
          args: [account],
        },
        {
          address,
          abi: ifoV8ABI,
          functionName: 'getVestingSchedule',
          args: [basicId],
        },
        {
          address,
          abi: ifoV8ABI,
          functionName: 'getVestingSchedule',
          args: [unlimitedId],
        },
        {
          address,
          abi: ifoV8ABI,
          functionName: 'computeReleasableAmount',
          args: [basicId],
        },
        {
          address,
          abi: ifoV8ABI,
          functionName: 'computeReleasableAmount',
          args: [unlimitedId],
        },
      ],
      allowFailure: true,
    })

    isQualifiedNFT = isQualifiedNFTResult.result || false
    isQualifiedPoints = isQualifiedPointsResult.result || false
    basicSchedule = basicScheduleResult.result || null
    unlimitedSchedule = unlimitedScheduleResult.result || null
    basicReleasableAmount = basicReleasableAmountResult.result || null
    unlimitedReleasableAmount = unlimitedReleasableAmountResult.result || null
  }

  return {
    basicPoolData: preparePoolData(
      0,
      userInfo,
      amounts,
      basicSchedule,
      basicReleasableAmount,
      basicId,
      isQualifiedNFT,
      isQualifiedPoints,
    ),
    unlimitedPoolData: preparePoolData(1, userInfo, amounts, unlimitedSchedule, unlimitedReleasableAmount, unlimitedId),
  }
}

interface VestingSchedule {
  released: bigint
  amountTotal: bigint
  isVestingInitialized: boolean
}

const preparePoolData = (
  poolId: 0 | 1,
  userInfo: any,
  amounts: any,
  schedule: any,
  releasableAmount: bigint | null,
  vestingId: Address | null,
  isQualifiedNFT?: boolean,
  isQualifiedPoints?: boolean,
) => {
  const hasClaimed = userInfo[1][poolId]
  const [offeringRaw, refundingRaw, taxRaw] = amounts[poolId]
  const vestingReleasedBn = schedule ? new BigNumber(schedule.released.toString()) : BIG_ZERO
  const vestingTotalBn = schedule ? new BigNumber(schedule.amountTotal.toString()) : BIG_ZERO
  const releasableBn = releasableAmount ? new BigNumber(releasableAmount.toString()) : BIG_ZERO

  const data = {
    amountTokenCommittedInLP: new BigNumber(userInfo[0][poolId].toString()),
    offeringAmountInToken: new BigNumber(offeringRaw.toString()),
    refundingAmountInLP: new BigNumber(refundingRaw.toString()),
    taxAmountInLP: new BigNumber(taxRaw.toString()),
    hasClaimed,
    isPendingTx: false,
    vestingReleased: vestingReleasedBn,
    vestingAmountTotal: vestingTotalBn,
    isVestingInitialized: schedule ? schedule.isVestingInitialized : false,
    vestingId: vestingId ? vestingId.toString() : '0',
    vestingComputeReleasableAmount: releasableBn,
  }

  if (poolId === 0 && isQualifiedNFT !== undefined && isQualifiedPoints !== undefined) {
    return {
      ...data,
      isQualifiedNFT,
      isQualifiedPoints,
    }
  }

  return data
}
