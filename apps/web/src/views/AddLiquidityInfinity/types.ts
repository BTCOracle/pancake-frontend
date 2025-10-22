import { PoolType } from '@pancakeswap/infinity-sdk'
import { Address, Hex } from 'viem'

export type PoolData = {
  currency0: Address
  currency1: Address
  hooks: Hex
  poolManager: Address
  fee: number // Example: 3000, or 8388608 (0x800000) when Dynamic
  parameters: Hex
  poolType: PoolType

  // Slot0
  sqrtPriceX96: Hex
  tick: number
  protocolFee: number
  lpFee: number
}
