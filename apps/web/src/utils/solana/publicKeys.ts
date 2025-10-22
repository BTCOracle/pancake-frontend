import { PublicKey } from '@solana/web3.js'

const CACHE_KEYS = new Map<string, PublicKey>()

export const isValidPublicKey = (val: string | PublicKey): boolean => {
  if (!val) return false
  const valStr = val.toString()
  if (CACHE_KEYS.has(valStr)) return true
  try {
    // eslint-disable-next-line no-new
    new PublicKey(valStr)
    return true
  } catch {
    return false
  }
}
