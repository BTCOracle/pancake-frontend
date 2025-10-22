import { Currency, CurrencyAmount } from '@pancakeswap/swap-sdk-core'
import { useSelectIdRouteParams } from 'hooks/dynamicRoute/useSelectIdRoute'
import { useMemo } from 'react'
import { useCurrencyBalancesWithChain } from 'state/wallet/hooks'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import { CurrencyField as Field } from 'utils/types'
import { useAccount } from 'wagmi'

interface UseInfinityInfoParams {
  currencies: { [Field.CURRENCY_A]?: Currency; [Field.CURRENCY_B]?: Currency }
}

export const useInfinityInfo = ({ currencies }: UseInfinityInfoParams) => {
  const { address: account } = useAccount()
  const { chainId } = useSelectIdRouteParams()

  // Fetch currency balances
  const balances = useCurrencyBalancesWithChain(
    account,
    useMemo(() => [currencies[Field.CURRENCY_A], currencies[Field.CURRENCY_B]], [currencies]),
    chainId,
  )
  const currencyBalances: { [field in Field]?: CurrencyAmount<Currency> } = useMemo(
    () => ({
      [Field.CURRENCY_A]: balances[0],
      [Field.CURRENCY_B]: balances[1],
    }),
    [balances],
  )
  const maxAmounts: { [field in Field]?: CurrencyAmount<Currency> } = useMemo(
    () =>
      [Field.CURRENCY_A, Field.CURRENCY_B].reduce((accumulator, field) => {
        return {
          ...accumulator,
          [field]: maxAmountSpend(currencyBalances[field]),
        }
      }, {}),
    [currencyBalances],
  )

  return {
    currencyBalances,
    maxAmounts,
  }
}
