import { PublicKey } from '@solana/web3.js'

// Solana address validation helper
export const isValidSolanaAddress = (address: string): boolean => {
  try {
    const key = new PublicKey(address)

    // eslint-disable-next-line no-console
    console.info('isValidSolanaAddress', key.toBase58())
    return true
  } catch {
    return false
  }
}
