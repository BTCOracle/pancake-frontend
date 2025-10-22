import { useQuery } from '@tanstack/react-query'
import { fetchCLPoolInfo } from 'state/farmsV4/state/accountPositions/fetcher/infinity/getPoolInfo'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { useCallback, useMemo, useState } from 'react'
import { useCurrency } from 'hooks/Tokens'
import { tickToPrice } from 'hooks/infinity/utils'
import { formatPrice } from 'utils/formatCurrencyAmount'
import { useCLLimitOrderHookContract } from 'hooks/useContract'
import { formatUnits } from '@pancakeswap/utils/viem/formatUnits'
import useCatchTxError from 'hooks/useCatchTxError'
import { useToast } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { SqrtPriceMath, TickMath } from '@pancakeswap/v3-sdk'
import { FAST_INTERVAL } from 'config/constants'
import { BigNumber as BN } from 'bignumber.js'
import { OrderStatus, ResponseOrder } from '../types/orders.types'
import { simulateLimitOrderContract } from '../utils/orders'
import { useUserLimitOrders } from './useUserLimitOrders'
import { bigNumberToPrice } from '../utils/price'

export const useOrder = (order: ResponseOrder) => {
  const { t } = useTranslation()
  const { account, chainId } = useAccountActiveChain()

  const { refetch: refetchUserLimitOrders } = useUserLimitOrders()
  const contract = useCLLimitOrderHookContract()

  const { fetchWithCatchTxError } = useCatchTxError()
  const { toastError } = useToast()

  const [isInverted, setIsInverted] = useState(false)

  // Provide live status to Table Row after Cancel/Withdraw txn
  const [liveStatus, setLiveStatus] = useState(order.status)

  // Pool
  const { data: pool } = useQuery({
    queryKey: ['order-pool', order.pool_id],
    queryFn: async () => fetchCLPoolInfo(order.pool_id, chainId),
    refetchInterval: 5000,
  })

  // Currencies
  const currency0 = useCurrency(pool?.currency0, chainId)
  const currency1 = useCurrency(pool?.currency1, chainId)

  const currencyA = useMemo(
    () => (order.zero_for_one ? currency0 : currency1),
    [order.zero_for_one, currency0, currency1],
  )
  const currencyB = useMemo(
    () => (order.zero_for_one ? currency1 : currency0),
    [order.zero_for_one, currency1, currency0],
  )

  // Limit Price
  const limitPrice = useMemo(() => {
    if (!pool || !currencyA || !currencyB) return undefined
    const price = tickToPrice(currencyA, currencyB, order.tick_lower)
    const priceUpper = tickToPrice(currencyA, currencyB, order.tick_lower + pool.parameters.tickSpacing)

    const sqrtPrice = isInverted
      ? BN(price.invert().toFixed(18))
          .multipliedBy(BN(priceUpper.invert().toFixed(18)))
          .sqrt()
      : BN(price.toFixed(18))
          .multipliedBy(BN(priceUpper.toFixed(18)))
          .sqrt()

    const parsedSqrtPrice = bigNumberToPrice(sqrtPrice, currencyA, currencyB)
    return formatPrice(parsedSqrtPrice, 6, 'en-US')
  }, [pool, currencyA, currencyB, order.tick_lower, isInverted, order.zero_for_one, currencyA, currencyB])

  const [originalAmountA, originalAmountB] = useMemo(() => {
    if (!currencyA || !currencyB || !order.original_amount_0 || !order.original_amount_1 || !limitPrice || !pool)
      return [undefined, undefined]

    const originalAmount0 = formatUnits(BigInt(order.original_amount_0), currencyA?.decimals)
    const originalAmount1 = formatUnits(BigInt(order.original_amount_1), currencyB?.decimals)

    const sellAmount = order.zero_for_one ? originalAmount0 : originalAmount1

    // Get limit price
    const price = tickToPrice(currencyA, currencyB, order.tick_lower)
    const priceUpper = tickToPrice(currencyA, currencyB, order.tick_lower + pool.parameters.tickSpacing)
    const sqrtLimitPrice = BN(price.toFixed(18))
      .multipliedBy(BN(priceUpper.toFixed(18)))
      .sqrt()

    const buyAmount = BN(sellAmount).multipliedBy(sqrtLimitPrice).toFormat(18)

    return [sellAmount, buyAmount]
  }, [currencyA, currencyB, order.original_amount_0, order.original_amount_1, pool, order.tick_lower])

  // Amounts Received
  const { data: [amount0Received, amount1Received] = [0n, 0n], refetch: refetchAmountsReceived } = useQuery({
    queryKey: ['order-amounts-received', account, chainId, order.order_id, order.pool_id],
    queryFn: async () => {
      if (!account) return undefined

      // Use amounts returned from API
      if (order.status === OrderStatus.Withdrawn) {
        return [BigInt(order.amount0), BigInt(order.amount1)]
      }

      if (order.status === OrderStatus.Open || order.status === OrderStatus.PartiallyFilled) {
        const response = await simulateLimitOrderContract(
          contract,
          'cancelOrder',
          [BigInt(order.order_id), account],
          account,
        )
        return response.result as unknown as [bigint, bigint]
      }

      if (order.status === OrderStatus.Filled) {
        const response = await simulateLimitOrderContract(
          contract,
          'withdraw',
          [BigInt(order.order_id), account],
          account,
        )
        return response.result as unknown as [bigint, bigint]
      }

      return [0n, 0n]
    },
    initialData: [0n, 0n],
  })

  const amountAReceived = useMemo(() => {
    if (!currencyA?.decimals || !currencyB?.decimals) return undefined
    if (order.zero_for_one) return formatUnits(amount0Received, currencyA?.decimals)
    return formatUnits(amount1Received, currencyB?.decimals)
  }, [order.zero_for_one, amount0Received, amount1Received, currencyA?.decimals, currencyB?.decimals])

  const amountBReceived = useMemo(() => {
    if (!currencyB?.decimals || !currencyA?.decimals) return undefined
    if (order.zero_for_one) return formatUnits(amount1Received, currencyB?.decimals)
    return formatUnits(amount0Received, currencyA?.decimals)
  }, [order.zero_for_one, amount1Received, amount0Received, currencyB?.decimals, currencyA?.decimals])

  // Check for partial fill case
  const isPartialFill = useMemo(() => {
    if (
      order.status === OrderStatus.Filled ||
      order.status === OrderStatus.Withdrawn ||
      order.status === OrderStatus.Cancelled ||
      !pool
    )
      return false

    const sqrtPriceX96Lower = TickMath.getSqrtRatioAtTick(order.tick_lower)
    const sqrtPriceX96Upper = TickMath.getSqrtRatioAtTick(order.tick_lower + pool.parameters.tickSpacing)
    const sqrtPriceX96Current = TickMath.getSqrtRatioAtTick(pool.tick)

    if (sqrtPriceX96Current > sqrtPriceX96Lower && sqrtPriceX96Current < sqrtPriceX96Upper) {
      return true
    }

    // If zeroForOne is false, then sqrtPriceX96Current === sqrtPriceX96Lower is partial fill (Special case)
    if (order.zero_for_one === false && sqrtPriceX96Current === sqrtPriceX96Lower) {
      return true
    }

    return false
  }, [order, pool])

  const filledPercentage = useMemo(() => {
    if (isPartialFill && originalAmountB && amountBReceived) {
      const expectedOutput = BN(originalAmountB)
      const filledOutput = BN(amountBReceived)
      const percentage = filledOutput.dividedBy(expectedOutput).multipliedBy(100)
      const result = percentage.lt(1) ? '< 1' : percentage.toFixed(0)
      // Special case: usually 100% in partial fill means close to 100% but not exact, so show 99.99% instead
      if (result === '100') return '99.99'
      return result
    }

    return liveStatus === OrderStatus.Filled || liveStatus === OrderStatus.Withdrawn ? '100' : '0'
  }, [isPartialFill, liveStatus, originalAmountB, amountBReceived, order.order_id])

  // Actions
  const handleCancelOrder = useCallback(async () => {
    if (!account) return

    try {
      const receipt = await fetchWithCatchTxError(async () => {
        return contract.write.cancelOrder([BigInt(order.order_id), account], {
          account,
          chain: contract.chain,
        })
      })

      if (receipt?.status) {
        if (receipt.status === 'success') {
          console.debug(
            `%c [Order ${order.order_id}][Cancel Order Transaction successful]`,
            'background:lightgreen;color: white',
            receipt.transactionHash,
          )

          setLiveStatus(OrderStatus.Cancelled)
          refetchUserLimitOrders()
          refetchAmountsReceived()
        }
      }
    } catch (error: any) {
      toastError(t('Failed'), error.message || error.details || error)
    }
  }, [contract, account, order.order_id, fetchWithCatchTxError, refetchUserLimitOrders])

  const handleWithdrawOrder = useCallback(async () => {
    if (!account) return

    try {
      const receipt = await fetchWithCatchTxError(async () => {
        return contract.write.withdraw([BigInt(order.order_id), account], {
          account,
          chain: contract.chain,
        })
      })
      if (receipt?.status) {
        if (receipt.status === 'success') {
          console.debug(
            `%c [Order ${order.order_id}][Withdraw Order Transaction successful]`,
            'background:lightgreen;color: white',
            receipt.transactionHash,
          )

          setLiveStatus(OrderStatus.Withdrawn)
          refetchUserLimitOrders()
          refetchAmountsReceived()
        }
      }
    } catch (error: any) {
      toastError(t('Failed'), error.message || error.details || error)
    }
  }, [contract, account, order.order_id, fetchWithCatchTxError, refetchUserLimitOrders])

  return {
    pool,
    liveStatus: isPartialFill
      ? OrderStatus.PartiallyFilled
      : // Ignore PartiallyFilled status from BE
      liveStatus === OrderStatus.PartiallyFilled
      ? OrderStatus.Open
      : liveStatus,
    currencyA,
    currencyB,
    limitPrice,
    isInverted,
    originalAmountA,
    originalAmountB,
    amountAReceived,
    amountBReceived,
    filledPercentage,
    setIsInverted,
    handleCancelOrder,
    handleWithdrawOrder,
  }
}
