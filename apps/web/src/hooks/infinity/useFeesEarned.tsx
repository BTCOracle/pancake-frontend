import {
  FARMING_OFFCHAIN_CL_HELPER_ABI,
  INFI_CL_LP_FEES_HELPER_ADDRESSES,
  INFI_CL_POSITION_MANAGER_ADDRESSES,
} from '@pancakeswap/infinity-sdk'
import { Currency, CurrencyAmount } from '@pancakeswap/swap-sdk-core'
import { useQuery } from '@tanstack/react-query'
import { useStablecoinPrice } from 'hooks/useStablecoinPrice'
import isUndefined from 'lodash/isUndefined'
import { useMemo } from 'react'
import { getViemClients } from 'utils/viem'
import { type Address, toHex } from 'viem'
import { usePoolKeyByPoolId } from './usePoolKeyByPoolId'

export type LPFeesParam = {
  currency0?: Currency
  currency1?: Currency
  tokenId?: bigint
  poolId?: Address
  tickLower?: number
  tickUpper?: number
  enabled?: boolean
}

const fetchFeesEarned = ({
  chainId,
  poolManager,
  poolId,
  owner,
  tickLower,
  tickUpper,
  tokenId,
}: {
  chainId: number
  poolManager: Address
  poolId: Address
  owner: Address
  tickLower: number
  tickUpper: number
  tokenId: bigint
}) => {
  return getViemClients({ chainId }).readContract({
    abi: FARMING_OFFCHAIN_CL_HELPER_ABI,
    address: INFI_CL_LP_FEES_HELPER_ADDRESSES[chainId],
    functionName: 'getLPFees',
    args: [poolManager, poolId, owner, tickLower, tickUpper, toHex(tokenId, { size: 32 })],
  })
}

export const useFeesEarned = (params: LPFeesParam) => {
  const { poolId, tokenId, tickLower, tickUpper, currency0, currency1, enabled: _enabled } = params
  const chainId = currency0?.chainId
  const { data: poolKey } = usePoolKeyByPoolId(poolId, chainId)
  const { poolManager } = poolKey ?? {}
  const enabled =
    (_enabled === undefined || _enabled === true) &&
    !!(poolManager && poolId && chainId && tokenId && !isUndefined(tickUpper) && !isUndefined(tickLower))

  const { data } = useQuery({
    queryKey: ['useFeesEarned', poolId, chainId, Number(tokenId), tickLower, tickUpper],
    queryFn: () => {
      if (!enabled) {
        return [0n, 0n] as const
      }
      return fetchFeesEarned({
        chainId,
        poolManager,
        poolId,
        // The owner should be the PositionManager. Other positions that are not added by the PositionManager should not be displayed on our front end,
        // so there is no need to consider them.
        owner: INFI_CL_POSITION_MANAGER_ADDRESSES[chainId],
        tickLower,
        tickUpper,
        tokenId,
      })
    },
    enabled,
    retry: false,
  })
  return useMemo(
    () =>
      currency0 && currency1 && data
        ? [CurrencyAmount.fromRawAmount(currency0, data[0]), CurrencyAmount.fromRawAmount(currency1, data[1])]
        : [undefined, undefined],
    [currency0, currency1, data],
  )
}

export const useFeesEarnedUSD = (params: LPFeesParam) => {
  const { currency0, currency1 } = params
  const [feeAmount0, feeAmount1] = useFeesEarned(params)

  const price0 = useStablecoinPrice(currency0, { enabled: Boolean(feeAmount0?.greaterThan(0)) })
  const price1 = useStablecoinPrice(currency1, { enabled: Boolean(feeAmount1?.greaterThan(0)) })

  const calculateFiatValue = (
    price: any,
    feeAmount: CurrencyAmount<Currency> | undefined,
    currencyLabel: string,
  ): CurrencyAmount<Currency> | undefined => {
    try {
      if (price && feeAmount) {
        if (price.baseCurrency.equals(feeAmount.currency)) {
          return price.quote(feeAmount)
        }

        if (price.baseCurrency.wrapped.address === feeAmount.currency.wrapped.address) {
          // Create a new CurrencyAmount with the correct currency from price
          const adjustedAmount = CurrencyAmount.fromRawAmount(price.baseCurrency, feeAmount.quotient)
          return price.quote(adjustedAmount)
        }
      }
    } catch (error) {
      console.warn(`Error calculating fiat value for ${currencyLabel}:`, error)
    }
    return undefined
  }

  const { totalFiatValue, fiatValue0, fiatValue1 } = useMemo(() => {
    const fiatValue0_ = calculateFiatValue(price0, feeAmount0, 'currency0')
    const fiatValue1_ = calculateFiatValue(price1, feeAmount1, 'currency1')

    return {
      fiatValue0: fiatValue0_,
      fiatValue1: fiatValue1_,
      totalFiatValue: fiatValue0_ && fiatValue1_ ? fiatValue0_.add(fiatValue1_) : undefined,
    }
  }, [price0, price1, feeAmount0, feeAmount1])

  return useMemo(
    () => ({
      feeAmount0,
      feeAmount1,
      fiatValue0,
      fiatValue1,
      totalFiatValue,
    }),
    [feeAmount0, feeAmount1, fiatValue0, fiatValue1, totalFiatValue],
  )
}
