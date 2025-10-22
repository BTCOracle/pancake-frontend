import { Protocol } from '@pancakeswap/farms'
import { binPoolIdToPoolKey, BinPoolManagerAbi, BinPositionManagerAbi } from '@pancakeswap/infinity-sdk'
import { getInfinityPositionManagerAddress, getPoolManagerAddress } from 'utils/addressHelpers'
import { publicClient } from 'utils/viem'
import { encodeAbiParameters, keccak256, maxUint24, parseAbiParameters, type Address, type Hex } from 'viem'
import { InfinityBinPositionDetail, POSITION_STATUS, ReserveOfBin } from '../../type'

const MAX_EMPTY_BIN_ID = maxUint24
const MIN_EMPTY_BIN_ID = 0

export const getAccountInfinityBinPositionByPoolId = async ({
  chainId,
  account,
  poolId,
}: {
  chainId: number
  account: Address
  poolId: Hex
}) => {
  const client = publicClient({ chainId })
  const binPoolManager = getPoolManagerAddress('Bin', chainId)
  const binPosm = getInfinityPositionManagerAddress('Bin', chainId)
  if (!client || !poolId || !account || !binPoolManager || !binPosm) {
    return undefined
  }
  try {
    const slot0 = await client.readContract({
      address: binPoolManager,
      abi: BinPoolManagerAbi,
      functionName: 'getSlot0',
      args: [poolId],
    })

    const poolKey = await binPoolIdToPoolKey({
      poolId,
      publicClient: client,
    })

    const activeBinId = slot0[0]

    if (activeBinId === 0) return undefined

    const getFirstRightNonEmptyBinIdCall = {
      address: binPoolManager,
      abi: BinPoolManagerAbi,
      functionName: 'getNextNonEmptyBin',
      args: [poolId, true, Number(maxUint24 - 1n)],
    } as const

    const getFirstLeftNonEmptyBinIdCall = {
      address: binPoolManager,
      abi: BinPoolManagerAbi,
      functionName: 'getNextNonEmptyBin',
      args: [poolId, false, 1],
    } as const

    let [firstRightNonEmptyBinId, firstLeftNonEmptyBinId] = await client.multicall({
      contracts: [getFirstRightNonEmptyBinIdCall, getFirstLeftNonEmptyBinIdCall],
      allowFailure: false,
    })

    firstRightNonEmptyBinId =
      BigInt(firstRightNonEmptyBinId) === MAX_EMPTY_BIN_ID ? activeBinId : firstRightNonEmptyBinId
    firstLeftNonEmptyBinId = firstLeftNonEmptyBinId === MIN_EMPTY_BIN_ID ? activeBinId : firstLeftNonEmptyBinId
    ;[firstRightNonEmptyBinId, firstLeftNonEmptyBinId] = [
      Math.max(firstRightNonEmptyBinId, firstLeftNonEmptyBinId),
      Math.min(firstRightNonEmptyBinId, firstLeftNonEmptyBinId),
    ]

    const binIds = new Array(1 + firstRightNonEmptyBinId - firstLeftNonEmptyBinId)
      .fill(0)
      .map((_, index) => firstLeftNonEmptyBinId + index)

    const [userSharesOfBins, bins] = await Promise.all([
      client.multicall({
        contracts: binIds.map((binId) => ({
          address: binPosm,
          abi: BinPositionManagerAbi,
          functionName: 'balanceOf',
          args: [
            account,
            BigInt(keccak256(encodeAbiParameters(parseAbiParameters('bytes32, uint256'), [poolId, BigInt(binId)]))),
          ],
        })),
        allowFailure: false,
      }),
      client.multicall({
        contracts: binIds.map((binId) => ({
          address: binPoolManager,
          abi: BinPoolManagerAbi,
          functionName: 'getBin',
          args: [poolId, binId],
        })),
        allowFailure: false,
      }),
    ])

    let minBinId: number = -1
    let maxBinId: number = -1
    const reserveOfBins: ReserveOfBin[] = binIds
      .map((binId, index) => {
        const userSharesOfBin = BigInt(userSharesOfBins[index])
        if (userSharesOfBin > 0n) {
          if (minBinId === -1) minBinId = binId
          if (maxBinId === -1) maxBinId = binId
          minBinId = Math.min(binId, minBinId)
          maxBinId = Math.max(binId, maxBinId)
          const [binReserveX, binReserveY, binLiquidity, totalShares] = bins[index] as unknown as [
            bigint,
            bigint,
            bigint,
            bigint,
          ]
          const reserveX = totalShares > 0n ? (userSharesOfBin * binReserveX) / totalShares : 0n
          const reserveY = totalShares > 0n ? (userSharesOfBin * binReserveY) / totalShares : 0n

          return {
            binId,
            totalShares,
            userSharesOfBin,
            reserveX,
            reserveY,
            binLiquidity,
          }
        }
        return undefined
      })
      .filter(Boolean) as ReserveOfBin[]

    const reserveX = reserveOfBins.reduce((acc, bin) => acc + bin.reserveX, BigInt(0))
    const reserveY = reserveOfBins.reduce((acc, bin) => acc + bin.reserveY, BigInt(0))
    const poolLiquidity = reserveOfBins.reduce((acc, bin) => acc + bin.binLiquidity, BigInt(0))
    const poolActiveLiquidity = reserveOfBins.find((bin) => bin.binId === activeBinId)?.binLiquidity ?? 0n
    const userLiquidity = reserveOfBins.reduce(
      (acc, bin) => acc + (bin.userSharesOfBin * bin.binLiquidity) / bin.totalShares,
      BigInt(0),
    )
    const activeBin_ = reserveOfBins.find((bin) => bin.binId === activeBinId)
    const userActiveLiquidity = activeBin_
      ? (activeBin_.userSharesOfBin * activeBin_.binLiquidity) / activeBin_.totalShares
      : 0n

    if (userLiquidity === 0n) return undefined

    let status: POSITION_STATUS = POSITION_STATUS.INACTIVE
    const activeBin = reserveOfBins.find((bin) => bin.binId === activeBinId)
    if (activeBin && (activeBin.reserveX > 0n || activeBin.reserveY > 0n)) {
      status = POSITION_STATUS.ACTIVE
    }

    return {
      poolId,
      chainId,
      protocol: Protocol.InfinityBIN,
      activeId: activeBinId,
      reserveOfBins,
      reserveX,
      reserveY,
      minBinId,
      maxBinId,
      liquidity: userLiquidity,
      poolLiquidity,
      status,
      poolKey,
      poolActiveLiquidity,
      activeLiquidity: userActiveLiquidity,
    } satisfies InfinityBinPositionDetail
  } catch (error) {
    console.error('error getUserPosition', poolId, error)
    return undefined
  }
}
