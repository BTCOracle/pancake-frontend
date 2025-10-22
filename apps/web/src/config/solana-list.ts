import { SPLToken } from '@pancakeswap/swap-sdk-core'
import type { TokenInfo } from '@pancakeswap/solana-core-sdk'
import { NonEVMChainId } from '@pancakeswap/chains'
import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token-0.4'

export const USER_ADDED_KEY = 'solana-user-added-tokens'

// NOTE: since Parser input will be different for each api, we use any type here
// but data input include TokenInfo type in its structure
type Parser = (data: any) => SPLToken[]

export enum TokenListKey {
  PANCAKESWAP = 'pancakeswap',
  RAYDIUM = 'raydium',
  JUPITER = 'jupiter',
}
export interface SolanaTokenListConfig {
  key: TokenListKey
  name: string
  logoURI: string
  description: string
  apiUrl: string
  parser: Parser
}

// Filter out PancakeSwap list since it's always enabled
export const convertRawTokenInfoIntoSPLToken = (token: TokenInfo) => {
  return new SPLToken({
    address: token.address,
    decimals: token.decimals,
    symbol: token.symbol,
    logoURI: token.logoURI,
    name: token.name,
    chainId: NonEVMChainId.SOLANA,
    programId:
      token.programId ??
      (token.tags?.includes('token-2022') ? TOKEN_2022_PROGRAM_ID.toBase58() : TOKEN_PROGRAM_ID.toBase58()),
  })
}

export const convertSPLTokenIntoRawTokenInfoUserAdded = (token: SPLToken): TokenInfo => {
  return {
    priority: 5,
    userAdded: true,
    type: 'imported',
    address: token.address,
    decimals: token.decimals,
    symbol: token.symbol,
    chainId: token.chainId,
    programId: token.programId,
    logoURI: token.logoURI,
    name: token.name ?? '',
  }
}

// Enhanced token list configuration with all necessary metadata
export const SOLANA_LISTS_CONFIG: Record<TokenListKey, SolanaTokenListConfig> = {
  [TokenListKey.PANCAKESWAP]: {
    key: TokenListKey.PANCAKESWAP,
    name: 'PancakeSwap',
    logoURI: 'https://pancakeswap.finance/logo.png',
    description: 'PancakeSwap Token List',
    apiUrl: 'https://tokens.pancakeswap.finance/pancakeswap-solana-default.json',
    parser: (data: { tokens: TokenInfo[] }) => {
      return (data?.tokens ?? []).map(convertRawTokenInfoIntoSPLToken)
    }, // Default parser for standard token lists
  },
  [TokenListKey.RAYDIUM]: {
    key: TokenListKey.RAYDIUM,
    name: 'Raydium',
    logoURI: 'https://img-v1.raydium.io/icon/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R.png',
    description: 'Raydium Token List',
    apiUrl: 'https://api-v3.raydium.io/mint/list',
    parser: (data: { data: { mintList: TokenInfo[]; blacklist: string[]; whitelist: string[] } }) => {
      const { mintList: listTokens, blacklist = [] } = data?.data ?? {}
      const tokens: SPLToken[] = []

      for (const token of listTokens) {
        if (blacklist.includes(token.address)) continue
        tokens.push(convertRawTokenInfoIntoSPLToken(token))
      }

      return tokens
    }, // Special parser for Raydium format
  },
  [TokenListKey.JUPITER]: {
    key: TokenListKey.JUPITER,
    name: 'Jupiter',
    logoURI: 'https://jup.ag/_next/image?url=%2Fsvg%2Fjupiter-logo.png&w=96&q=75',
    description: 'Jupiter Token List',
    apiUrl: 'https://lite-api.jup.ag/tokens/v1/tagged/verified',
    parser: (data: TokenInfo[]) => {
      return (data ?? []).map(convertRawTokenInfoIntoSPLToken)
    },
  },
}

// Filter out PancakeSwap list since it's always enabled
export const SOLANA_LISTS = Object.values(SOLANA_LISTS_CONFIG)
