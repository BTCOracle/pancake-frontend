import useCatchTxError from 'hooks/useCatchTxError'
import { useCLLimitOrderHookContract } from 'hooks/useContract'
import { useAtomValue } from 'jotai'
import { useCallback, useState } from 'react'
import { encodePoolKey, PoolKey } from '@pancakeswap/infinity-sdk'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { TickMath, maxLiquidityForAmounts } from '@pancakeswap/v3-sdk'
import { useToast } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { stringify } from 'viem/utils'
import { Hex } from 'viem'
import { calculateGasMargin } from 'utils'
import { useTransactionAdder } from 'state/transactions/hooks'
import { BigNumber as BN } from 'bignumber.js'
import { inputCurrencyAtom, outputCurrencyAtom } from '../state/currency/currencyAtoms'
import { Field } from '../types/limitOrder.types'
import { formattedAmountsAtom, parsedAmountsAtom } from '../state/form/inputAtoms'
import { ticksAtom } from '../state/form/ticksAtom'
import { selectedPoolAtom } from '../state/pools/selectedPoolAtom'
import { useUserOpenLimitOrders } from './useUserLimitOrders'
import { currentMarketPriceAtom } from '../state/form/currentMarketPriceAtom'
import { customMarketPriceAtom } from '../state/form/customMarketPriceAtom'

interface UsePlaceLimitOrder {
  onError?: (error: any) => void
  onSuccess?: (hash: Hex) => void
}

export const usePlaceLimitOrder = ({ onError, onSuccess }: UsePlaceLimitOrder = {}) => {
  const { t } = useTranslation()
  const { account } = useAccountActiveChain()

  const contract = useCLLimitOrderHookContract()
  const { fetchWithCatchTxError } = useCatchTxError()
  const { toastError } = useToast()
  const addTransaction = useTransactionAdder()

  // Refetch user limit orders in OrdersSummaryCard
  const { refetch: refetchUserLimitOrders } = useUserOpenLimitOrders()

  const [isPlacingOrder, setIsPlacingOrder] = useState(false)

  const inputCurrency = useAtomValue(inputCurrencyAtom)
  const outputCurrency = useAtomValue(outputCurrencyAtom)

  const parsedAmounts = useAtomValue(parsedAmountsAtom)
  const ticksData = useAtomValue(ticksAtom)

  // For storing txn data in list
  const formattedAmounts = useAtomValue(formattedAmountsAtom)
  const currentMarketPrice = useAtomValue(currentMarketPriceAtom)
  const customMarketPrice = useAtomValue(customMarketPriceAtom)

  const { data: selectedPool, refetch: refetchSelectedPool } = useAtomValue(selectedPoolAtom)

  // TODO: Handle passing native amounts
  const placeOrder = useCallback(async () => {
    if (!selectedPool || !account || !ticksData || !inputCurrency || !outputCurrency) return

    const parsedAmountA = parsedAmounts[Field.CURRENCY_A]
    if (!parsedAmountA) return

    // PoolKey
    const { poolInfo } = selectedPool
    const poolKey: PoolKey = {
      currency0: poolInfo.currency0,
      currency1: poolInfo.currency1,
      poolManager: poolInfo.poolManager,
      fee: poolInfo.fee,
      parameters: poolInfo.parameters,
      hooks: poolInfo.hooks,
    }
    const encodedPoolKey = encodePoolKey(poolKey)

    // Ticks Calculation
    // Inverted ticks needed only if selling/buying at Bad price
    const { zeroForOne, tickLower, tickUpper } = ticksData

    const targetTick = tickLower

    // Liquidity calculation using both token amounts
    const amount0 = zeroForOne ? parsedAmountA : 0n // Only provide input amount when selling currency0
    const amount1 = zeroForOne ? 0n : parsedAmountA // Only provide input amount when selling currency1

    const liquidity = maxLiquidityForAmounts(
      poolInfo.sqrtPriceX96,
      TickMath.getSqrtRatioAtTick(tickLower),
      TickMath.getSqrtRatioAtTick(tickUpper),
      amount0,
      amount1,
      true, // useFullPrecision
    )

    console.debug('placeOrder', {
      poolKey,
      parsedAmountA,
      targetTick,
      tickLower,
      tickUpper,
      zeroForOne,
      liquidity,
      tickCurrent: poolInfo.tick,
      poolInfo,
      stringified: stringify({
        poolKey,
        parsedAmountA,
        targetTick,
        tickLower,
        tickUpper,
        zeroForOne,
        liquidity,
        tickCurrent: poolInfo.tick,
        poolInfo,
      }),
    })

    try {
      setIsPlacingOrder(true)

      // Gas Fees to be paid by user for Limit Order
      const GAS_FEE = await contract.read.GAS_FEE()

      // Total amount in native token
      const value = GAS_FEE + (inputCurrency.isNative ? parsedAmountA : 0n)

      const estimatedGas = await contract.estimateGas.placeOrder([encodedPoolKey, targetTick, zeroForOne, liquidity], {
        account,
        value,
      })

      const receipt = await fetchWithCatchTxError(
        async () => {
          return contract.write.placeOrder([encodedPoolKey, targetTick, zeroForOne, liquidity], {
            account,
            chain: contract.chain,
            value,
            gas: calculateGasMargin(estimatedGas),
          })
        },
        {
          toastSuccess: {
            title: `${t('Order Placed')}!`,
          },
        },
      )

      setIsPlacingOrder(false)

      if (receipt?.status) {
        console.debug('placeOrder: Transaction successful', receipt.transactionHash)
        onSuccess?.(receipt.transactionHash)

        const formattedPrice = BN(customMarketPrice || currentMarketPrice || 0).toPrecision(6)

        addTransaction(
          { hash: receipt.transactionHash },
          {
            type: 'place-limit-order',
            summary: `Sell ${formattedAmounts[Field.CURRENCY_A]} ${inputCurrency.symbol} for ${
              formattedAmounts[Field.CURRENCY_B]
            } ${outputCurrency.symbol} at ${formattedPrice} ${outputCurrency.symbol} per ${inputCurrency.symbol}`,
            translatableSummary: {
              text: 'Sell %inputAmount% %inputSymbol% for %outputAmount% %outputSymbol% at %price% %outputSymbol% per %inputSymbol%',
              data: {
                inputAmount: formattedAmounts[Field.CURRENCY_A],
                inputSymbol: inputCurrency.symbol,
                outputAmount: formattedAmounts[Field.CURRENCY_B],
                outputSymbol: outputCurrency.symbol,
                price: formattedPrice,
              },
            },
          },
        )

        // Wait 2 seconds to refetch
        setTimeout(() => {
          refetchSelectedPool()
          refetchUserLimitOrders()
        }, 2000)
      }
    } catch (error: any) {
      console.error('placeOrder: Unable to place limit order', error)
      toastError(
        t('Unsuccessful'),
        t('Order submission unsuccessful due to price movement. Please try again with an updated limit price!'),
      )
      onError?.(error)
      setIsPlacingOrder(false)
    }
  }, [
    contract,
    account,
    selectedPool,
    ticksData,
    parsedAmounts,
    fetchWithCatchTxError,
    onError,
    onSuccess,
    refetchSelectedPool,
    refetchUserLimitOrders,
  ])

  return {
    placeOrder,
    isPlacingOrder,
  }
}
