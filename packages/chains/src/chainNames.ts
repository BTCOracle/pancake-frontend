import { ChainId, NonEVMChainId, UnifiedChainId } from './chainId'

export const chainNames: Record<UnifiedChainId, string> = {
  [ChainId.ETHEREUM]: 'eth',
  [ChainId.GOERLI]: 'goerli',
  [ChainId.BSC]: 'bsc',
  [ChainId.BSC_TESTNET]: 'bscTestnet',
  [ChainId.ARBITRUM_ONE]: 'arb',
  [ChainId.ARBITRUM_GOERLI]: 'arbGoerli',
  [ChainId.ZKSYNC]: 'zkSync',
  [ChainId.ZKSYNC_TESTNET]: 'zkSyncTestnet',
  [ChainId.LINEA]: 'linea',
  [ChainId.LINEA_TESTNET]: 'lineaTestnet',
  [ChainId.OPBNB]: 'opBNB',
  [ChainId.OPBNB_TESTNET]: 'opBnbTestnet',
  [ChainId.BASE]: 'base',
  [ChainId.BASE_TESTNET]: 'baseTestnet',
  [ChainId.SCROLL_SEPOLIA]: 'scrollSepolia',
  [ChainId.SEPOLIA]: 'sepolia',
  [ChainId.ARBITRUM_SEPOLIA]: 'arbSepolia',
  [ChainId.BASE_SEPOLIA]: 'baseSepolia',
  [ChainId.MONAD_TESTNET]: 'monadTestnet',
  [NonEVMChainId.SOLANA]: 'sol',
  [NonEVMChainId.APTOS]: 'aptos',
}

export const chainFullNames: Record<UnifiedChainId, string> = {
  [ChainId.ETHEREUM]: 'Ethereum',
  [ChainId.GOERLI]: 'Goerli',
  [ChainId.BSC]: 'BNB Chain',
  [ChainId.BSC_TESTNET]: 'BNB Chain Testnet',
  [ChainId.ARBITRUM_ONE]: 'Arbitrum One',
  [ChainId.ARBITRUM_GOERLI]: 'Arbitrum Goerli',
  [ChainId.ZKSYNC]: 'ZKsync Era',
  [ChainId.ZKSYNC_TESTNET]: 'ZKsync Era Testnet',
  [ChainId.LINEA]: 'Linea',
  [ChainId.LINEA_TESTNET]: 'Linea Testnet',
  [ChainId.OPBNB]: 'opBNB',
  [ChainId.OPBNB_TESTNET]: 'opBNB Testnet',
  [ChainId.BASE]: 'Base',
  [ChainId.BASE_TESTNET]: 'Base Testnet',
  [ChainId.SCROLL_SEPOLIA]: 'Scroll Sepolia',
  [ChainId.SEPOLIA]: 'Sepolia',
  [ChainId.ARBITRUM_SEPOLIA]: 'Arbitrum Sepolia',
  [ChainId.BASE_SEPOLIA]: 'Base Sepolia',
  [ChainId.MONAD_TESTNET]: 'Monad Testnet',
  [NonEVMChainId.SOLANA]: 'Solana',
  [NonEVMChainId.APTOS]: 'Aptos',
}

export const chainNamesInKebabCase = {
  [ChainId.ETHEREUM]: 'ethereum',
  [ChainId.GOERLI]: 'goerli',
  [ChainId.BSC]: 'bsc',
  [ChainId.BSC_TESTNET]: 'bsc-testnet',
  [ChainId.ARBITRUM_ONE]: 'arbitrum',
  [ChainId.ARBITRUM_GOERLI]: 'arbitrum-goerli',
  [ChainId.ZKSYNC]: 'zksync',
  [ChainId.ZKSYNC_TESTNET]: 'zksync-testnet',
  [ChainId.LINEA]: 'linea',
  [ChainId.LINEA_TESTNET]: 'linea-testnet',
  [ChainId.OPBNB]: 'opbnb',
  [ChainId.OPBNB_TESTNET]: 'opbnb-testnet',
  [ChainId.BASE]: 'base',
  [ChainId.BASE_TESTNET]: 'base-testnet',
  [ChainId.SCROLL_SEPOLIA]: 'scroll-sepolia',
  [ChainId.SEPOLIA]: 'sepolia',
  [ChainId.ARBITRUM_SEPOLIA]: 'arbitrum-sepolia',
  [ChainId.BASE_SEPOLIA]: 'base-sepolia',
  [ChainId.MONAD_TESTNET]: 'monad-testnet',
  [NonEVMChainId.SOLANA]: 'sol',
  [NonEVMChainId.APTOS]: 'aptos',
} as const

