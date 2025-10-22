import { Address, Hex } from 'viem'

export interface SupportedPoolListItem {
  chainId: number
  poolId: Hex
  currency0: Address
  currency1: Address
}
