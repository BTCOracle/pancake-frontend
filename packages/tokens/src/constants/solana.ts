import { NonEVMChainId } from '@pancakeswap/chains'
import { SPLToken, TOKEN_WSOL } from '@pancakeswap/sdk'

export const solanaTokens = {
  usdc: new SPLToken({
    chainId: NonEVMChainId.SOLANA,
    address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
    logoURI: 'https://img-v1.raydium.io/icon/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v.png',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
  }),
  usdt: new SPLToken({
    chainId: NonEVMChainId.SOLANA,
    address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
    logoURI: 'https://img-v1.raydium.io/icon/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB.png',
    symbol: 'USDT',
    name: 'USDT',
    decimals: 6,
  }),
  wsol: new SPLToken(TOKEN_WSOL),
  cake: new SPLToken({
    chainId: NonEVMChainId.SOLANA,
    address: '4qQeZ5LwSz6HuupUu8jCtgXyW1mYQcNbFAW1sWZp89HL',
    programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
    logoURI: 'https://tokens.pancakeswap.finance/images/solana/4qQeZ5LwSz6HuupUu8jCtgXyW1mYQcNbFAW1sWZp89HL.png',
    symbol: 'Cake',
    name: 'PancakeSwap Token',
    decimals: 9,
  }),
}
