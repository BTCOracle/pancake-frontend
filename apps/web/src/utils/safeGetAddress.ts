import { PublicKey } from '@solana/web3.js'
import memoize from '@pancakeswap/utils/memoize'
import { Address } from 'viem/accounts'
import { NonEVMChainId, UnifiedChainId } from '@pancakeswap/chains'
import { checksumAddress } from './checksumAddress'

export const safeGetAddress = memoize((value: any): Address | undefined => {
  try {
    let value_ = value
    if (typeof value === 'string' && !value.startsWith('0x')) {
      value_ = `0x${value}`
    }
    return checksumAddress(value_)
  } catch {
    return undefined
  }
})

export const isAddressEqual = (a?: any, b?: any) => {
  if (!a || !b) return false
  const a_ = safeGetAddress(a)
  if (!a_) return false
  const b_ = safeGetAddress(b)
  if (!b_) return false
  return a_ === b_
}

export const safeGetSolanaAddress = memoize((address: any): string | undefined => {
  try {
    const publicKey = new PublicKey(address)
    return publicKey.toBase58()
  } catch (error) {
    return undefined
  }
})

export const safeGetUnifiedAddress = (chainId: UnifiedChainId | undefined, address: any) =>
  chainId === NonEVMChainId.SOLANA ? safeGetSolanaAddress(address) : safeGetAddress(address)
