import { Protocol } from '@pancakeswap/farms'
import {
  CLPositionManagerAbi,
  INFINITY_SUPPORTED_CHAINS,
  PoolKey,
  decodeCLPoolParameters,
  getPoolId,
} from '@pancakeswap/infinity-sdk'
import uniq from 'lodash/uniq'
import { chainIdToExplorerInfoChainName, explorerApiClient } from 'state/info/api/client'
import { paths } from 'state/info/api/schema'
import { getInfinityPositionManagerAddress } from 'utils/addressHelpers'
import { publicClient } from 'utils/viem'
import { Address, zeroAddress } from 'viem'
import isUndefinedOrNull from '@pancakeswap/utils/isUndefinedOrNull'
import { InfinityCLPositionDetail, POSITION_STATUS } from '../../type'
import { getAccountInfinityCLTokenIds, getAccountInfinityCLTokenIdsRecently } from './getAccountInfinityCLTokenIds'
import { CLPoolInfo, fetchPoolInfo } from './getPoolInfo'

interface RawPoolKey extends Omit<PoolKey, 'parameters'> {
  parameters: Address
}

const decodePoolKey = (rawPoolKey: RawPoolKey) => {
  const { parameters } = rawPoolKey
  const decodeParameters = decodeCLPoolParameters(parameters ?? zeroAddress)
  return {
    ...rawPoolKey,
    parameters: decodeParameters,
  }
}

const getPoolStatus = ({
  liquidity,
  tickCurrent,
  tickLower,
  tickUpper,
}: {
  liquidity?: bigint
  tickCurrent?: number
  tickLower?: number
  tickUpper?: number
}) => {
  if (liquidity === 0n) {
    return POSITION_STATUS.CLOSED
  }
  if (
    !isUndefinedOrNull(tickCurrent) &&
    !isUndefinedOrNull(tickLower) &&
    !isUndefinedOrNull(tickUpper) &&
    (tickCurrent! < tickLower! || tickCurrent! >= tickUpper!)
  ) {
    return POSITION_STATUS.INACTIVE
  }
  return POSITION_STATUS.ACTIVE
}

export const readCLPositions = async (chainId: number, tokenIds: number[]): Promise<InfinityCLPositionDetail[]> => {
  const positionManagerAddress = getInfinityPositionManagerAddress('CL', chainId)
  const client = publicClient({ chainId })

  if (!client || !positionManagerAddress || !tokenIds.length) {
    return []
  }

  const positionCalls = tokenIds.map((tokenId) => {
    return {
      abi: CLPositionManagerAbi,
      address: positionManagerAddress,
      functionName: 'positions',
      args: [tokenId] as const,
    } as const
  })
  const positions = await client
    .multicall({
      contracts: positionCalls,
      allowFailure: true,
    })
    .then((res) => res.map((item) => item.result))

  const validPositions = positions.filter((p): p is NonNullable<typeof p> => Boolean(p))
  const poolCalls = validPositions.map((pos) => {
    const [poolKey] = pos
    const poolId = poolKey ? getPoolId(decodePoolKey(poolKey)) : undefined
    return fetchPoolInfo(poolId, chainId, 'CL')
  })

  const pools = await Promise.allSettled<CLPoolInfo | undefined>(poolCalls)

  return validPositions.map((pos, index) => {
    const [poolKey_, tickLower, tickUpper, liquidity, feeGrowthInside0LastX128, feeGrowthInside1LastX128] = pos
    const poolKey = decodePoolKey(poolKey_)
    const { currency0, currency1, parameters } = poolKey
    const poolRes = pools[index]
    const pool = poolRes.status === 'fulfilled' ? poolRes.value : undefined
    const poolId = getPoolId(poolKey)

    return {
      status: getPoolStatus({ tickUpper, tickLower, tickCurrent: pool?.tick, liquidity }),
      poolKey,
      tokenId: BigInt(tokenIds[index]),
      token0: currency0,
      token1: currency1,
      fee: pool?.lpFee,
      dynamic: pool?.dynamic,
      tickLower,
      tickUpper,
      tickSpacing: parameters.tickSpacing,
      liquidity,
      feeGrowthInside0LastX128,
      feeGrowthInside1LastX128,
      chainId,
      protocol: Protocol.InfinityCLAMM,
      isStaked: false,
      poolId,
    } as InfinityCLPositionDetail
  })
}

type InfinityCLPositionItem =
  paths['/cached/pools/positions/infinityCl/{chainName}/{owner}']['get']['responses']['200']['content']['application/json']['rows'][0]
export const fetchAccountInfinityCLPositions = async (
  chainId: number,
  account: Address,
  after?: string,
): Promise<InfinityCLPositionItem[]> => {
  try {
    const chainName = chainIdToExplorerInfoChainName[chainId]
    if (!chainName) return []

    const resp = await explorerApiClient.GET('/cached/pools/positions/infinityCl/{chainName}/{owner}', {
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

    if (!resp.data) return []

    const { rows, endCursor, hasNextPage } = resp.data

    if (hasNextPage) {
      return [...rows, ...(await fetchAccountInfinityCLPositions(chainId, account, endCursor))]
    }

    return rows
  } catch (e) {
    console.error(e)
    return []
  }
}

export const getAccountInfinityCLPositions = async (
  chainId: number,
  account: Address,
): Promise<InfinityCLPositionDetail[]> => {
  const [rows, tokenIdsRecently] = await Promise.all([
    fetchAccountInfinityCLPositions(chainId, account),
    getAccountInfinityCLTokenIdsRecently(chainId, account),
  ])
  const tokenIds = uniq([...tokenIdsRecently, ...rows.map((row) => Number(row.id))])
  return readCLPositions(chainId, tokenIds)
}

export const getAccountInfinityCLPositionsOnChain = async (
  chainId: number,
  account: Address,
): Promise<InfinityCLPositionDetail[]> => {
  const tokenIds = await getAccountInfinityCLTokenIds(chainId, account)
  return readCLPositions(chainId, tokenIds)
}

export const getAccountInfinityCLPositionsWithFallback = async (
  chainId: number,
  account: Address,
): Promise<InfinityCLPositionDetail[]> => {
  try {
    if (!INFINITY_SUPPORTED_CHAINS.includes(chainId)) return []
    return await getAccountInfinityCLPositions(chainId, account)
  } catch (e) {
    console.error(e)
    try {
      return getAccountInfinityCLPositionsOnChain(chainId, account)
    } catch (e2) {
      console.error(e2)
      return []
    }
  }
}
