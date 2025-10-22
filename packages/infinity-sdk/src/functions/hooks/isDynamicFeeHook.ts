import { ChainId } from '@pancakeswap/chains'
import { Address } from 'viem'

import { cacheByMem } from '@pancakeswap/utils/cacheByMem'
import { findHook, INFINITY_SUPPORTED_CHAINS } from '../../constants'
import { HOOK_CATEGORY } from '../../types'

export const isDynamicFeeHook = cacheByMem((chainId: ChainId, hook?: Address) => {
  if (!hook) return false
  const relatedHook = findHook(hook, chainId)
  if (relatedHook?.category?.includes(HOOK_CATEGORY.DynamicFees)) {
    return true
  }
  return false
})

export const isDynamicFeeHookForSupportedChains = cacheByMem((hook?: Address) => {
  if (!hook) return false
  for (const chainId of INFINITY_SUPPORTED_CHAINS) {
    if (isDynamicFeeHook(chainId, hook)) {
      return true
    }
  }
  return false
})
