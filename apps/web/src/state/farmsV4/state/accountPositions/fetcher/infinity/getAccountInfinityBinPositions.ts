import { Protocol } from '@pancakeswap/farms'
import { BinPoolManagerAbi, INFINITY_SUPPORTED_CHAINS, parsePoolKey, POOL_TYPE } from '@pancakeswap/infinity-sdk'
import { Token } from '@pancakeswap/swap-sdk-core'
import { chainIdToExplorerInfoChainName, explorerApiClient } from 'state/info/api/client'
import { paths } from 'state/info/api/schema'
import { getPoolManagerAddress } from 'utils/addressHelpers'
import { publicClient } from 'utils/viem'
import { Address } from 'viem/accounts'
import { InfinityBinPositionDetail, POSITION_STATUS, ReserveOfBin } from '../../type'
import { getAccountInfinityBinPositionsOnChain } from './getAccountInfinityBinPositionsOnChain'

type Rows =
  paths['/cached/pools/positions/infinityBin/{chainName}/poolsByOwner/{owner}']['get']['responses']['200']['content']['application/json']['rows']

export const fetchBinPositions = async ({
  chainId,
  account,
  after,
}: {
  chainId: number
  account: Address
  after?: string
}) => {
  try {
    const chainName = chainIdToExplorerInfoChainName[chainId]
    if (!chainName || !INFINITY_SUPPORTED_CHAINS.includes(chainId)) {
      return []
    }
    const resp = await explorerApiClient.GET('/cached/pools/positions/infinityBin/{chainName}/poolsByOwner/{owner}', {
      params: {
        path: {
          chainName,
          owner: account,
        },
        query: {
          after,
        },
      },
    })

    if (!resp.data) {
      return []
    }

    const { rows, pageInfo } = resp.data

    if (pageInfo.hasNextPage) {
      return mergeBinPositions(rows, await fetchBinPositions({ chainId, account, after: pageInfo.endCursor }))
    }

    return rows
  } catch (e) {
    console.error(e)
    return []
  }
}

const mergeBinPositions = (rows: Rows, nextRows: Rows): Rows => {
  const result = [...rows]
  nextRows.forEach((row) => {
    const index = result.findIndex((r) => r.poolId === row.poolId)
    if (index > -1) {
      result[index].reserveOfBins.push(...row.reserveOfBins)
    } else {
      result.push(row)
    }
  })
  return result
}

export const parseBinPositions = async (rows: Rows, chainId: number): Promise<InfinityBinPositionDetail[]> => {
  const poolIds = rows.map((row) => row.poolId)
  const client = publicClient({ chainId })
  const binPoolManager = getPoolManagerAddress('Bin', chainId)

  if (!client || !binPoolManager) {
    return []
  }

  const slot0Calls = poolIds.map(
    (poolId) =>
      ({
        address: binPoolManager,
        abi: BinPoolManagerAbi,
        functionName: 'getSlot0',
        args: [poolId],
      } as const),
  )
  const slot0s = await client.multicall({
    contracts: slot0Calls,
    allowFailure: false,
  })

  const poolKeys = await client.multicall({
    contracts: poolIds.map(
      (poolId) =>
        ({
          address: binPoolManager,
          abi: BinPoolManagerAbi,
          functionName: 'poolIdToPoolKey',
          args: [poolId],
        } as const),
    ),
    allowFailure: false,
  })
  return rows.map((row, idx) => {
    let status = POSITION_STATUS.INACTIVE
    const activeId = slot0s[idx][0]
    const poolKey = parsePoolKey(POOL_TYPE.Bin, ...poolKeys[idx])

    let reserveX = BigInt(0)
    let reserveY = BigInt(0)
    let poolLiquidity = BigInt(0)
    let maxBinId: number | null = null
    let minBinId: number | null = null

    row.reserveOfBins.forEach((bin) => {
      const totalShares = BigInt(bin.totalShares)
      const userSharesOfBin = BigInt(bin.userSharesOfBin)
      const binReserveX = BigInt(bin.reserveX)
      const binReserveY = BigInt(bin.reserveY)
      const userReserveX = totalShares > 0n ? (userSharesOfBin * binReserveX) / totalShares : 0n
      const userReserveY = totalShares > 0n ? (userSharesOfBin * binReserveY) / totalShares : 0n
      reserveX += BigInt(userReserveX)
      reserveY += BigInt(userReserveY)
      if (userSharesOfBin > 0n) {
        poolLiquidity += BigInt(bin.binLiquidity)
        maxBinId = maxBinId ?? bin.binId
        minBinId = minBinId ?? bin.binId
        if (bin.binId > maxBinId) {
          maxBinId = bin.binId
        }
        if (bin.binId < minBinId) {
          minBinId = bin.binId
        }
      }
    })

    const reserveOfBins: ReserveOfBin[] = row.reserveOfBins.map(
      (bin) =>
        ({
          ...bin,
          reserveX: BigInt(bin.reserveX),
          reserveY: BigInt(bin.reserveY),
          userSharesOfBin: BigInt(bin.userSharesOfBin ?? 0),
          binLiquidity: BigInt(bin.binLiquidity),
          totalShares: BigInt(bin.totalShares),
        } satisfies ReserveOfBin),
    )

    const activeBin = reserveOfBins.find((bin) => bin.binId === activeId)
    if (activeBin && activeBin.userSharesOfBin > 0n) {
      status = POSITION_STATUS.ACTIVE
    }

    const liquidity = row.reserveOfBins.reduce((acc, bin) => acc + BigInt(bin.userSharesOfBin), 0n)
    const activeLiquidity = activeBin ? BigInt(activeBin.userSharesOfBin ?? 0) : 0n

    if (liquidity === 0n) {
      status = POSITION_STATUS.CLOSED
    }

    return {
      chainId,
      protocol: Protocol.InfinityBIN,
      poolId: row.poolId as `0x${string}`,
      status,
      activeId,
      reserveX,
      reserveY,
      maxBinId,
      minBinId,
      reserveOfBins,
      liquidity,
      poolLiquidity,
      poolActiveLiquidity: activeLiquidity,
      activeLiquidity,
      poolKey,
    } satisfies InfinityBinPositionDetail
  })
}

export const getAccountInfinityBinPositions = async (
  account: Address,
  chainId: number,
): Promise<InfinityBinPositionDetail[]> => {
  return fetchBinPositions({ chainId, account: account! }).then((res) => parseBinPositions(res, chainId))
}

export const getAccountInfinityBinPositionsWithFallback = async (
  chainId: number,
  account: Address,
  userAddedTokens: Token[],
): Promise<InfinityBinPositionDetail[]> => {
  try {
    return getAccountInfinityBinPositions(account, chainId)
  } catch (error) {
    console.error('error get user bin positions from be', chainId, error)
    return getAccountInfinityBinPositionsOnChain({
      chainId,
      account: account!,
      userAddedTokens,
    })
  }
}
