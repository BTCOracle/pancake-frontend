import { BinLiquidityShape, BinPool, getIdSlippage, Permit2Signature, PoolKey } from '@pancakeswap/infinity-sdk'
import { useTranslation } from '@pancakeswap/localization'
import { useToast } from '@pancakeswap/uikit'
import { useUserSlippage, useUserSlippagePercent } from '@pancakeswap/utils/user'
import { INITIAL_ALLOWED_SLIPPAGE } from 'config/constants'
import { useInfinityPoolIdRouteParams } from 'hooks/dynamicRoute/usePoolIdRoute'
import { AddLiquidityParams, useAddCLPoolAndPosition } from 'hooks/infinity/useAddCLLiquidity'
import { usePoolKeyByPoolId } from 'hooks/infinity/usePoolKeyByPoolId'
import { usePermit2 } from 'hooks/usePermit2'
import { useSwitchNetwork } from 'hooks/useSwitchNetwork'
import { useTransactionDeadline } from 'hooks/useTransactionDeadline'
import { useAtomValue } from 'jotai'
import { useRouter } from 'next/router'
import { useCallback, useMemo } from 'react'
import {
  useBinNumQueryState,
  useBinRangeQueryState,
  useClRangeQueryState,
  useLiquidityShapeQueryState,
} from 'state/infinity/shared'
import { chainIdToExplorerInfoChainName } from 'state/info/api/client'
import { getInfinityPositionManagerAddress } from 'utils/addressHelpers'
import { calculateSlippageAmount } from 'utils/exchange'
import { maxUint128, stringify, zeroAddress } from 'viem'
import { AddBinLiquidityParams, useAddBinLiquidity } from 'views/CreateLiquidityPool/hooks/useAddBinLiquidity'
import { useAccount } from 'wagmi'
import { lastEditAtom, useAddDepositAmounts } from './useAddDepositAmounts'
import { usePool } from './usePool'

