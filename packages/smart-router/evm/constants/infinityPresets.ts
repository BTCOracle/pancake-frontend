import { ChainId } from '@pancakeswap/chains'
import {
  BIN_DYNAMIC_FEE_HOOK_REGISTRATION_BITMAP,
  BIN_DYNAMIC_FEE_HOOKS_BY_CHAIN,
  CL_DYNAMIC_FEE_HOOK_REGISTRATION_BITMAP,
  CL_DYNAMIC_FEE_HOOKS_BY_CHAIN,
  DYNAMIC_FEE_FLAG,
  encodeHooksRegistration,
  HOOK_CATEGORY,
  HookData,
  hooksList,
  POOL_TYPE,
  type InfinitySupportedChains,
  type PoolKey,
  type PoolType,
} from '@pancakeswap/infinity-sdk'
import { zeroAddress, type Address, type Hex } from 'viem'

export type HookPreset<P extends PoolType> = {
  address: Address
  registrationBitmap?: Hex | number
  poolKeyOverride?: Partial<PoolKey<P>>
}

export const EMPTY_HOOK = {
  address: zeroAddress,
}

function getCLHookPreset(x: HookData) {
  const hook = {
    address: x.address,
    registrationBitmap: encodeHooksRegistration(x.hooksRegistration),
    poolKeyOverride: undefined as Partial<PoolKey<'CL'>> | undefined,
  }

  if (hook.address === CL_DYNAMIC_FEE_HOOKS_BY_CHAIN[ChainId.BSC] || x.category?.includes(HOOK_CATEGORY.DynamicFees)) {
    hook.poolKeyOverride = {
      fee: DYNAMIC_FEE_FLAG,
    }
  }
  return hook
}

export const CL_HOOK_PRESETS_BY_CHAIN: { [key in InfinitySupportedChains]: HookPreset<'CL'>[] } = {
  [ChainId.BSC]: [
    EMPTY_HOOK,
    ...hooksList[ChainId.BSC]
      .filter((x) => x.poolType === POOL_TYPE.CLAMM)
      .map((x) => {
        return getCLHookPreset(x)
      }),
  ],
  [ChainId.BSC_TESTNET]: [
    EMPTY_HOOK,
    {
      address: CL_DYNAMIC_FEE_HOOKS_BY_CHAIN[ChainId.BSC_TESTNET],
      registrationBitmap: CL_DYNAMIC_FEE_HOOK_REGISTRATION_BITMAP[ChainId.BSC_TESTNET],
      poolKeyOverride: {
        fee: DYNAMIC_FEE_FLAG,
      },
    },
  ],
  [ChainId.BASE]: [
    EMPTY_HOOK,
    ...hooksList[ChainId.BASE]
      .filter((x) => x.poolType === POOL_TYPE.CLAMM)
      .map((x) => {
        return getCLHookPreset(x)
      }),
  ],
  [ChainId.SEPOLIA]: [EMPTY_HOOK],
}
function getBinHookPreset(x: HookData) {
  const hook = {
    address: x.address,
    registrationBitmap: encodeHooksRegistration(x.hooksRegistration),
    poolKeyOverride: undefined as Partial<PoolKey<'Bin'>> | undefined,
  }

  if (
    // hook.address === BIN_DYNAMIC_FEE_HOOKS_BY_CHAIN[ChainId.BSC] || //@notice: open it when we have the official bin hook on BSC
    x.category?.includes(HOOK_CATEGORY.DynamicFees)
  ) {
    hook.poolKeyOverride = {
      fee: DYNAMIC_FEE_FLAG,
    }
  }
  return hook
}
export const BIN_HOOK_PRESETS_BY_CHAIN: { [key in InfinitySupportedChains]: HookPreset<'Bin'>[] } = {
  [ChainId.BSC]: [
    EMPTY_HOOK,
    ...hooksList[ChainId.BSC]
      .filter((x) => x.poolType === POOL_TYPE.Bin)
      .map((x) => {
        return getBinHookPreset(x)
      }),
  ],
  [ChainId.BSC_TESTNET]: [
    EMPTY_HOOK,
    {
      address: BIN_DYNAMIC_FEE_HOOKS_BY_CHAIN[ChainId.BSC_TESTNET],
      registrationBitmap: BIN_DYNAMIC_FEE_HOOK_REGISTRATION_BITMAP,
      poolKeyOverride: {
        fee: DYNAMIC_FEE_FLAG,
      },
    },
  ],
  [ChainId.BASE]: [
    EMPTY_HOOK,
    ...hooksList[ChainId.BASE]
      .filter((x) => x.poolType === POOL_TYPE.Bin)
      .map((x) => {
        return getBinHookPreset(x)
      }),
  ],
  [ChainId.SEPOLIA]: [EMPTY_HOOK],
}

type CLPoolPreset = {
  fee: number
  tickSpacing: number
}

export enum InfinityFeeTier {
  LOWEST = 67,
  LOW = 335,
  MEDIUM = 1676,
  HIGH = 6722,
}

const DEFAULT_CL_PRESETS: CLPoolPreset[] = [
  {
    fee: InfinityFeeTier.LOWEST,
    tickSpacing: 1,
  },
  {
    fee: InfinityFeeTier.LOW,
    tickSpacing: 10,
  },
  {
    fee: InfinityFeeTier.MEDIUM,
    tickSpacing: 50,
  },
  {
    fee: InfinityFeeTier.HIGH,
    tickSpacing: 200,
  },
]

export const CL_PRESETS_BY_CHAIN: { [key in InfinitySupportedChains]: CLPoolPreset[] } = {
  [ChainId.BSC]: DEFAULT_CL_PRESETS,
  [ChainId.BSC_TESTNET]: DEFAULT_CL_PRESETS,
  [ChainId.BASE]: DEFAULT_CL_PRESETS,
  [ChainId.SEPOLIA]: DEFAULT_CL_PRESETS,
}

export const CL_PRESETS: {
  fee: number
  tickSpacing: number
}[] = DEFAULT_CL_PRESETS

type BinPoolPreset = {
  fee: number
  binStep: number
}

const DEFAULT_BIN_PRESETS: BinPoolPreset[] = [
  {
    fee: InfinityFeeTier.LOWEST,
    binStep: 1,
  },
  {
    fee: InfinityFeeTier.LOW,
    binStep: 10,
  },
  {
    fee: InfinityFeeTier.MEDIUM,
    binStep: 50,
  },
  {
    fee: InfinityFeeTier.HIGH,
    binStep: 100,
  },
]

export const BIN_PRESETS_BY_CHAIN: { [key in InfinitySupportedChains]: BinPoolPreset[] } = {
  [ChainId.BSC]: DEFAULT_BIN_PRESETS,
  [ChainId.BSC_TESTNET]: DEFAULT_BIN_PRESETS,
  [ChainId.BASE]: DEFAULT_BIN_PRESETS,
  [ChainId.SEPOLIA]: DEFAULT_BIN_PRESETS,
}
