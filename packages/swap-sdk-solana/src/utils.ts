import { PublicKey } from '@solana/web3.js'
import { UnifiedCurrency } from '@pancakeswap/swap-sdk-core'
import { NonEVMChainId } from '@pancakeswap/chains'
import { PublicKeyish } from './types'
import { SOL_INFO, SOLMint, TOKEN_WSOL, WSOLMint } from './constants'

export function tryParsePublicKey(v: string): PublicKey | string {
  try {
    return new PublicKey(v)
  } catch (e) {
    return v
  }
}
export function validateAndParsePublicKey({
  publicKey: orgPubKey,
  transformSol,
}: {
  publicKey: PublicKeyish
  transformSol?: boolean
}): PublicKey {
  const publicKey = tryParsePublicKey(orgPubKey.toString())

  if (publicKey instanceof PublicKey) {
    if (transformSol && publicKey.equals(SOLMint)) return WSOLMint
    return publicKey
  }

  if (transformSol && publicKey.toString() === SOLMint.toBase58()) return WSOLMint

  if (typeof publicKey === 'string') {
    if (publicKey === PublicKey.default.toBase58()) return PublicKey.default
    try {
      const key = new PublicKey(publicKey)
      return key
    } catch {
      throw new Error('invalid public key')
    }
  }

  throw new Error('invalid public key')
}

export const isSolWSolToken = (token?: UnifiedCurrency | null) => {
  if (!token) return false
  if (token.chainId !== NonEVMChainId.SOLANA && token.chainId !== 101) return false
  if (token.isNative) return true
  return token.address.toString() === TOKEN_WSOL.address || token.address.toString() === SOL_INFO.address
}
export const isSol = (mint: string) => mint === SOLMint.toBase58()
export const isWSol = (mint: string) => mint === WSOLMint.toBase58()
export const isSolWSol = (mint: string) => isSol(mint) || isWSol(mint)

export const solToWSol = (key: string): string => (key === SOLMint.toBase58() ? WSOLMint.toBase58() : key)
export const wSolToSol = (key: string): string => (key === WSOLMint.toBase58() ? SOLMint.toBase58() : key)
