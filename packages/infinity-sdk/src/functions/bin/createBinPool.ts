import { BigintIsh, Currency, sortCurrencies } from '@pancakeswap/swap-sdk-core'
import invariant from 'tiny-invariant'
import { Address } from 'viem'
import { MAX_BIN_STEP, MIN_BIN_STEP } from '../../constants'
import { MAX_PROTOCOL_FEE, TEN_PERCENT_FEE } from '../../constants/fee'
import type { BinTree } from '../../types'
import { TreeMath } from '../../utils'

type ActiveId = number
type Reserve = {
  reserveX: bigint
  reserveY: bigint
}

export type BinPoolState = {
  /**
   * the first currency of the pool
   */
  currencyX: Currency
  /**
   * the second currency of the pool
   */
  currencyY: Currency
  /**
   * the bin step of the pool
   * constraints: 1 <= binStep <= 100
   */
  binStep: bigint
  /**
   * current active bin id of the pool
   */
  activeId: bigint
  reserveOfBin: Record<ActiveId, Reserve>
  /**
   * fee charged by Liquidity Providers
   * constraints: 0 <= lpFee <= 10000(10%)
   * unit: bps
   * 1 = 0.01%
   */
  lpFee: bigint
  /**
   * fee charged by the protocol
   * constraints: 0 <= protocolFee <= 1000(0.1%)
   * the first element is the feeRate charged when swapForX
   * the second element is the feeRate charged when swapForY
   * unit: bps/100
   * 1 = 0.0001%
   */
  protocolFees: [bigint, bigint]
  lmPool?: Address
  tree?: BinTree
}

/**
 * Returns a new BinPoolState object
 */
export const createBinPool = ({
  currencyA,
  currencyB,
  activeId,
  binStep,
  lpFee,
  protocolFees = [0n, 0n],
  lmPool,
  tree: treeOverride,
  reserveOfBin,
}: {
  currencyA: Currency
  currencyB: Currency
  activeId: BigintIsh
  binStep: BigintIsh
  lpFee: BigintIsh
  protocolFees?: [BigintIsh, BigintIsh]
  lmPool?: Address
  tree?: BinTree
  reserveOfBin?: Record<ActiveId, Reserve>
}): BinPoolState => {
  invariant(Number.isInteger(lpFee) && BigInt(lpFee) >= 0 && BigInt(lpFee) <= TEN_PERCENT_FEE, 'SWAP_FEE')
  invariant(
    protocolFees.every(
      (protocolFee) =>
        Number.isInteger(Number(protocolFee)) && BigInt(protocolFee) >= 0 && BigInt(protocolFee) <= MAX_PROTOCOL_FEE
    ),
    'PROTOCOL_FEE'
  )

  invariant(Number.isInteger(binStep) && BigInt(binStep) >= MIN_BIN_STEP && BigInt(binStep) <= MAX_BIN_STEP, 'BIN_STEP')

  invariant(Number.isInteger(activeId), 'ACTIVE_ID')

  const [currencyX, currencyY] = sortCurrencies([currencyA, currencyB])

  let tree = treeOverride
  if (reserveOfBin && !tree) {
    tree = {
      level0: '0x0',
      level1: {},
      level2: {},
    }
    const binIds = Object.keys(reserveOfBin)
    for (const bin of binIds) {
      const binId = Number(bin)
      const { reserveX, reserveY } = reserveOfBin[binId]
      if (reserveX !== 0n || reserveY !== 0n) {
        TreeMath.add(tree, BigInt(binId))
      }
    }
  }

  return {
    currencyX,
    currencyY,
    activeId: BigInt(activeId),
    binStep: BigInt(binStep),
    lpFee: BigInt(lpFee),
    protocolFees: [BigInt(protocolFees[0]), BigInt(protocolFees[1])],
    lmPool,
    reserveOfBin: reserveOfBin || {},
    tree,
  }
}
