import { ChainId } from '@pancakeswap/sdk'
import { CurrencyAmount } from '@pancakeswap/swap-sdk-core'
import useNativeCurrency from 'hooks/useNativeCurrency'
import { useStablecoinPrice } from 'hooks/useStablecoinPrice'
import { useMemo } from 'react'
import { multiplyPriceByAmount } from 'utils/prices'
import { useReadContract } from 'wagmi'
import { PancakeGiftV1Abi } from '../abis/PancakeGiftV1Abi'
import { GIFT_PANCAKE_V1_ADDRESS } from '../constants'

export const useReadGasPayment = () => {
  const chainId = ChainId.BSC
  const { data: gasPayment } = useReadContract({
    address: GIFT_PANCAKE_V1_ADDRESS,
    abi: PancakeGiftV1Abi,
    functionName: 'GAS_PAYMENT',
    chainId,
  })

  // either bigint or undefined
  return gasPayment as bigint | undefined
}

export const useReadGasPaymentAmount = (chainId?: ChainId) => {
  const nativeCurrency = useNativeCurrency(chainId ?? ChainId.BSC)
  const gasPayment = useReadGasPayment()
  const stableNativePrice = useStablecoinPrice(nativeCurrency)

  return useMemo(() => {
    const gasPaymentAmount = gasPayment ? CurrencyAmount.fromRawAmount(nativeCurrency, gasPayment) : undefined
    return {
      gasPayment: gasPaymentAmount,
      gasPaymentUsd: gasPaymentAmount
        ? multiplyPriceByAmount(stableNativePrice, parseFloat(gasPaymentAmount.toExact()) || 0)
        : 0,
    }
  }, [gasPayment, nativeCurrency, stableNativePrice])
}
