import { PublicClient, zeroAddress } from 'viem'
import { BinPoolManagerAbi, CLPoolManagerAbi } from '../abis'
import {
  INFI_BIN_POOL_MANAGER_ADDRESSES,
  INFI_CL_POOL_MANAGER_ADDRESSES,
  INFINITY_SUPPORTED_CHAINS,
  InfinitySupportedChains,
} from '../constants'
import { PoolKey } from '../types'
import { getPoolId } from './getPoolId'

export const getIsInitializedByPoolKey = async (publicClient: PublicClient, poolKey: PoolKey) => {
  const chainId = publicClient.chain?.id

  if (!chainId || !INFINITY_SUPPORTED_CHAINS.includes(chainId)) return false

  const isCLPool = (poolKey as PoolKey<'CL'>).parameters.tickSpacing !== undefined

  const positionManagerAddress = isCLPool
    ? INFI_CL_POOL_MANAGER_ADDRESSES[chainId as InfinitySupportedChains]
    : INFI_BIN_POOL_MANAGER_ADDRESSES[chainId as InfinitySupportedChains]

  try {
    const poolKey_ = await publicClient.readContract({
      address: positionManagerAddress,
      abi: isCLPool ? CLPoolManagerAbi : BinPoolManagerAbi,
      functionName: 'poolIdToPoolKey',
      args: [getPoolId(poolKey)],
    })
    return poolKey_[3] !== zeroAddress
  } catch (error) {
    console.error(error)
    return false
  }
}
