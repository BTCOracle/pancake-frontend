import {
  BinPoolManagerAbi,
  CLPoolManagerAbi,
  DYNAMIC_FEE_FLAG,
  PoolKey,
  PoolType,
  decodePoolKey,
  type Slot0,
} from '@pancakeswap/infinity-sdk'
import { zeroAddress } from '@pancakeswap/price-api-sdk'
import { FeeAmount } from '@pancakeswap/v3-sdk'
import { getPoolManagerAddress } from 'utils/addressHelpers'
import { publicClient } from 'utils/viem'
import { Address, ContractFunctionReturnType, Prettify } from 'viem'

export interface IPoolInfo {
  poolType: PoolType
  currency0: Address
  currency1: Address
  hooks: Address
  fee: FeeAmount
  sqrtPriceX96: bigint
  liquidity: bigint
  tick: number
  feeProtocol?: number
  tickSpacing: number
  hooksRegistration: any
}

export type CLPoolInfo = Prettify<
  PoolKey<'CL'> & {
    poolType: 'CL'
    sqrtPriceX96: bigint
    liquidity: bigint
    tick: number
    protocolFee: number
    lpFee: number
    dynamic: boolean
  }
>

export type BinPoolInfo = Prettify<
  PoolKey<'Bin'> & {
    poolType: 'Bin'
    activeId: number
    protocolFee: number
    lpFee: number
    dynamic: boolean
  }
>
export type InfinityPoolInfo = CLPoolInfo | BinPoolInfo

// @note: a valid pool key is a pool that has a valid pool manager address
const isValidPoolKeyResult = (
  result?: ContractFunctionReturnType<typeof CLPoolManagerAbi, 'view', 'poolIdToPoolKey'>,
) => result && result.length === 6 && result[3] !== zeroAddress

const parsePoolKeyResult = <
  TPoolType extends PoolType,
  TResult extends TPoolType extends 'CL'
    ? Prettify<ContractFunctionReturnType<typeof CLPoolManagerAbi, 'view', 'poolIdToPoolKey'>>
    : Prettify<ContractFunctionReturnType<typeof BinPoolManagerAbi, 'view', 'poolIdToPoolKey'>>,
>(
  poolType: TPoolType,
  result: TResult,
): PoolKey<TPoolType> => {
  const [currency0, currency1, hooks, poolManager, fee, parameters] = result

  return decodePoolKey(
    {
      currency0,
      currency1,
      hooks,
      poolManager,
      fee,
      parameters,
    },
    poolType,
  )
}

const parseSlot0 = <
  TPoolType extends PoolType,
  TSlot0 extends TPoolType extends 'CL'
    ? ContractFunctionReturnType<typeof CLPoolManagerAbi, 'view', 'getSlot0'>
    : ContractFunctionReturnType<typeof BinPoolManagerAbi, 'view', 'getSlot0'>,
>(
  poolType: TPoolType,
  slot0: TSlot0,
): Slot0<TPoolType> => {
  if (poolType === 'CL') {
    const [sqrtPriceX96, tick, protocolFee, lpFee] = slot0 as ContractFunctionReturnType<
      typeof CLPoolManagerAbi,
      'view',
      'getSlot0'
    >
    return {
      sqrtPriceX96,
      tick,
      protocolFee,
      lpFee,
    } as Slot0<TPoolType>
  }

  const [activeId, protocolFee, lpFee] = slot0 as ContractFunctionReturnType<
    typeof BinPoolManagerAbi,
    'view',
    'getSlot0'
  >
  return {
    activeId,
    protocolFee,
    lpFee,
    dynamic: lpFee === DYNAMIC_FEE_FLAG,
  } as Slot0<TPoolType>
}

export const fetchPoolInfo = async <
  TPoolType extends PoolType,
  TPoolInfo extends TPoolType extends 'CL' ? CLPoolInfo : TPoolType extends 'Bin' ? BinPoolInfo : InfinityPoolInfo,
>(
  poolId?: Address,
  chainId?: number,
  poolType?: TPoolType,
): Promise<TPoolInfo | undefined> => {
  if (!poolId || !chainId) {
    return undefined
  }

  if (poolType === 'CL') {
    return fetchCLPoolInfo(poolId, chainId) as Promise<TPoolInfo | undefined>
  }

  if (poolType === 'Bin') {
    return fetchBinPoolInfo(poolId, chainId) as Promise<TPoolInfo | undefined>
  }
  try {
    const [clPoolInfo, binPoolInfo] = await Promise.all([
      fetchCLPoolInfo(poolId, chainId),
      fetchBinPoolInfo(poolId, chainId),
    ])

    return (clPoolInfo ?? binPoolInfo) as TPoolInfo | undefined
  } catch (err) {
    console.error(err)
    return undefined
  }
}

export const fetchCLPoolInfo = async (poolId?: Address, chainId?: number): Promise<CLPoolInfo | undefined> => {
  if (!poolId || !chainId) {
    return undefined
  }
  const poolManagerAddress = getPoolManagerAddress('CL', chainId)

  try {
    const calls = [
      {
        address: poolManagerAddress,
        functionName: 'poolIdToPoolKey',
        abi: CLPoolManagerAbi,
        args: [poolId],
      },
      {
        address: poolManagerAddress,
        functionName: 'getSlot0',
        abi: CLPoolManagerAbi,
        args: [poolId],
      },
      {
        address: poolManagerAddress,
        functionName: 'getLiquidity',
        abi: CLPoolManagerAbi,
        args: [poolId],
      },
    ] as const

    const results = await publicClient({ chainId }).multicall({
      contracts: calls,
      allowFailure: false,
    })

    const [poolKey, slot0, liquidity] = results

    if (!isValidPoolKeyResult(poolKey)) return undefined

    const parsedPoolKey = parsePoolKeyResult('CL', poolKey)

    return {
      poolType: 'CL',
      ...parsedPoolKey,
      ...parseSlot0('CL', slot0),
      dynamic: parsedPoolKey.fee === DYNAMIC_FEE_FLAG,
      liquidity,
    } satisfies CLPoolInfo
  } catch (error) {
    console.error(error)
    return undefined
  }
}

export const fetchBinPoolInfo = async (poolId?: Address, chainId?: number): Promise<BinPoolInfo | undefined> => {
  if (!poolId || !chainId) {
    return undefined
  }
  const poolManagerAddress = getPoolManagerAddress('Bin', chainId)

  try {
    const calls = [
      {
        address: poolManagerAddress,
        functionName: 'poolIdToPoolKey',
        abi: BinPoolManagerAbi,
        args: [poolId],
      },
      {
        address: poolManagerAddress,
        functionName: 'getSlot0',
        abi: BinPoolManagerAbi,
        args: [poolId],
      },
    ] as const
    const results = await publicClient({ chainId }).multicall({
      contracts: calls,
      allowFailure: false,
    })

    const [poolKey, slot0] = results

    if (!isValidPoolKeyResult(poolKey)) return undefined

    const parsedPoolKey = parsePoolKeyResult('Bin', poolKey)

    return {
      poolType: 'Bin',
      ...parsedPoolKey,
      ...parseSlot0('Bin', slot0),
      dynamic: parsedPoolKey.fee === DYNAMIC_FEE_FLAG,
    } satisfies BinPoolInfo
  } catch (error) {
    console.error(error)
    return undefined
  }
}
