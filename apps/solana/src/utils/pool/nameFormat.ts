import { ApiV3Token } from '@pancakeswap/solana-core-sdk'
import { wSolToSolString } from '@/utils/token'

export const transformSymbol = (symbols: ApiV3Token[]) => {
  if (symbols.length < 2) return wSolToSolString(symbols[0].symbol) || symbols[0]?.address.substring(0, 6)
  return `${wSolToSolString(symbols[0].symbol) || symbols[0]?.address.substring(0, 6)} - ${
    wSolToSolString(symbols[1]?.symbol) || symbols[1]?.address.substring(0, 6)
  }`
}
