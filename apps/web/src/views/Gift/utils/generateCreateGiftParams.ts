import { CurrencyAmount, Token, NativeCurrency } from '@pancakeswap/swap-sdk-core'
import { zeroAddress } from 'viem'

interface CreateGiftParams {
  tokenAmount: CurrencyAmount<Token | NativeCurrency>
  nativeAmount?: CurrencyAmount<NativeCurrency>
  gasPaymentBigInt: bigint
}

export const generateCreateGiftParams = ({ tokenAmount, nativeAmount, gasPaymentBigInt }: CreateGiftParams) => {
  const tokenAddress = tokenAmount.currency.isNative ? zeroAddress : tokenAmount.currency.address
  const tokenAmountBigInt = tokenAmount.currency.isNative ? 0n : tokenAmount.quotient
  const nativeAmountBigInt = tokenAmount.currency.isNative ? tokenAmount.quotient : nativeAmount?.quotient ?? 0n

  const transactionValue = nativeAmountBigInt + gasPaymentBigInt

  return {
    tokenAddress,
    tokenAmountBigInt,
    nativeAmountBigInt,
    transactionValue,
  }
}
