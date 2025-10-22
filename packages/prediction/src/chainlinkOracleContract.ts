import { ChainId } from '@pancakeswap/chains'
import { Address } from 'viem'
import { SupportedChainId } from './constants/supportedChains'
import { ContractAddresses } from './type'

export const chainlinkOracleBNB: Record<string, Address> = {
  [ChainId.BSC]: '0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE',
  // [ChainId.BSC_TESTNET]: '0x',
  [ChainId.ZKSYNC]: '0x',
  [ChainId.ARBITRUM_ONE]: '0x',
} as const satisfies ContractAddresses<SupportedChainId>

export const chainlinkOracleCAKE: Record<string, Address> = {
  [ChainId.BSC]: '0xB6064eD41d4f67e353768aA239cA86f4F73665a1',
  // [ChainId.BSC_TESTNET]: '0x',
  [ChainId.ZKSYNC]: '0x',
  [ChainId.ARBITRUM_ONE]: '0x',
} as const satisfies ContractAddresses<SupportedChainId>

export const chainlinkOracleETH: Record<string, Address> = {
  [ChainId.BSC]: '0x9ef1B8c0E4F7dc8bF5719Ea496883DC6401d5b2e',
  // [ChainId.BSC_TESTNET]: '0x267aa2A74EFbc24F4F621E81C9De97d93cA043cb', // Mock
  [ChainId.ZKSYNC]: '0x',
  [ChainId.ARBITRUM_ONE]: '0x',
} as const satisfies ContractAddresses<SupportedChainId>

export const chainlinkOracleWBTC: Record<string, Address> = {
  [ChainId.BSC]: '0x264990fbd0A4796A3E3d8E37C4d5F87a3aCa5Ebf',
  // [ChainId.BSC_TESTNET]: '0x04a02840856CD13239508343CF3630579DA65420', // Mock
  [ChainId.ZKSYNC]: '0x',
  [ChainId.ARBITRUM_ONE]: '0x',
} as const satisfies ContractAddresses<SupportedChainId>
