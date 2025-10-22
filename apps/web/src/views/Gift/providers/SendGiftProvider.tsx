// Create a provider for the SendGiftView

import { ChainId, CurrencyAmount, NativeCurrency } from '@pancakeswap/sdk'
import { useGetNativeTokenBalance } from 'hooks/useTokenBalance'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

interface SendGiftContextType {
  isSendGift: boolean
  setIsSendGift: (isSendGift: boolean) => void
  nativeAmount: CurrencyAmount<NativeCurrency> | undefined
  setNativeAmount: (amount: CurrencyAmount<NativeCurrency> | undefined) => void
  includeStarterGas: boolean
  setIncludeStarterGas: (include: boolean) => void
  isUserInsufficientBalance: boolean
}

export const SendGiftContext = createContext<SendGiftContextType>({
  isSendGift: false,
  setIsSendGift: (_isSendGift: boolean) => {},
  nativeAmount: undefined,
  setNativeAmount: (_amount: CurrencyAmount<NativeCurrency> | undefined) => {},
  includeStarterGas: false,
  setIncludeStarterGas: (_include: boolean) => {},
  isUserInsufficientBalance: false,
})

export const useSendGiftContext = () => {
  const context = useContext(SendGiftContext)
  if (!context) {
    throw new Error('useSendGiftContext must be used within a SendGiftProvider')
  }
  return context
}

export const SendGiftProvider = ({ children }: { children: React.ReactNode }) => {
  const [isSendGift, setIsSendGift] = useState(false)
  const [nativeAmount, setNativeAmount] = useState<CurrencyAmount<NativeCurrency> | undefined>(undefined)
  const [includeStarterGas, setIncludeStarterGas] = useState(false)
  const { balance: nativeCurrencyBalance } = useGetNativeTokenBalance(ChainId.BSC)

  const isUserInsufficientBalance = useMemo(() => {
    return Boolean(nativeAmount?.greaterThan(nativeCurrencyBalance))
  }, [nativeAmount, nativeCurrencyBalance])

  useEffect(() => {
    if (!isSendGift) {
      setIncludeStarterGas(false)
    }
  }, [isSendGift, setIncludeStarterGas])

  useEffect(() => {
    if (!includeStarterGas) {
      setNativeAmount(undefined)
    }
  }, [includeStarterGas])

  const handleToggleIncludeStarterGas = useCallback(
    (value: boolean) => {
      setIncludeStarterGas(value)
    },
    [setIncludeStarterGas],
  )

  const value = useMemo(
    () => ({
      isSendGift,
      setIsSendGift,
      nativeAmount,
      setNativeAmount,
      includeStarterGas,
      setIncludeStarterGas: handleToggleIncludeStarterGas,
      isUserInsufficientBalance,
    }),
    [
      isSendGift,
      isUserInsufficientBalance,
      setIsSendGift,
      nativeAmount,
      setNativeAmount,
      includeStarterGas,
      handleToggleIncludeStarterGas,
    ],
  )

  return <SendGiftContext.Provider value={value}>{children}</SendGiftContext.Provider>
}
