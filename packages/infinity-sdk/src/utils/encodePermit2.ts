import { PermitBatch } from '@pancakeswap/permit2-sdk'
import { Address, encodeFunctionData, Hex } from 'viem'
import { Permit2ForwardAbi } from '../abis'
import { Permit2Signature } from '../types'

export const encodePermit2 = (owner: Address, permit2Signature: Permit2Signature) => {
  const { signature, details, spender, sigDeadline } = permit2Signature
  const permitSingle = {
    details: {
      token: details.token as `0x${string}`,
      amount: BigInt(details.amount),
      expiration: Number(details.expiration),
      nonce: Number(details.nonce),
    },
    spender: spender as `0x${string}`,
    sigDeadline: BigInt(sigDeadline),
  }

  return encodeFunctionData({
    abi: Permit2ForwardAbi,
    functionName: 'permit',
    args: [owner, permitSingle, signature],
  })
}

export const encodePermit2Batch = (owner: Address, permit2Batch: PermitBatch, signatures: Hex) => {
  const permitBatch = {
    details: permit2Batch.details.map((detail) => {
      return {
        token: detail.token as `0x${string}`,
        amount: BigInt(detail.amount),
        expiration: Number(detail.expiration),
        nonce: Number(detail.nonce),
      }
    }),
    spender: permit2Batch.spender as `0x${string}`,
    sigDeadline: BigInt(permit2Batch.sigDeadline),
  }

  return encodeFunctionData({
    abi: Permit2ForwardAbi,
    functionName: 'permitBatch',
    args: [owner, permitBatch, signatures],
  })
}
