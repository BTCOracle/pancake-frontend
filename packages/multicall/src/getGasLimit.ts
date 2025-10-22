import { ChainId } from '@pancakeswap/chains'
import { BigintIsh } from '@pancakeswap/sdk'
import { toBigInt } from '@pancakeswap/utils/toBigInt'
import { PublicClient } from 'viem'

import {
  DEFAULT_GAS_BUFFER,
  DEFAULT_GAS_BUFFER_BY_CHAIN,
  DEFAULT_GAS_LIMIT,
  DEFAULT_GAS_LIMIT_BY_CHAIN,
} from './constants'
import { getMulticallContract } from './getMulticallContract'

export type GetGasLimitParams = {
  chainId: ChainId
  client?: PublicClient

  // If provided then would override the gas limit got from on chain
  gasLimit?: BigintIsh

  // The gas limit should be whichever is smaller between gasLimit and maxGasLimit
  maxGasLimit?: BigintIsh

  gasBuffer?: BigintIsh

  // The account to simulate or do the multicall with
  account?: `0x${string}`
}

export function getDefaultGasLimit(chainId?: ChainId) {
  const gasLimitOnChain = chainId && DEFAULT_GAS_LIMIT_BY_CHAIN[chainId]
  return gasLimitOnChain !== undefined ? gasLimitOnChain : DEFAULT_GAS_LIMIT
}

export function getDefaultGasBuffer(chainId?: ChainId) {
  const gasBufferOnChain = chainId && DEFAULT_GAS_BUFFER_BY_CHAIN[chainId]
  return gasBufferOnChain !== undefined ? gasBufferOnChain : DEFAULT_GAS_BUFFER
}

export type GetGasLimitOnChainParams = Pick<GetGasLimitParams, 'chainId' | 'client'>

export async function getGasLimitOnChain({ chainId, client }: GetGasLimitOnChainParams) {
  try {
    if (!chainId || !client) {
      return BigInt(getDefaultGasLimit(chainId))
    }
    const multicall = getMulticallContract({ chainId, client })
    const gasLeft = (await multicall.read.gasLeft()) as bigint
    return gasLeft
  } catch (error) {
    console.warn('Failed to get gas limit from chain, using default:', error)
    return BigInt(getDefaultGasLimit(chainId))
  }
}

export async function getGasLimit({
  chainId,
  gasLimit: gasLimitInput,
  maxGasLimit: maxGasLimitInput = getDefaultGasLimit(chainId),
  gasBuffer: gasBufferInput = getDefaultGasBuffer(chainId),
  client,
}: GetGasLimitParams) {
  const gasLimitOverride = gasLimitInput && toBigInt(gasLimitInput)
  const maxGasLimit = toBigInt(maxGasLimitInput)
  const gasBuffer = toBigInt(gasBufferInput)

  let onChainGasLimit: bigint | undefined
  try {
    onChainGasLimit = await getGasLimitOnChain({ chainId, client })
  } catch (error) {
    console.warn('Failed to fetch gas limit on chain:', error)
    onChainGasLimit = undefined
  }
  const gasLimit = gasLimitOverride || onChainGasLimit || maxGasLimit
  const minGasLimit = gasLimit < maxGasLimit ? gasLimit : maxGasLimit
  return minGasLimit - gasBuffer
}
