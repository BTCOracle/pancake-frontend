import { Bytes32, EncodedPoolKey } from '@pancakeswap/infinity-sdk'
import { Address } from 'viem'

export interface PathKey {
  intermediateCurrency: Address
  fee: number
  hooks: Address
  poolManager: Address
  hookData: `0x${string}`
  parameters: `0x${string}`
}

export interface PoolKey {
  currency0: Address
  currency1: Address
  hooks: Address
  poolManager: Address
  fee: number
  parameters: `0x${string}`
}

// export interface CLSwapExactInputParams {
//   address: Address
//   path: PathKey[]
//   amountIn: bigint
//   amountOutMinimum: bigint
// }

// export interface CLSwapExactInputSingleParams {
//   poolKey: PoolKey
//   zeroForOne: boolean
//   amountIn: bigint
//   amountOutMinimum: bigint
//   hookData: `0x${string}`
// }

// export interface BinSwapExactInputSingleParams {
//   poolKey: PoolKey
//   swapForY: boolean
//   amountIn: bigint
//   amountOutMinimum: bigint
//   hookData: `0x${string}`
// }

export interface EncodedSingleSwapParams {
  poolKey: EncodedPoolKey
  zeroForOne: boolean
  hookData: Bytes32
}

export interface EncodedExactInputParams {
  amountIn: bigint
  amountOutMinimum: bigint
}
export interface EncodedExactOutputParams {
  amountOut: bigint
  amountInMaximum: bigint
}

export interface EncodedSingleSwapInParams extends EncodedSingleSwapParams, EncodedExactInputParams {}
export interface EncodedSingleSwapOutParams extends EncodedSingleSwapParams, EncodedExactOutputParams {}

export type EncodedPathKey = {
  intermediateCurrency: Address
  fee: number
  hooks: Address
  poolManager: Address
  hookData: `0x${string}`
  parameters: `0x${string}`
}

export interface EncodedMultiSwapInParams extends EncodedExactInputParams {
  currencyIn: Address
  path: EncodedPathKey[]
}
export interface EncodedMultiSwapOutParams extends EncodedExactOutputParams {
  currencyOut: Address
  path: EncodedPathKey[]
}
