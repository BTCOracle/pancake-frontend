import {
  Currency,
  CurrencyAmount,
  SPLNativeCurrency,
  SPLToken,
  UnifiedCurrency,
  UnifiedCurrencyAmount,
} from '@pancakeswap/sdk'

import { useMemo } from 'react'
import { useSolanaTokenBalance, useSolanaTokenBalances } from 'state/token/solanaTokenBalances'
import { useCurrencyBalance, useCurrencyBalances } from '../state/wallet/hooks'
import { useAccountActiveChain } from './useAccountActiveChain'

export type UnifiedBalance = CurrencyAmount<Currency> | UnifiedCurrencyAmount<UnifiedCurrency>

export function useUnifiedCurrencyBalance(currency?: UnifiedCurrency | null): UnifiedBalance | undefined {
  const { account: evmAccount, solanaAccount } = useAccountActiveChain()
  const isSolana = currency && 'programId' in currency
  const solanaBalance = useSolanaTokenBalance(solanaAccount, isSolana ? currency.address : undefined)

  const evmBalance = useCurrencyBalance(evmAccount, currency as Currency)

  if (isSolana && solanaBalance) {
    return UnifiedCurrencyAmount.fromRawAmount(currency, solanaBalance.balance.toString())
  }
  if (evmBalance) {
    return evmBalance
  }
  return undefined
}

export function useUnifiedCurrencyBalances(
  currencies?: (UnifiedCurrency | undefined)[],
): (UnifiedBalance | undefined)[] {
  const { account: evmAccount, solanaAccount } = useAccountActiveChain()

  // Separate Solana and EVM currencies while keeping track of their original positions
  const solanaCurrencies = useMemo(() => {
    return currencies?.filter((currency) => currency && SPLToken.isSPLToken(currency)) as SPLToken[]
  }, [currencies])

  const evmCurrencies = useMemo(() => {
    return currencies?.filter((currency) => currency && !SPLToken.isSPLToken(currency)) as Currency[]
  }, [currencies])

  // Get addresses for Solana tokens
  const solanaCurrenciesAddresses = useMemo(() => {
    return solanaCurrencies?.map((currency) => currency.address) || []
  }, [solanaCurrencies])

  // Fetch balances for each currency type
  const solanaBalances = useSolanaTokenBalances(
    solanaAccount,
    solanaCurrencies?.length > 0 ? solanaCurrenciesAddresses : undefined,
  )
  const evmBalances = useCurrencyBalances(evmAccount, evmCurrencies?.length > 0 ? evmCurrencies : undefined)

  // Map each currency to its balance, preserving original order
  return useMemo(() => {
    if (!currencies) return []

    return currencies.map((currency) => {
      if (!currency) return undefined

      // Handle Solana currencies
      if (SPLToken.isSPLToken(currency)) {
        const balance = solanaBalances?.balances.get((currency as SPLToken)?.address || '')
        return balance ? UnifiedCurrencyAmount.fromRawAmount(currency, balance.toString()) : undefined
      }

      // Handle EVM currencies
      const evmIndex = evmCurrencies?.findIndex((evmCurrency) => evmCurrency === currency)
      return evmIndex !== undefined && evmIndex >= 0 ? evmBalances?.[evmIndex] : undefined
    })
  }, [currencies, solanaBalances, evmBalances, evmCurrencies])
}
