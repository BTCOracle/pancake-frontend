import { ChainId } from '@pancakeswap/chains'

import { HOOK_CATEGORY, POOL_TYPE, type HookData, type PoolType } from '../../types'
import { BIN_DYNAMIC_FEE_HOOKS_BY_CHAIN, CL_DYNAMIC_FEE_HOOKS_BY_CHAIN } from './dynamicFeeHook'

export const CL_DYNAMIC_HOOK = {
  address: CL_DYNAMIC_FEE_HOOKS_BY_CHAIN[ChainId.BSC_TESTNET],
  name: 'Dynamic Fees (CLAMM)',
  poolType: POOL_TYPE.CLAMM,
  description: 'It will set lpFee to 3000 i.e 0.3% in afterInitialize',
  github: 'https://testnet.bscscan.com/address/0xEce0656EeFA49C16a98447807f62714496aef518',
  category: [HOOK_CATEGORY.DynamicFees],
  isVerified: true,
  isUpgradable: false,
  hooksRegistration: {
    afterInitialize: true,
    beforeSwap: true,
  },
}

const BIN_DYNAMIC_HOOK = {
  address: BIN_DYNAMIC_FEE_HOOKS_BY_CHAIN[ChainId.BSC_TESTNET],
  name: 'Dynamic Fees (Bin)',
  poolType: POOL_TYPE.Bin,
  description: 'It will set lpFee to 3000 i.e 0.3% in afterInitialize',
  github: 'https://testnet.bscscan.com/address/0x870c167eFCEEaDd081EE783Af8c5c7b436f1d3Ce',
  category: [HOOK_CATEGORY.DynamicFees],
  isVerified: true,
  isUpgradable: false,
  hooksRegistration: {
    afterInitialize: true,
    beforeAddLiquidity: true,
    beforeSwap: true,
  },
}
const dynamicHooksList: HookData[] = [CL_DYNAMIC_HOOK, BIN_DYNAMIC_HOOK]

export const bscTestnetHooksList: HookData[] = [
  ...dynamicHooksList,
  {
    address: '0x0A6440c9cfb5f28BE699a9e4e83BF8A89de72498',
    name: 'veCake Exclusive (CLAMM)',
    poolType: POOL_TYPE.CLAMM,
    description:
      'This multi-feature contract allows for liquidity locks, TWAMM (Time weighted average market maker), and impermanent loss hedging on pools. Check the Github readme for more details.',
    github: 'https://testnet.bscscan.com/address/0x0A6440c9cfb5f28BE699a9e4e83BF8A89de72498',
    category: [HOOK_CATEGORY.Oracle, HOOK_CATEGORY.JIT, HOOK_CATEGORY.Others],
    creator: 'https://github.com/pancakeswap',
    audit: 'https://github.com/pancakeswap',
    isVerified: true,
    isUpgradable: false,
    hooksRegistration: {
      beforeSwap: true,
    },
  },
  {
    address: '0x0284ceB8F3Ad42131A6feB69E3F324990837Ef2c',
    name: 'veCake Exclusive (Bin)',
    poolType: POOL_TYPE.Bin,
    description: 'Exclusive to holders of veCake (0x3c3C66383690d3cf08205cD3Ba862bc4F6348829)',
    github: 'https://testnet.bscscan.com/address/0x0284ceB8F3Ad42131A6feB69E3F324990837Ef2c',
    category: [HOOK_CATEGORY.Others],
    isVerified: true,
    isUpgradable: false,
    hooksRegistration: {
      beforeSwap: true,
    },
  },
]

/**
 * Dynamic hook for each pool type for auto-selection on "Dynamic" fee tier
 */
export const bscTestnetDynamicHooks: Record<PoolType, HookData> = {
  CL: CL_DYNAMIC_HOOK,
  Bin: BIN_DYNAMIC_HOOK,
}
