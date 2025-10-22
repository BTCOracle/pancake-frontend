import { solToWSol } from '@pancakeswap/solana-core-sdk'
import useSWR from 'swr'
import { shallow } from 'zustand/shallow'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Decimal from 'decimal.js'
import { useTranslation } from '@pancakeswap/localization'
import axios from '@/api/axios'
import { useAppStore } from '@/store'
import { debounce } from '@/utils/functionMethods'
import { isValidPublicKey } from '@/utils/publicKey'
import { quoteApi } from '@/utils/config/endpoint'
import { SwapType, QuoteRequest, QuoteResponse } from './type'
import { useSwapStore } from './useSwapStore'

const fetcher = async ([url, data]: [url: string, data: QuoteRequest]): Promise<QuoteResponse> => axios.post(url, data)

export default function useSwap(props: {
  shouldFetch?: boolean
  inputMint?: string
  outputMint?: string
  amount?: string
  refreshInterval?: number
  slippageBps?: number
  swapType: SwapType
}) {
  const {
    inputMint: propInputMint = '',
    outputMint: propOutputMint = '',
    amount: propsAmount,
    slippageBps: propsSlippage,
    swapType,
    refreshInterval = 30 * 1000
  } = props || {}

  const { t } = useTranslation()
  const [amount, setAmount] = useState('')
  const [inputMint, outputMint] = [
    isValidPublicKey(propInputMint) ? solToWSol(propInputMint).toBase58() : propInputMint,
    isValidPublicKey(propOutputMint) ? solToWSol(propOutputMint).toBase58() : propOutputMint
  ]

  const slippage = useSwapStore((s) => s.slippage)
  const slippageBps = new Decimal(propsSlippage || slippage * 10000).toFixed(0)

  const disabled = useMemo(() => {
    return !inputMint || !outputMint || new Decimal(amount.trim() || 0).isZero() || inputMint === outputMint
  }, [inputMint, outputMint, amount])

  const requestBody: QuoteRequest = useMemo(() => {
    return {
      inputMint,
      outputMint,
      amount: new Decimal(amount.trim() || 0).toFixed(0),
      slippageBps: Number(slippageBps),
      swapType
    }
  }, [inputMint, outputMint, amount, slippageBps, swapType])

  const updateAmount = useCallback(
    debounce((val: string) => {
      setAmount(val)
    }, 200),
    []
  )

  useEffect(() => {
    updateAmount(propsAmount)
  }, [propsAmount, updateAmount])

  const { data, error, ...swrProps } = useSWR(() => (disabled ? null : [`${quoteApi}/quote`, requestBody]), fetcher, {
    refreshInterval,
    focusThrottleInterval: refreshInterval,
    dedupingInterval: 30 * 1000
  })

  return {
    response: error || !data?.success ? undefined : data,
    data: error || !data?.success ? undefined : data,
    error: error?.message || (!data?.success && data?.msg) ? t('Insufficient liquidity for this trade.') : undefined,
    ...swrProps
  }
}
