import { ChainId } from '@pancakeswap/chains'
import { CurrencyAmount } from '@pancakeswap/swap-sdk-core'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { FAST_INTERVAL } from 'config/constants'
import { useTokenByChainId, useTokensByChainId } from 'hooks/Tokens'
import { useCallback, useMemo } from 'react'
import { zeroAddress } from 'viem'
import { useAccount } from 'wagmi'
import { NEXT_PUBLIC_GIFT_API, QUERY_KEY_GIFT_INFO } from '../constants'
import { useUnclaimedOnlyContext } from '../providers/UnclaimedOnlyProvider'
import { GiftInfoResponse, GiftListApiQueryParams, GiftStatus } from '../types'
import { giftApiAdapter } from '../utils/ApiAdapter'
import useGiftInfoSelector from './useGiftInfoSelector'

enum GiftApiStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
}

const DEFAULT_PAGE_SIZE = 20

// API Response Types based on the API specification
interface GiftApiResponse<T> {
  status: GiftApiStatus
  message?: string // if status is failed
  hasNext?: boolean
  data?: T
}

export const fetchGiftList = async ({
  chainId,
  account,
  cursor,
}: {
  chainId?: number
  account?: string
  cursor?: string
}): Promise<{ list: GiftInfoResponse[]; hasNext: boolean; nextCursor?: string }> => {
  if (!chainId || !account) {
    throw new Error('Missing required parameters: chainId and account')
  }

  const queryParams: GiftListApiQueryParams = {
    chainId,
    pageSize: DEFAULT_PAGE_SIZE,
    ...(cursor && { cursor }),
    address: account,
    claimerAddress: account,
    operand: 'OR',
  }

  const result = await giftApiAdapter.get<GiftApiResponse<GiftInfoResponse[]>, GiftListApiQueryParams>(
    '/gift/list',
    queryParams,
  )

  if (result.status === GiftApiStatus.FAILED) {
    throw new Error(result.message || 'Failed to fetch gift information')
  }

  const list = result.data || []

  // Sort by timestamp to get the latest item for next cursor
  const sortedList = list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  // Get next cursor from the oldest item in this page (for timestamp-based cursor pagination)
  const nextCursor = sortedList.length > 0 ? sortedList[sortedList.length - 1].timestamp : undefined

  return {
    list: sortedList,
    hasNext: Boolean(result.hasNext),
    nextCursor,
  }
}

export const useGetGiftInfo = () => {
  const { address: account } = useAccount()
  const chainId = ChainId.BSC
  const { unclaimedOnly } = useUnclaimedOnlyContext()

  const selectGiftInfo = useGiftInfoSelector()

  // Fetch receive list with pagination
  const {
    data: combinedData,
    isLoading,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: [QUERY_KEY_GIFT_INFO, chainId, account],
    queryFn: ({ pageParam }) =>
      fetchGiftList({
        chainId,
        account: account!,
        cursor: pageParam,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      if (lastPage.hasNext && lastPage.nextCursor) {
        return lastPage.nextCursor
      }
      return undefined
    },
    select: (data) => {
      return data.pages
        .flatMap((page) => page.list)
        .map(selectGiftInfo)
        .filter((gift) => gift !== null)
        .filter((gift) => {
          if (unclaimedOnly) {
            return gift.status === GiftStatus.PENDING || gift.status === GiftStatus.UNCLAIMABLE
          }
          return true
        })
    },
    enabled: Boolean(chainId && account),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true,
    refetchInterval: FAST_INTERVAL,
  })

  const missingTokens = useMemo(
    () => combinedData?.filter((gift) => gift?.currencyAmount === undefined) || [],
    [combinedData],
  )

  const tokens = useTokensByChainId(
    missingTokens.map((gift) => gift?.token),
    chainId,
  )

  const data = useMemo(() => {
    return combinedData?.map((gift) => {
      if (gift?.currencyAmount === undefined) {
        const isNative = gift.token === zeroAddress

        if (isNative) {
          return gift
        }

        const token = tokens[gift.token]
        if (!token) {
          return gift
        }

        return {
          ...gift,
          currencyAmount: CurrencyAmount.fromRawAmount(token, gift.tokenAmount),
        }
      }
      return gift
    })
  }, [combinedData, tokens])

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  return useMemo(() => {
    return {
      data,
      hasNextPage,
      isLoading,
      isFetchingNextPage,
      handleLoadMore,
      isRefetching,
    }
  }, [data, hasNextPage, isLoading, isFetchingNextPage, handleLoadMore, isRefetching])
}

export const useGetGiftByCodeHash = ({ codeHash }: { codeHash?: string }) => {
  // NOTE: hardcode to bsc for now
  const chainId = ChainId.BSC

  const selectGiftInfo = useGiftInfoSelector()

  const { data, isLoading, isError } = useQuery({
    queryKey: [QUERY_KEY_GIFT_INFO, chainId, codeHash],
    queryFn: async (): Promise<GiftInfoResponse | undefined> => {
      if (!chainId) {
        throw new Error('Missing required parameters: chainId')
      }

      if (!NEXT_PUBLIC_GIFT_API) {
        throw new Error('NEXT_PUBLIC_GIFT_API environment variable is not configured')
      }

      const url = `${NEXT_PUBLIC_GIFT_API}/gift?codeHash=${codeHash}&chainId=${chainId}`

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Failed to fetch gift info: ${response.status} ${response.statusText}`)
      }

      const result: GiftApiResponse<GiftInfoResponse> = await response.json()

      if (result.status === GiftApiStatus.FAILED) {
        throw new Error(result.message || 'Failed to fetch gift information')
      }

      return result.data
    },
    select: (data) => {
      return selectGiftInfo(data)
    },
    enabled: Boolean(chainId && codeHash),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true,
  })

  const searchToken = useTokenByChainId(data?.currencyAmount !== null ? data?.token : undefined, chainId)

  if (data && searchToken) {
    data.currencyAmount = CurrencyAmount.fromRawAmount(searchToken, data?.tokenAmount)
  }

  return useMemo(() => {
    return {
      data,
      isLoading,
      isError,
    }
  }, [data, isLoading, isError])
}