export const useAddFormSubmitCallback = () => {
  const { address: account, chainId: activeChainId } = useAccount()
  const { chainId, poolId } = useInfinityPoolIdRouteParams()
  const pool = usePool()
  const { switchNetwork } = useSwitchNetwork()
  const { toastError } = useToast()
  const { t } = useTranslation()
  const { lastEditCurrency } = useAtomValue(lastEditAtom)

  const { data: poolKey } = usePoolKeyByPoolId(poolId, chainId)

  const [currency0, currency1] = useMemo(() => {
    return [pool?.token0, pool?.token1]
  }, [pool])

  const { depositCurrencyAmount0, depositCurrencyAmount1 } = useAddDepositAmounts()
  const [{ lowerTick, upperTick }] = useClRangeQueryState()
  const [{ lowerBinId, upperBinId }] = useBinRangeQueryState()
  const [liquidityShape] = useLiquidityShapeQueryState()
  const [numBin] = useBinNumQueryState()

  const { permit: permitCallback0, requirePermit: requirePermit0 } = usePermit2(
    currency0?.isNative ? undefined : depositCurrencyAmount0?.wrapped,
    pool?.poolType ? getInfinityPositionManagerAddress(pool.poolType, chainId) : undefined,
    {
      overrideChainId: chainId,
    },
  )

  const { permit: permitCallback1, requirePermit: requirePermit1 } = usePermit2(
    currency1?.isNative ? undefined : depositCurrencyAmount1?.wrapped,
    pool?.poolType ? getInfinityPositionManagerAddress(pool.poolType, chainId) : undefined,
    {
      overrideChainId: chainId,
    },
  )
  const [deadline] = useTransactionDeadline()
  const [allowedSlippage] = useUserSlippage() || [INITIAL_ALLOWED_SLIPPAGE]
  const [userSlippagePercent] = useUserSlippagePercent()
  const idSlippage = useMemo(() => {
    if (!pool || pool.poolType !== 'Bin') return undefined
    const { binStep, activeId } = pool as BinPool
    return getIdSlippage(parseFloat(userSlippagePercent.toSignificant(2)), binStep, activeId)
  }, [userSlippagePercent, pool])

  const router = useRouter()

  const redirectToPoolDetailPage = useCallback(() => {
    if (chainId && poolId) {
      router.push(`/liquidity/pool/${chainIdToExplorerInfoChainName[chainId]}/${poolId}`)
    }
  }, [chainId, poolId, router])

  const { addCLLiquidity, attemptingTx: attemptingTxCL } = useAddCLPoolAndPosition(
    chainId ?? 0,
    account ?? '0x',
    currency0?.isNative ? zeroAddress : currency0?.wrapped.address ?? '0x',
    currency1?.isNative ? zeroAddress : currency1?.wrapped.address ?? '0x',
    redirectToPoolDetailPage,
  )

  const { addBinLiquidity, attemptingTx: attemptingTxBin } = useAddBinLiquidity(
    chainId ?? 0,
    account ?? '0x',
    currency0?.isNative ? zeroAddress : currency0?.wrapped.address ?? '0x',
    currency1?.isNative ? zeroAddress : currency1?.wrapped.address ?? '0x',
    redirectToPoolDetailPage,
  )

  const onSubmit = useCallback(async () => {
    if (!account || !chainId || !currency0 || !currency1 || !poolKey) {
      console.error('Account, chainId, currencies or poolKey not found')
      return
    }

    if (activeChainId !== chainId) {
      const result = await switchNetwork(chainId)
      if (!result) return // Switch network fail
    }

    try {
      let permit2Signature0: Permit2Signature | undefined
      let permit2Signature1: Permit2Signature | undefined

      const amount0Desired = depositCurrencyAmount0?.quotient ?? 0n
      const amount1Desired = depositCurrencyAmount1?.quotient ?? 0n

      if (!currency0?.isNative && requirePermit0 && amount0Desired > 0n) {
        permit2Signature0 = await permitCallback0()
      }

      if (!currency1?.isNative && requirePermit1 && amount1Desired > 0n) {
        permit2Signature1 = await permitCallback1()
      }

      const [amount0Min, amount0Max] = depositCurrencyAmount0
        ? calculateSlippageAmount(depositCurrencyAmount0, allowedSlippage)
        : [0n, maxUint128]
      const [amount1Min, amount1Max] = depositCurrencyAmount1
        ? calculateSlippageAmount(depositCurrencyAmount1, allowedSlippage)
        : [0n, maxUint128]

      if (pool?.poolType === 'CL') {
        if (lowerTick === null || upperTick === null) return
        const sqrtPriceX96 = pool.sqrtRatioX96
        const params: AddLiquidityParams = {
          poolKey: poolKey as PoolKey<'CL'>,
          tickLower: lowerTick,
          tickUpper: upperTick,
          lastEditCurrency,
          sqrtPriceX96,
          amount0Desired,
          amount1Desired,
          amount0Max,
          amount1Max,
          recipient: account,
          currency0,
          currency1,
          deadline: deadline || BigInt(Math.floor(Date.now() / 1000) + 60 * 20), // 20 minutes
          modifyPositionHookData: '0x',
          token0Permit2Signature: permit2Signature0,
          token1Permit2Signature: permit2Signature1,
        }

        await addCLLiquidity(params)
      } else if (pool?.poolType === 'Bin') {
        const { binStep, activeId } = pool as BinPool
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
          poolKey: poolKey as PoolKey<'Bin'>,
          liquidityShape: liquidityShape as unknown as BinLiquidityShape,
          binNums: numBin,
          // @fixme: use real activeIdDesired when add liquidity
          activeIdDesired: activeId,
          idSlippage: BigInt(idSlippage ?? 0),
          amount0Desired,
          amount1Desired,
          amount0Max,
          amount1Max,
          recipient: account,
          deadline: deadline || BigInt(Math.floor(Date.now() / 1000) + 60 * 20), // 20 minutes
          currency0,
          currency1,
          lowerBinId,
          upperBinId,
          token0Permit2Signature: permit2Signature0,
          token1Permit2Signature: permit2Signature1,
        }
        await addBinLiquidity(params)
      }
    } catch (error) {
      console.error('Error submitting form', error)
      toastError(t('Error Add Liquidity'), error instanceof Error ? error.message : stringify(error))
    }
  }, [
    lastEditCurrency,
    account,
    activeChainId,
    addBinLiquidity,
    addCLLiquidity,
    allowedSlippage,
    chainId,
    currency0,
    currency1,
    deadline,
    depositCurrencyAmount0,
    depositCurrencyAmount1,
    idSlippage,
    liquidityShape,
    lowerBinId,
    lowerTick,
    numBin,
    permitCallback0,
    permitCallback1,
    pool,
    poolKey,
    requirePermit0,
    requirePermit1,
    switchNetwork,
    t,
    toastError,
    upperBinId,
    upperTick,
  ])

  const attemptingTx = useMemo(() => {
    if (!pool) return false
    if (pool.poolType === 'CL') return attemptingTxCL
    if (pool.poolType === 'Bin') return attemptingTxBin
    return false
  }, [attemptingTxCL, attemptingTxBin, pool])

  return { onSubmit, attemptingTx }
}
