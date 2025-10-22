import { Multicall } from '@pancakeswap/v3-sdk'
import { encodeFunctionData, Hex } from 'viem'

export const encodeMulticall = (calldatas: Hex | Hex[]): Hex => {
  if (!Array.isArray(calldatas)) {
    // eslint-disable-next-line no-param-reassign
    calldatas = [calldatas]
  }

  return calldatas.length === 1
    ? calldatas[0]
    : encodeFunctionData({ abi: Multicall.ABI, functionName: 'multicall', args: [calldatas] })
}
