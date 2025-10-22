import { Currency } from '@pancakeswap/sdk'
import { useMemo } from 'react'
import { useCurrencyBalanceWithChain } from 'state/wallet/hooks'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import { useAccount } from 'wagmi'

export const useMaxAmount = (currency: Currency | undefined) => {
  const { address: account } = useAccount()
  const balance = useCurrencyBalanceWithChain(account, currency, currency?.chainId)

  return useMemo(() => maxAmountSpend(balance), [balance])
}
