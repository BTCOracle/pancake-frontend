import { ChainId } from '@pancakeswap/chains'
import { Address } from 'viem'
import { SupportedChainId } from './constants/supportedChains'
import { ContractAddresses } from './type'

export const predictionsBNB: Record<string, Address> = {
  [ChainId.BSC]: '0x18B2A687610328590Bc8F2e5fEdDe3b582A49cdA',
  [ChainId.ZKSYNC]: '0x',
  [ChainId.ARBITRUM_ONE]: '0x',
  // [ChainId.BSC_TESTNET]: '0x',
} as const satisfies ContractAddresses<SupportedChainId>

export const predictionsCAKE: Record<string, Address> = {
  [ChainId.BSC]: '0x0E3A8078EDD2021dadcdE733C6b4a86E51EE8f07',
  [ChainId.ZKSYNC]: '0x',
  [ChainId.ARBITRUM_ONE]: '0x',
  // [ChainId.BSC_TESTNET]: '0x',
} as const satisfies ContractAddresses<SupportedChainId>

export const predictionsETH: Record<string, Address> = {
  [ChainId.BSC]: '0x7451F994A8D510CBCB46cF57D50F31F188Ff58F5',
  [ChainId.ZKSYNC]: '0x43c7771DEB958A2e3198ED98772056ba70DaA84c',
  [ChainId.ARBITRUM_ONE]: '0x1cdc19B13729f16C5284a0ACE825F83fC9d799f4',
  // [ChainId.BSC_TESTNET]: '0xc8F637F9e559f2b9bD240D2b32353427534dFF54',
} as const satisfies ContractAddresses<SupportedChainId>

export const predictionsWBTC: Record<string, Address> = {
  [ChainId.BSC]: '0x48781a7d35f6137a9135Bbb984AF65fd6AB25618',
  [ChainId.ZKSYNC]: '0x',
  [ChainId.ARBITRUM_ONE]: '0x',
  // [ChainId.BSC_TESTNET]: '0x14425f1b36A083637220F68A6D716E9F5Ed2Ec0c',
} as const satisfies ContractAddresses<SupportedChainId>
