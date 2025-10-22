import { Hex, PublicClient } from 'viem'
import { findHook, hooksList } from '../constants'
import { poolIdToPoolKey } from './poolIdToPoolKey'
import { HookData, POOL_TYPE, PoolType } from '../types'

export const findHookByAddress = async ({
  poolId,
  publicClient,
  chainId,
  poolType,
  hookAddress,
}: {
  poolId: Hex | undefined
  chainId: keyof typeof hooksList
  publicClient: PublicClient | undefined
  poolType: PoolType
  hookAddress?: `0x${string}`
}) => {
  if (!hookAddress) {
    return null
  }
  const whiteListedHook = findHook(hookAddress, chainId)
  if (whiteListedHook) {
    return whiteListedHook
  }

  const poolKey = await poolIdToPoolKey({ poolId, publicClient, poolType })

  const hook: HookData = {
    address: hookAddress,
    poolType: poolType === 'CL' ? POOL_TYPE.CLAMM : POOL_TYPE.Bin,
    hooksRegistration: poolKey?.parameters.hooksRegistration,
  }
  return hook
}
