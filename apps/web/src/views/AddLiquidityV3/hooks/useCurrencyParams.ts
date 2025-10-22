import { ChainId, isEvm, isSolana } from '@pancakeswap/chains'
import { CAKE, STABLE_COIN, USDC, USDT } from '@pancakeswap/tokens'
import { FeeAmount } from '@pancakeswap/v3-sdk'
import { useClmmAmmConfigs } from 'hooks/solana/useClmmAmmConfigs'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useUnifiedNativeCurrency } from 'hooks/useNativeCurrency'
import { useRouter } from 'next/router'
import { useMemo } from 'react'

export function useCurrencyParams(): {
  currencyIdA: string | undefined
  currencyIdB: string | undefined
  feeAmount: FeeAmount | undefined
} {
  const { chainId } = useActiveChainId()
  const router = useRouter()
  const native = useUnifiedNativeCurrency()

  // Get default currency pair based on chain
  const getDefaultCurrencyPair = () => {
    if (!chainId) return [undefined, undefined]

    // BNB-USDT on BNB Chain
    if (chainId === ChainId.BSC) {
      return [
        native.symbol,
        USDT[chainId]?.address || CAKE[chainId]?.address || STABLE_COIN[chainId]?.address || USDC[chainId]?.address,
      ]
    }

    // ETH-USDC on all other EVM deployments
    return [
      native.symbol,
      USDC[chainId]?.address || USDT[chainId]?.address || CAKE[chainId]?.address || STABLE_COIN[chainId]?.address,
    ]
  }

  const [currencyIdA, currencyIdB] =
    router.isReady && chainId ? router.query.currency || getDefaultCurrencyPair() : [undefined, undefined, undefined]

  const feeAmount: FeeAmount | undefined = useFeeAmountFromQuery()

  return { currencyIdA, currencyIdB, feeAmount }
}

export const useFeeAmountFromQuery = () => {
  const { chainId } = useActiveChainId()
  const router = useRouter()
  const ammconfig = useClmmAmmConfigs()

  const [, , feeAmountFromUrl] = (router.isReady && chainId && router.query.currency) || [
    undefined,
    undefined,
    undefined,
  ]
  return useMemo(
    () =>
      feeAmountFromUrl &&
      ((isEvm(chainId) && Object.values(FeeAmount).includes(parseFloat(feeAmountFromUrl))) ||
        (isSolana(chainId) && Object.values(ammconfig).find((c) => c.tradeFeeRate === parseFloat(feeAmountFromUrl))))
        ? parseFloat(feeAmountFromUrl)
        : undefined,
    [chainId, ammconfig, feeAmountFromUrl],
  )
}
