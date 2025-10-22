import { Address, Hex, isAddress, isAddressEqual, PublicClient, zeroAddress } from 'viem'
import { BinPoolManagerAbi, CLPoolManagerAbi } from '../abis'
import {
  INFI_BIN_POOL_MANAGER_ADDRESSES,
  INFI_CL_POOL_MANAGER_ADDRESSES,
  INFINITY_SUPPORTED_CHAINS,
  InfinitySupportedChains,
} from '../constants'
import { POOL_TYPE, PoolKey, PoolType } from '../types'
import { decodeBinPoolParameters, decodeCLPoolParameters } from './decodePoolParameters'

export const parsePoolKey = <T extends PoolType = 'CL' | 'Bin'>(
  poolType: T,
  currency0: Address,
  currency1: Address,
  hooks: Address,
  poolManager: Address,
  fee: number,
  parameters: Address
) => {
  return {
    currency0,
    currency1,
    hooks,
    poolManager,
    fee,
    parameters: poolType === POOL_TYPE.CLAMM ? decodeCLPoolParameters(parameters) : decodeBinPoolParameters(parameters),
  } as PoolKey<T>
}

export const poolIdToPoolKey = async <TPoolType extends PoolType = 'CL' | 'Bin'>({
  poolId,
  poolType,
  publicClient,
}: {
  poolId: Hex | undefined
  poolType?: TPoolType | undefined
  publicClient: PublicClient | undefined
}): Promise<PoolKey<TPoolType> | undefined> => {
  const chainId = publicClient?.chain?.id as InfinitySupportedChains

  if (!publicClient || !chainId || !poolId || !INFINITY_SUPPORTED_CHAINS.includes(chainId)) return undefined

  if (!poolType) {
    const clPoolManagerAddress = INFI_CL_POOL_MANAGER_ADDRESSES[chainId]
    const binPoolManagerAddress = INFI_BIN_POOL_MANAGER_ADDRESSES[chainId]
    const [{ result: clPoolKey }, { result: binPoolKey }] = await publicClient.multicall({
      contracts: [
        {
          address: clPoolManagerAddress,
          functionName: 'poolIdToPoolKey',
          abi: CLPoolManagerAbi,
          args: [poolId],
        },
        {
          address: binPoolManagerAddress,
          functionName: 'poolIdToPoolKey',
          abi: BinPoolManagerAbi,
          args: [poolId],
        },
      ],
    })
    const clPoolManager = clPoolKey?.[3]
    const binPoolManager = binPoolKey?.[3]
    if (clPoolManager && isAddress(clPoolManager) && !isAddressEqual(clPoolManager, zeroAddress)) {
      return parsePoolKey(POOL_TYPE.CLAMM, ...clPoolKey) as PoolKey<TPoolType>
    }
    if (binPoolManager && isAddress(binPoolManager) && !isAddressEqual(binPoolManager, zeroAddress)) {
      return parsePoolKey(POOL_TYPE.Bin, ...binPoolKey) as PoolKey<TPoolType>
    }
    return undefined
  }

  if (poolType === POOL_TYPE.CLAMM) {
    const clPoolKey = await publicClient.readContract({
      address: INFI_CL_POOL_MANAGER_ADDRESSES[chainId],
      functionName: 'poolIdToPoolKey',
      abi: CLPoolManagerAbi,
      args: [poolId],
    })
    const clPoolManager = clPoolKey?.[3]
    if (clPoolManager && isAddress(clPoolManager) && !isAddressEqual(clPoolManager, zeroAddress)) {
      return parsePoolKey(POOL_TYPE.CLAMM, ...clPoolKey) as PoolKey<TPoolType>
    }
    return undefined
  }

  if (poolType === POOL_TYPE.Bin) {
    const binPoolKey = await publicClient.readContract({
      address: INFI_BIN_POOL_MANAGER_ADDRESSES[chainId],
      functionName: 'poolIdToPoolKey',
      abi: BinPoolManagerAbi,
      args: [poolId],
    })
    const binPoolManager = binPoolKey?.[3]
    if (binPoolManager && isAddress(binPoolManager) && !isAddressEqual(binPoolManager, zeroAddress)) {
      return parsePoolKey(POOL_TYPE.Bin, ...binPoolKey) as PoolKey<TPoolType>
    }
    return undefined
  }

  return undefined
}

export const binPoolIdToPoolKey = async ({
  poolId,
  publicClient,
}: {
  poolId: Hex | undefined
  publicClient: PublicClient | undefined
}) => {
  return poolIdToPoolKey({ poolId, poolType: POOL_TYPE.Bin, publicClient })
}

export const clPoolIdToPoolKey = async ({
  poolId,
  publicClient,
}: {
  poolId: Hex | undefined
  publicClient: PublicClient | undefined
}) => {
  return poolIdToPoolKey({ poolId, poolType: POOL_TYPE.CLAMM, publicClient })
}
