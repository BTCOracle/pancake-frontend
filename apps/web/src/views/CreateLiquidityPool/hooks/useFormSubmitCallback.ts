import { type Address } from 'viem'
import { BinLiquidityShape, getIdSlippage, getPoolId } from '@pancakeswap/infinity-sdk'
import { useTranslation } from '@pancakeswap/localization'
import { Currency, isCurrencySorted } from '@pancakeswap/swap-sdk-core'
import { useToast } from '@pancakeswap/uikit'
import { Permit2Signature } from '@pancakeswap/universal-router-sdk'
import { useUserSlippage, useUserSlippagePercent } from '@pancakeswap/utils/user'
import { encodeSqrtRatioX96 } from '@pancakeswap/v3-sdk'
import { INITIAL_ALLOWED_SLIPPAGE } from 'config/constants'
import { useSelectIdRouteParams } from 'hooks/dynamicRoute/useSelectIdRoute'
import { AddLiquidityParams, useAddCLPoolAndPosition } from 'hooks/infinity/useAddCLLiquidity'
import { usePermit2 } from 'hooks/usePermit2'
import { useSwitchNetwork } from 'hooks/useSwitchNetwork'
import { useTransactionDeadline } from 'hooks/useTransactionDeadline'
import { useAtomValue } from 'jotai'
import { useRouter } from 'next/router'
import { useCallback, useMemo } from 'react'
import { chainIdToExplorerInfoChainName } from 'state/info/api/client'
import { getInfinityPositionManagerAddress } from 'utils/addressHelpers'
import { calculateSlippageAmount } from 'utils/exchange'
import { maxUint128, stringify, zeroAddress } from 'viem'
import { useAccount } from 'wagmi'
import { AddBinLiquidityParams, useAddBinLiquidity } from './useAddBinLiquidity'
import { lastEditAtom, useCreateDepositAmounts } from './useCreateDepositAmounts'
import { useCurrencies } from './useCurrencies'
import {
  useInfinityBinQueryState,
  useInfinityCLQueryState,
  useInfinityCreateFormQueryState,
} from './useInfinityFormState/useInfinityFormQueryState'
import { usePoolKey } from './useInfinityFormState/usePoolKey'
import { useStartPriceAsFraction } from './useStartPriceAsFraction'