export const mainnetChainNamesInKebabCase = {
  [ChainId.ETHEREUM]: 'ethereum',
  [ChainId.GOERLI]: 'ethereum',
  [ChainId.BSC]: 'bsc',
  [ChainId.BSC_TESTNET]: 'bsc',
  [ChainId.ARBITRUM_ONE]: 'arbitrum',
  [ChainId.ARBITRUM_GOERLI]: 'arbitrum',
  [ChainId.ZKSYNC]: 'zksync',
  [ChainId.ZKSYNC_TESTNET]: 'zksync',
  [ChainId.LINEA]: 'linea',
  [ChainId.LINEA_TESTNET]: 'linea',
  [ChainId.OPBNB]: 'opbnb',
  [ChainId.OPBNB_TESTNET]: 'opbnb',
  [ChainId.BASE]: 'base',
  [ChainId.BASE_TESTNET]: 'base',
  [ChainId.SEPOLIA]: 'ethereum',
  [ChainId.ARBITRUM_SEPOLIA]: 'arbitrum',
  [ChainId.BASE_SEPOLIA]: 'base',
  [NonEVMChainId.SOLANA]: 'sol',
  [NonEVMChainId.APTOS]: 'aptos',
} as const

const legacyChainNames: [string, UnifiedChainId][] = [
  ['Binance Smart Chain', ChainId.BSC],
  ['BNB Smart Chain', ChainId.BSC],
]

export const chainNameToChainId = Object.entries(chainNames).reduce((acc, [chainId, chainName]) => {
  return {
    [chainName]: +chainId as unknown as ChainId,
    ...acc,
  }
}, {} as Record<string, UnifiedChainId>)

const chainFullNamesToChainId = Object.entries(chainFullNames).reduce((acc, [chainId, chainName]) => {
  return {
    [chainName]: +chainId as unknown as UnifiedChainId,
    ...acc,
  }
}, {} as Record<string, UnifiedChainId>)

const kebabCaseNamesToChainId = Object.entries(chainNamesInKebabCase).reduce((acc, [chainId, chainName]) => {
  return {
    [chainName]: +chainId as unknown as UnifiedChainId,
    ...acc,
  }
}, {} as Record<string, UnifiedChainId>)

export const allCasesNameToChainId = Object.entries({
  ...chainFullNamesToChainId,
  ...kebabCaseNamesToChainId,
  ...chainNameToChainId,
})
  .concat(legacyChainNames)
  .reduce((acc, [chainName, chainId]) => {
    return {
      [chainName]: +chainId as UnifiedChainId,
      [chainName.toLowerCase()]: +chainId as UnifiedChainId,
      ...acc,
    }
  }, {} as Record<string, UnifiedChainId>)

// @see https://github.com/DefiLlama/defillama-server/blob/master/common/chainToCoingeckoId.ts
// @see https://github.com/DefiLlama/chainlist/blob/main/constants/chainIds.json
export const defiLlamaChainNames: Record<UnifiedChainId, string> = {
  [ChainId.BSC]: 'bsc',
  [ChainId.ETHEREUM]: 'ethereum',
  [ChainId.GOERLI]: '',
  [ChainId.BSC_TESTNET]: '',
  [ChainId.ARBITRUM_ONE]: 'arbitrum',
  [ChainId.ARBITRUM_GOERLI]: '',
  [ChainId.ZKSYNC]: 'era',
  [ChainId.ZKSYNC_TESTNET]: '',
  [ChainId.LINEA_TESTNET]: '',
  [ChainId.BASE_TESTNET]: '',
  [ChainId.OPBNB]: 'op_bnb',
  [ChainId.OPBNB_TESTNET]: '',
  [ChainId.SCROLL_SEPOLIA]: '',
  [ChainId.LINEA]: 'linea',
  [ChainId.BASE]: 'base',
  [ChainId.SEPOLIA]: '',
  [ChainId.ARBITRUM_SEPOLIA]: '',
  [ChainId.BASE_SEPOLIA]: '',
  [ChainId.MONAD_TESTNET]: '',
  [NonEVMChainId.SOLANA]: '',
  [NonEVMChainId.APTOS]: '',
}
