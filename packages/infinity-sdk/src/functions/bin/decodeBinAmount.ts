/* eslint-disable no-bitwise */
import { Bytes32 } from '../../types'

/**
 * Decode a bytes32 amount into two amounts, one for each token
 * [0 - 128[: x1
 * [128 - 256[: x2
 *
 * @returns amountX the amount of the first token
 * @returns amountY the amount of the second token
 */
export const decodeBinAmount = (
  amount: Bytes32 | bigint
): {
  amountX: bigint
  amountY: bigint
} => {
  const value = BigInt(amount)

  const mask = (1n << 128n) - 1n

  const amountX = value & mask

  const amountY = value >> 128n

  return {
    amountX,
    amountY,
  }
}

export const decodeBinAmountForX = (amount: Bytes32): bigint => {
  return decodeBinAmount(amount).amountX
}

export const decodeBinAmountForY = (amount: Bytes32): bigint => {
  return decodeBinAmount(amount).amountY
}