export const useFormSubmitCallback = () => {
  const { t } = useTranslation()
  const { address: account, chainId: activeChainId } = useAccount()
  const { switchNetwork } = useSwitchNetwork()
  const { toastError } = useToast()
  const { chainId } = useSelectIdRouteParams()
  const { currency0, currency1 } = useCurrencies()
  const { depositCurrencyAmount0, depositCurrencyAmount1 } = useCreateDepositAmounts()
  const startPriceAsFraction = useStartPriceAsFraction()
  const { poolType } = useInfinityCreateFormQueryState()
  const { lowerTick, upperTick } = useInfinityCLQueryState()
  const { binStep, activeId, liquidityShape, numBin, lowerBinId, upperBinId } = useInfinityBinQueryState()
  const poolKey = usePoolKey()
  const { lastEditCurrency } = useAtomValue(lastEditAtom)
  const { permit: permitCallback0, requirePermit: requirePermit0 } = usePermit2(
    currency0?.isNative ? undefined : depositCurrencyAmount0?.wrapped,
    getInfinityPositionManagerAddress(poolType, chainId),
    {
      overrideChainId: chainId,
    },
  )
  const { permit: permitCallback1, requirePermit: requirePermit1 } = usePermit2(
    currency1?.isNative ? undefined : depositCurrencyAmount1?.wrapped,
    getInfinityPositionManagerAddress(poolType, chainId),
    {
      overrideChainId: chainId,
    },
  )
  const [deadline] = useTransactionDeadline()
  const [allowedSlippage] = useUserSlippage() || [INITIAL_ALLOWED_SLIPPAGE]
  const [userSlippagePercent] = useUserSlippagePercent()
  const idSlippage = useMemo(
    () =>
      binStep !== null && activeId !== null
        ? getIdSlippage(parseFloat(userSlippagePercent.toSignificant(2)), binStep, activeId)
        : undefined,
    [userSlippagePercent, binStep, activeId],
  )

  const router = useRouter()

  const redirectToPoolDetailPage = useCallback(() => {
    if (chainId && poolKey) {
      router.push(`/liquidity/pool/${chainIdToExplorerInfoChainName[chainId]}/${getPoolId(poolKey)}`)
    }
  }, [chainId, poolKey, router])

  const { addCLLiquidity } = useAddCLPoolAndPosition(
    chainId ?? 0,
    account ?? '0x',
    currency0?.isNative ? zeroAddress : (currency0?.wrapped.address as Address) ?? '0x',
    currency1?.isNative ? zeroAddress : (currency1?.wrapped.address as Address) ?? '0x',
    redirectToPoolDetailPage,
  )

  const { addBinLiquidity } = useAddBinLiquidity(
    chainId ?? 0,
    account ?? '0x',
    currency0?.isNative ? zeroAddress : (currency0?.wrapped.address as Address) ?? '0x',
    currency1?.isNative ? zeroAddress : (currency1?.wrapped.address as Address) ?? '0x',
    redirectToPoolDetailPage,
  )

  return useCallback(async () => {
    if (!account || !chainId || !currency0 || !currency1 || !poolKey || !startPriceAsFraction) {
      console.error('Account, chainId, currencies or poolKey not found')
      return
    }

    if (activeChainId !== chainId) {
      const result = await switchNetwork(chainId)
      if (!result) return // User denied switching the network
    }

    try {
      let permit2Signature0: Permit2Signature | undefined
      let permit2Signature1: Permit2Signature | undefined

      if (!currency0?.isNative && requirePermit0) {
        permit2Signature0 = await permitCallback0()
      }

      if (!currency1?.isNative && requirePermit1) {
        permit2Signature1 = await permitCallback1()
      }

      const amount0Desired =
        !depositCurrencyAmount0 || depositCurrencyAmount0.equalTo(0) ? 0n : depositCurrencyAmount0.quotient
      const amount1Desired =
        !depositCurrencyAmount1 || depositCurrencyAmount1.equalTo(0) ? 0n : depositCurrencyAmount1.quotient
      const [amount0Min, amount0Max] = depositCurrencyAmount0
        ? calculateSlippageAmount(depositCurrencyAmount0, allowedSlippage)
        : [0n, maxUint128]
      const [amount1Min, amount1Max] = depositCurrencyAmount1
        ? calculateSlippageAmount(depositCurrencyAmount1, allowedSlippage)
        : [0n, maxUint128]

      if (poolType === 'CL') {
        // TODO: Submit create pool
        if (lowerTick === null || upperTick === null) return
        const p = isCurrencySorted(startPriceAsFraction.baseCurrency, startPriceAsFraction.quoteCurrency)
          ? startPriceAsFraction
          : startPriceAsFraction.invert()
        const sqrtPriceX96 = encodeSqrtRatioX96(p.numerator, p.denominator)
        const params: AddLiquidityParams = {
          poolKey,
          tickLower: lowerTick,
          tickUpper: upperTick,
          lastEditCurrency,
          sqrtPriceX96,
          amount0Desired,
          amount1Desired,
          amount0Max,
          amount1Max,
          recipient: account,
          currency0: currency0 as Currency,
          currency1: currency1 as Currency,
          deadline: deadline || BigInt(Math.floor(Date.now() / 1000) + 60 * 20), // 20 minutes
          modifyPositionHookData: '0x',
          token0Permit2Signature: permit2Signature0,
          token1Permit2Signature: permit2Signature1,
        }

        await addCLLiquidity(params)
      } else if (poolType === 'Bin') {
        if (
          binStep === null ||
          activeId === null ||
          liquidityShape === null ||
          numBin === null ||
          lowerBinId === null ||
          upperBinId === null
        )
          return

        const params: AddBinLiquidityParams = {
          poolKey,
          liquidityShape: liquidityShape as unknown as BinLiquidityShape,
          binNums: numBin,
          activeIdDesired: activeId,
          lowerBinId,
          upperBinId,
          idSlippage: BigInt(idSlippage ?? 0),
          amount0Desired,
          amount1Desired,
          amount0Max,
          amount1Max,
          recipient: account,
          deadline: deadline || BigInt(Math.floor(Date.now() / 1000) + 60 * 20), // 20 minutes
          currency0: currency0 as Currency,
          currency1: currency1 as Currency,
          token0Permit2Signature: permit2Signature0,
          token1Permit2Signature: permit2Signature1,
        }
        await addBinLiquidity(params)
      }
    } catch (error) {
      console.error('Error submitting form', error)
      toastError(t('Error creating pool'), error instanceof Error ? error.message : stringify(error))
    }
  }, [
    account,
    activeChainId,
    activeId,
    addBinLiquidity,
    addCLLiquidity,
    allowedSlippage,
    binStep,
    chainId,
    currency0,
    currency1,
    deadline,
    depositCurrencyAmount0,
    depositCurrencyAmount1,
    idSlippage,
    lastEditCurrency,
    liquidityShape,
    lowerBinId,
    lowerTick,
    numBin,
    permitCallback0,
    permitCallback1,
    poolKey,
    poolType,
    requirePermit0,
    requirePermit1,
    startPriceAsFraction,
    switchNetwork,
    t,
    toastError,
    upperBinId,
    upperTick,
  ])
}
