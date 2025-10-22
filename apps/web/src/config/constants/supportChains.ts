import { ChainId, NonEVMChainId } from '@pancakeswap/chains'
import { supportedChainId } from '@pancakeswap/farms'

export const SUPPORT_ONLY_BSC = [ChainId.BSC]
export const SUPPORT_FARMS = [...supportedChainId, NonEVMChainId.SOLANA]
export const LIQUID_STAKING_SUPPORTED_CHAINS = [
  ChainId.BSC,
  ChainId.ETHEREUM,
  ChainId.BSC_TESTNET,
  ChainId.ARBITRUM_GOERLI,
  ChainId.MONAD_TESTNET,
]

export const V2_MIGRATE_PAGE_SUPPORTED_CHAINS = [ChainId.BSC, ChainId.ETHEREUM, ChainId.BSC_TESTNET, ChainId.GOERLI]
export const V3_MIGRATION_SUPPORTED_CHAINS = [ChainId.BSC, ChainId.ETHEREUM]
export const V2_BCAKE_MIGRATION_SUPPORTED_CHAINS = [ChainId.BSC]

export const SUPPORT_CAKE_STAKING = [ChainId.BSC, ChainId.BSC_TESTNET]

// Supports Limit Orders by Infinity Hooks
export const LIMIT_ORDERS_HOOKS_SUPPORTED_CHAINS = [ChainId.BSC, ChainId.BSC_TESTNET]
