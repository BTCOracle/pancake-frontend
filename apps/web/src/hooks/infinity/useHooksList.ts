import { ChainId, UnifiedChainId } from '@pancakeswap/chains'
import {
  HOOK_CATEGORY,
  type HookData,
  HookType,
  type PoolType,
  dynamicHooksList,
  hooksList,
} from '@pancakeswap/infinity-sdk'
import keyBy from 'lodash/keyBy'
import { useMemo } from 'react'
import { safeGetAddress } from 'utils'
import { Address } from 'viem'
import { usePoolKeyByPoolId } from './usePoolKeyByPoolId'

export const useHooksList = (chainId?: UnifiedChainId, poolType?: PoolType): HookData[] => {
  return useMemo(() => {
    if (!chainId) {
      return []
    }
    const list = hooksList[chainId] as HookData[] | undefined
    if (!list) {
      return []
    }
    if (!poolType) {
      return list
    }
    return list.filter((h) => h.poolType === poolType && h.hookType !== HookType.PerPool)
  }, [chainId, poolType])
}

export const useHooksMap = (chainId?: UnifiedChainId): Record<string, HookData> => {
  const list = useHooksList(chainId)
  return useMemo(() => keyBy(list, (l) => safeGetAddress(l.address) ?? ''), [list])
}

export const useBrevisHooks = (chainId?: ChainId): HookData[] => {
  return useMemo(() => {
    if (!chainId) {
      return []
    }
    const list = hooksList[chainId] as HookData[] | undefined
    if (!list) {
      return []
    }
    return list.filter((h) => h.category?.includes(HOOK_CATEGORY.BrevisDiscount))
  }, [chainId])
}

export const usePrimusHooks = (chainId?: ChainId): HookData[] => {
  return useMemo(() => {
    if (!chainId) {
      return []
    }
    const list = hooksList[chainId] as HookData[] | undefined
    if (!list) {
      return []
    }
    return list.filter((h) => h.category?.includes(HOOK_CATEGORY.PrimusDiscount))
  }, [chainId])
}

export const useHookByAddress = (chainId?: ChainId, address?: HookData['address']): HookData | undefined => {
  const hooksMap = useHooksMap(chainId)
  return useMemo(() => (safeGetAddress(address) ? hooksMap[safeGetAddress(address)!] : undefined), [hooksMap, address])
}

export const useHookByPoolId = (chainId?: UnifiedChainId, poolId?: Address): HookData | undefined => {
  const { data: poolKey } = usePoolKeyByPoolId(poolId, chainId)
  const hooksMap = useHooksMap(chainId)

  return useMemo(
    () => (safeGetAddress(poolKey?.hooks) ? hooksMap[safeGetAddress(poolKey?.hooks)!] : undefined),
    [hooksMap, poolKey?.hooks],
  )
}

export const useDefaultDynamicHook = (chainId?: ChainId, poolType?: PoolType) =>
  useMemo(
    () => (chainId && dynamicHooksList[chainId] ? dynamicHooksList[chainId][poolType] : undefined),
    [chainId, poolType],
  )
