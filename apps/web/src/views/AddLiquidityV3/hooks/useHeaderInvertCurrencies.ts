import { useCallback } from 'react'
import { useRouter } from 'next/router'
import { FeeAmount } from '@pancakeswap/v3-sdk'
import { atom, useAtomValue, useSetAtom } from 'jotai'

const currencyInversionEventAtom = atom<{
  currencyIdA: string
  currencyIdB: string
} | null>(null)

interface UseHeaderInvertCurrenciesProps {
  currencyIdA?: string
  currencyIdB?: string
  feeAmount?: FeeAmount
}

export const useHeaderInvertCurrencies = ({ currencyIdA, currencyIdB, feeAmount }: UseHeaderInvertCurrenciesProps) => {
  const router = useRouter()

  const setInversionEvent = useSetAtom(currencyInversionEventAtom)

  const triggerInversionEvent = useCallback(() => {
    if (currencyIdA && currencyIdB) {
      setInversionEvent({ currencyIdA: currencyIdB, currencyIdB: currencyIdA })
    }
    router.events.off('routeChangeComplete', triggerInversionEvent)
  }, [router.events, setInversionEvent, currencyIdB, currencyIdA])

  const handleInvertCurrencies = useCallback(() => {
    if (currencyIdA && currencyIdB) {
      router.push({
        pathname: router.pathname,
        query: {
          ...router.query,
          currency: feeAmount ? [currencyIdB!, currencyIdA!, feeAmount?.toString()] : [currencyIdB!, currencyIdA!],
        },
      })
      if (router.isReady) {
        triggerInversionEvent()
      } else {
        router.events.on('routeChangeComplete', triggerInversionEvent)
      }
    }
  }, [triggerInversionEvent, currencyIdA, currencyIdB, feeAmount, router])

  return { handleInvertCurrencies }
}

export const useCurrencyInversionEvent = () => {
  return useAtomValue(currencyInversionEventAtom)
}
