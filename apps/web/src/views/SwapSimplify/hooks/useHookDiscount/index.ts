import { HOOK_CATEGORY } from '@pancakeswap/infinity-sdk'
import { Route } from '@pancakeswap/smart-router'
import { useMemo } from 'react'
import { useBrevisHookDiscount } from './useBrevisHookDiscount'
import { usePrimusHookDiscount } from './usePrimusHookDiscount'

export const useHookDiscount = (
  pools: Route['pools'],
): {
  category: HOOK_CATEGORY.BrevisDiscount | HOOK_CATEGORY.PrimusDiscount | undefined
  hookDiscount: Record<string, { discountFee: number; originalFee: number }>
} => {
  const brevisHookDiscount = useBrevisHookDiscount(pools)
  const primusHookDiscount = usePrimusHookDiscount(pools)

  return useMemo(() => {
    if (Object.keys(brevisHookDiscount).length > 0) {
      return {
        category: HOOK_CATEGORY.BrevisDiscount,
        hookDiscount: brevisHookDiscount,
      }
    }
    if (Object.keys(primusHookDiscount).length > 0) {
      return {
        category: HOOK_CATEGORY.PrimusDiscount,
        hookDiscount: primusHookDiscount,
      }
    }

    return {
      category: undefined,
      hookDiscount: {},
    }
  }, [brevisHookDiscount, primusHookDiscount])
}
