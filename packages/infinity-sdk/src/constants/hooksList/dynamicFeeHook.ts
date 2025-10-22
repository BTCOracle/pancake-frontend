import { ChainId } from '@pancakeswap/chains'
import type { Address } from 'viem'

import { InfinitySupportedChains } from '../addresses'

export const CL_DYNAMIC_FEE_HOOK_REGISTRATION_BITMAP = {
  [ChainId.BSC]: '0x00C2',
  [ChainId.BSC_TESTNET]: '0x0042',
  [ChainId.SEPOLIA]: '0x0042',
  [ChainId.BASE]: '0x0042',
} as const

export const BIN_DYNAMIC_FEE_HOOK_REGISTRATION_BITMAP = '0x0046'

export const CL_DYNAMIC_FEE_HOOKS_BY_CHAIN: { [key in InfinitySupportedChains]: Address } = {
  [ChainId.BSC]: '0x32C59D556B16DB81DFc32525eFb3CB257f7e493d',
  [ChainId.BSC_TESTNET]: '0xEce0656EeFA49C16a98447807f62714496aef518',
  [ChainId.SEPOLIA]: '0x0E647d71d3b5dfcd2Ad5d77c36723Ef646784664',
  [ChainId.BASE]: '0x32C59D556B16DB81DFc32525eFb3CB257f7e493d',
}

export const BIN_DYNAMIC_FEE_HOOKS_BY_CHAIN: { [key in InfinitySupportedChains]: Address } = {
  [ChainId.BSC]: '0x',
  [ChainId.BSC_TESTNET]: '0x870c167eFCEEaDd081EE783Af8c5c7b436f1d3Ce',
  [ChainId.SEPOLIA]: '0x8F3654C0eA6712C69bAC45644478942cDe955Db2',
  [ChainId.BASE]: '0x',
}
