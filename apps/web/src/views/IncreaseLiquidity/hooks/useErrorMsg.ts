import { useTranslation } from '@pancakeswap/localization'
import { Currency, CurrencyAmount, Price, Token } from '@pancakeswap/swap-sdk-core'
import { TickMath, encodeSqrtRatioX96 } from '@pancakeswap/v3-sdk'
import { PoolState } from 'hooks/v3/types'
import { ReactNode, useMemo } from 'react'
import { useCurrencyBalances } from 'state/wallet/hooks'
import { useAccount } from 'wagmi'

export const useErrorMsg = ({
  poolState,
  currencyA,
  currencyB,
  currencyAAmount,
  currencyBAmount,
  price,
  allowSingleSide = false,
}: {
  poolState?: PoolState
  currencyA?: Currency
  currencyB?: Currency
  currencyAAmount: CurrencyAmount<Currency> | undefined
  currencyBAmount: CurrencyAmount<Currency> | undefined
  price?: Price<Token, Token>
  allowSingleSide?: boolean
}) => {
  const { t } = useTranslation()
  const { address: account } = useAccount()
  let hasInsufficentBalance = false
  let errorMessage: ReactNode | undefined
  if (!account) {
    errorMessage = t('Connect Wallet')
  }

  if (poolState === PoolState.INVALID) {
    errorMessage = errorMessage ?? t('Invalid pair')
  }

  const invalidPrice = useMemo(() => {
    const sqrtRatioX96 = price ? encodeSqrtRatioX96(price.numerator, price.denominator) : undefined
    return price && sqrtRatioX96 && !(sqrtRatioX96 >= TickMath.MIN_SQRT_RATIO && sqrtRatioX96 < TickMath.MAX_SQRT_RATIO)
  }, [price])

  if (invalidPrice) {
    errorMessage = errorMessage ?? t('Invalid price input')
  }

  if (!allowSingleSide && (!currencyAAmount || !currencyBAmount)) {
    errorMessage = errorMessage ?? t('Enter an amount')
  }

  if (allowSingleSide && !currencyAAmount && !currencyBAmount) {
    errorMessage = errorMessage ?? t('Enter an amount')
  }

  const [balanceA, balanceB] = useCurrencyBalances(
    account ?? undefined,
    useMemo(() => [currencyA, currencyB], [currencyA, currencyB]),
  )

  if (currencyAAmount && (currencyAAmount?.equalTo(0) || balanceA?.lessThan(currencyAAmount))) {
    hasInsufficentBalance = true
    errorMessage = t('Insufficient %symbol% balance', { symbol: currencyA?.symbol ?? '' })
  }

  if (currencyBAmount && (currencyBAmount?.equalTo(0) || balanceB?.lessThan(currencyBAmount))) {
    hasInsufficentBalance = true
    errorMessage = t('Insufficient %symbol% balance', { symbol: currencyB?.symbol ?? '' })
  }
  return {
    hasInsufficentBalance,
    errorMessage,
  }
}
