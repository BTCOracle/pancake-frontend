import { ChainId, NonEVMChainId } from '@pancakeswap/chains'

export const X_API_TIMEOUT = 5_000

export const QUOTE_TIMEOUT = {
  [ChainId.BSC_TESTNET]: 12_000,
  [ChainId.BSC]: 12_000,

  // L1 (slower / variable)
  [ChainId.ETHEREUM]: 15_000,
  [ChainId.GOERLI]: 15_000,
  [ChainId.SEPOLIA]: 15_000,

  // L2s (fast finality)
  [ChainId.ARBITRUM_ONE]: 8_000,
  [ChainId.ARBITRUM_GOERLI]: 8_000,
  [ChainId.ARBITRUM_SEPOLIA]: 8_000,
  [ChainId.BASE]: 8_000,
  [ChainId.BASE_TESTNET]: 8_000,
  [ChainId.BASE_SEPOLIA]: 8_000,
  [ChainId.LINEA]: 8_000,
  [ChainId.LINEA_TESTNET]: 8_000,
  [ChainId.ZKSYNC]: 9_000, // a touch higher due to sequencer variance
  [ChainId.ZKSYNC_TESTNET]: 9_000,

  // Other fast L1/L2
  [ChainId.OPBNB]: 9_000,
  [ChainId.OPBNB_TESTNET]: 9_000,
  [ChainId.SCROLL_SEPOLIA]: 9_000,

  // Misc
  [ChainId.MONAD_TESTNET]: 8_000,

  [NonEVMChainId.SOLANA]: 5_000,
  [NonEVMChainId.APTOS]: 5_000,
} as const satisfies Record<ChainId | NonEVMChainId, number>

export const SOLANA_NATIVE_TOKEN_ADDRESS = '11111111111111111111111111111111'

export const POOL_EDGE_API_FETCH_TIMEOUT = 6_000

// Revalidate interval after a successful quote in seconds
export const QUOTE_SUCC_REVALIDATE = {
  // BSC
  [ChainId.BSC_TESTNET]: 15,
  [ChainId.BSC]: 15,

  // L1 slower
  [ChainId.ETHEREUM]: 25,
  [ChainId.GOERLI]: 25,
  [ChainId.SEPOLIA]: 25,

  // L2 fast
  [ChainId.ARBITRUM_ONE]: 10,
  [ChainId.ARBITRUM_GOERLI]: 10,
  [ChainId.ARBITRUM_SEPOLIA]: 10,
  [ChainId.BASE]: 10,
  [ChainId.BASE_TESTNET]: 10,
  [ChainId.BASE_SEPOLIA]: 10,
  [ChainId.LINEA]: 10,
  [ChainId.LINEA_TESTNET]: 10,

  // zkSync
  [ChainId.ZKSYNC]: 16,
  [ChainId.ZKSYNC_TESTNET]: 12,

  // Other fast L1/L2
  [ChainId.OPBNB]: 12,
  [ChainId.OPBNB_TESTNET]: 12,
  [ChainId.SCROLL_SEPOLIA]: 12,

  // Misc
  [ChainId.MONAD_TESTNET]: 10,

  // Solana
  [NonEVMChainId.SOLANA]: 5,
  [NonEVMChainId.APTOS]: 5,
} as const satisfies Record<ChainId | NonEVMChainId, number>

// Revalidate interval after a failed quote in seconds
export const QUOTE_FAIL_REVALIDATE = {
  // BSC
  [ChainId.BSC_TESTNET]: 5,
  [ChainId.BSC]: 5,

  // L1 slower / variable
  [ChainId.ETHEREUM]: 7,
  [ChainId.GOERLI]: 7,
  [ChainId.SEPOLIA]: 7,

  // L2 fast
  [ChainId.ARBITRUM_ONE]: 5,
  [ChainId.ARBITRUM_GOERLI]: 5,
  [ChainId.ARBITRUM_SEPOLIA]: 5,
  [ChainId.BASE]: 5,
  [ChainId.BASE_TESTNET]: 5,
  [ChainId.BASE_SEPOLIA]: 5,
  [ChainId.LINEA]: 5,
  [ChainId.LINEA_TESTNET]: 5,

  // zkSync (more variance)
  [ChainId.ZKSYNC]: 7,
  [ChainId.ZKSYNC_TESTNET]: 7,

  // Other fast L1/L2
  [ChainId.OPBNB]: 5,
  [ChainId.OPBNB_TESTNET]: 5,
  [ChainId.SCROLL_SEPOLIA]: 5,

  // Misc
  [ChainId.MONAD_TESTNET]: 5,
  [NonEVMChainId.SOLANA]: 5,
  [NonEVMChainId.APTOS]: 5,
} as const satisfies Record<ChainId | NonEVMChainId, number>
