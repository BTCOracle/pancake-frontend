import { useMemo } from 'react'
import { ammConfigs, type AmmConfig } from '@pancakeswap/solana-clmm-sdk'

// Returns Solana CLMM AMM configs for mainnet-beta
export const useClmmAmmConfigs = () => {
  return useMemo<Record<string, AmmConfig>>(() => ammConfigs['mainnet-beta'] || {}, [])
}
