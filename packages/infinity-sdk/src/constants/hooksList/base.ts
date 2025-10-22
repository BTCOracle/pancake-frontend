import { ChainId } from '@pancakeswap/chains'

import { HOOK_CATEGORY, HookType, POOL_TYPE, type HookData, type PoolType } from '../../types'
import { CL_DYNAMIC_FEE_HOOKS_BY_CHAIN } from './dynamicFeeHook'

export const CL_DYNAMIC_HOOK: HookData = {
  address: CL_DYNAMIC_FEE_HOOKS_BY_CHAIN[ChainId.BASE],
  name: 'Dynamic Fees (CLAMM)',
  poolType: POOL_TYPE.CLAMM,
  description:
    'PancakeSwap’s Dynamic Fee Hook adjusts swap fees based on market volatility—penalizing arbitrageurs and rewarding LPs during turbulence, while keeping fees low in stable conditions for smoother trading.',
  github: 'https://github.com/pancakeswap/',
  learnMoreLink: 'https://docs.pancakeswap.finance/trade/pancakeswap-infinity/hooks/dynamic-fee-hook',
  category: [HOOK_CATEGORY.DynamicFees],
  isVerified: false,
  isUpgradable: false,
  creator: 'https://github.com/pancakeswap/',
  defaultFee: 500,
  hooksRegistration: {
    afterInitialize: true,
    beforeSwap: true,
    afterSwap: true,
  },
  hookType: HookType.Universal,
}

const dynamicHooksList: HookData[] = [CL_DYNAMIC_HOOK]

export const baseHooksList: HookData[] = [...dynamicHooksList]

/**
 * Dynamic hook for each pool type for auto-selection on "Dynamic" fee tier
 */
export const baseDynamicHooks: Record<PoolType, HookData | undefined> = {
  CL: CL_DYNAMIC_HOOK,
  Bin: undefined,
}
