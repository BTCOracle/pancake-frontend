import { NonEVMChainId } from '@pancakeswap/chains'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'
import { SPLToken } from '@pancakeswap/swap-sdk-core'
import { TokenInfo } from './types'

export const WSOLMint = new PublicKey('So11111111111111111111111111111111111111112')
export const SOLMint = PublicKey.default

export const SOL_INFO: TokenInfo = {
  chainId: NonEVMChainId.SOLANA,
  address: PublicKey.default.toBase58(),
  programId: TOKEN_PROGRAM_ID.toBase58(),
  decimals: 9,
  symbol: 'SOL',
  name: 'Solana',
  logoURI: `https://img-v1.raydium.io/icon/So11111111111111111111111111111111111111112.png`,
  tags: [],
  priority: 2,
  type: 'raydium',
  extensions: {
    coingeckoId: 'solana',
  },
}

export const TOKEN_WSOL: TokenInfo = {
  chainId: NonEVMChainId.SOLANA,
  address: 'So11111111111111111111111111111111111111112',
  programId: TOKEN_PROGRAM_ID.toBase58(),
  decimals: 9,
  symbol: 'WSOL',
  name: 'Wrapped SOL',
  logoURI: `https://img-v1.raydium.io/icon/So11111111111111111111111111111111111111112.png`,
  tags: [],
  priority: 2,
  type: 'raydium',
  extensions: {
    coingeckoId: 'solana',
  },
}

export const WSOL: SPLToken = new SPLToken(TOKEN_WSOL)
