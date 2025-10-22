import { Currency, ERC20Token, WNATIVE } from '@pancakeswap/sdk'
import { feeOnTransferDetectorAddresses, fetchTokenFeeOnTransfer } from '@pancakeswap/smart-router'
import { atom, useAtomValue } from 'jotai'
import { atomFamily } from 'jotai/utils'
import { isEqualCurrency } from 'quoter/utils/PoolHashHelper'
import { getViemClients } from 'utils/viem'

export function useTokenFee(token?: ERC20Token) {
  return useAtomValue(tokenFeeAtom(token))
}

export interface TokenFee {
  buyFeeBps: bigint
  sellFeeBps: bigint
}

export const tokenFeeAtom = atomFamily((token?: Currency) => {
  return atom(async () => {
    if (!token) {
      return undefined
    }
    if (token.isNative) {
      return undefined
    }

    const publicClient = getViemClients({ chainId: token.chainId })

    if (!publicClient) {
      throw new Error('Public client not found')
    }

    if (publicClient.chain?.id !== token.chainId) {
      throw new Error('Chain id mismatch')
    }

    if (!(token.chainId in feeOnTransferDetectorAddresses)) {
      throw new Error('Fee on transfer detector not found')
    }

    const wrappedNative = WNATIVE[token.chainId as keyof typeof WNATIVE]

    if (token.equals(wrappedNative)) {
      return { buyFeeBps: 0n, sellFeeBps: 0n } as TokenFee
    }

    const { result } = await fetchTokenFeeOnTransfer(publicClient, token.address)
    return result as TokenFee
  })
}, isEqualCurrency)
