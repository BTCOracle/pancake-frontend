import { getPoolTypeKey } from '@pancakeswap/price-api-sdk'
import { PoolType } from '@pancakeswap/smart-router'
import { Currency } from '@pancakeswap/swap-sdk-core'
import { useQuery } from '@tanstack/react-query'
import { POOLS_FAST_REVALIDATE } from 'config/pools'
import qs from 'qs'
import { zeroAddress } from 'viem'

type PrefetchParams = {
  currencyA?: Currency | null
  currencyB?: Currency | null
  poolTypes?: PoolType[]
  enabled?: boolean
}

export function useTradeApiPrefetch(
  { currencyA, currencyB, poolTypes, enabled }: PrefetchParams,
  prefix: string,
  queryType: string,
) {
  return useQuery({
    enabled: !!(currencyA && currencyB && poolTypes?.length && enabled),
    queryKey: [`${queryType}-prefetch`, currencyA?.chainId, currencyA?.symbol, currencyB?.symbol, poolTypes] as const,
    queryFn: async ({ signal }) => {
      if (!currencyA || !currencyB || !poolTypes?.length) {
        throw new Error('Invalid prefetch params')
      }

      const serverRes = await fetch(
        `${prefix}/_pools/${currencyA.chainId}/${getCurrencyIdentifierForApi(currencyA)}/${getCurrencyIdentifierForApi(
          currencyB,
        )}?${qs.stringify({ protocols: poolTypes.map(getPoolTypeKey) })}`,
        {
          method: 'GET',
          signal,
        },
      )
      const res = await serverRes.json()
      if (!res.success) {
        throw new Error(res.message)
      }
      return res
    },
    staleTime: currencyA?.chainId ? POOLS_FAST_REVALIDATE[currencyA.chainId] : 0,
    refetchInterval: currencyA?.chainId ? POOLS_FAST_REVALIDATE[currencyA.chainId] : 0,
  })
}

function getCurrencyIdentifierForApi(currency: Currency) {
  return currency.isNative ? zeroAddress : currency.address
}
