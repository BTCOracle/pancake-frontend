import { useQuery } from '@tanstack/react-query'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { chainIdToExplorerInfoChainName } from 'state/info/api/client'
import { useCallback } from 'react'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { SLOW_INTERVAL } from 'config/constants'
import { LIMIT_ORDERS_HOOKS_SUPPORTED_CHAINS } from 'config/constants/supportChains'
import { PCS_LIMIT_ORDER_HISTORY_URL, ORDERS_PER_PAGE, MAX_PENDING_ORDERS } from '../constants'
import { OrderHistoryResponse, PaginationParams, OrderStatus, ResponseOrder } from '../types/orders.types'
import {
  currentCursorAtom,
  pageCursorsAtom,
  paginationDirectionAtom,
  currentPageAtom,
  filterOrderStatusAtom,
  canGoBackAtom,
  resetPaginationAtom,
  toggleOpenFilterAtom,
} from '../state/pagination/paginationAtoms'

async function getUserLimitOrders(
  chainName: string,
  address: string,
  orderStatus?: OrderStatus,
  pagination?: PaginationParams,
  limit?: number,
) {
  const url = new URL(
    `${PCS_LIMIT_ORDER_HISTORY_URL}/${chainName}/${address}${orderStatus ? `/${orderStatus}` : ''}${
      limit ? `?limit=${limit}` : ''
    }`,
  )

  if (pagination?.after) {
    url.searchParams.set('after', pagination.after)
  }

  const response = await fetch(url.toString())
  if (!response.ok) {
    console.error('Failed to fetch user limit orders', response)
    return {
      startCursor: '',
      endCursor: '',
      hasNextPage: false,
      hasPrevPage: false,
      rows: [],
    }
  }
  return (await response.json()) as OrderHistoryResponse
}

export const useUserOpenLimitOrders = () => {
  const { account, chainId } = useAccountActiveChain()
  const chainName = chainIdToExplorerInfoChainName[chainId]

  return useQuery({
    queryKey: ['userOpenLimitOrders', chainId, account],
    queryFn: async () => {
      if (!account || !chainId) return { openOrders: [], totalOrders: [] }

      // Need totalOrders to decide whether to show OrdersSummaryCard in case of no open orders
      let totalOrders: ResponseOrder[] = []

      const openData = await getUserLimitOrders(chainName, account, OrderStatus.Open, undefined, MAX_PENDING_ORDERS)
      const openOrders = openData.rows
      totalOrders = openOrders

      if (totalOrders.length === 0) {
        const totalData = await getUserLimitOrders(chainName, account, undefined, undefined, MAX_PENDING_ORDERS)
        totalOrders = totalData.rows
      }

      return {
        openOrders,
        totalOrders,
      }
    },
    initialData: {
      openOrders: [],
      totalOrders: [],
    },
    enabled: !!account && !!chainId && LIMIT_ORDERS_HOOKS_SUPPORTED_CHAINS.includes(chainId),
    refetchInterval: SLOW_INTERVAL,
    staleTime: 0,
  })
}

export const useUserLimitOrders = () => {
  const { account, chainId } = useAccountActiveChain()
  const chainName = chainIdToExplorerInfoChainName[chainId]

  // Use atoms for shared state
  const filterOrderStatus = useAtomValue(filterOrderStatusAtom)

  const [currentCursor, setCurrentCursor] = useAtom(currentCursorAtom)
  const [pageCursors, setPageCursors] = useAtom(pageCursorsAtom)
  const [paginationDirection, setPaginationDirection] = useAtom(paginationDirectionAtom)
  const [currentPage, setCurrentPage] = useAtom(currentPageAtom)
  const canGoBack = useAtomValue(canGoBackAtom)
  const resetPagination = useSetAtom(resetPaginationAtom)
  const toggleOpenFilter = useSetAtom(toggleOpenFilterAtom)

  const queryResult = useQuery({
    queryKey: ['userLimitOrders', chainId, account, filterOrderStatus, currentCursor, paginationDirection],
    queryFn: async () => {
      if (!account) return { orders: [], paginationInfo: null }

      const paginationParams: PaginationParams = {}
      if (currentCursor) {
        paginationParams.after = currentCursor
      }

      const data = await getUserLimitOrders(chainName, account, filterOrderStatus, paginationParams)
      const { rows } = data

      // Store cursors for the current page for consistent navigation
      setPageCursors((prev) => {
        const newMap = new Map(prev)
        newMap.set(currentPage, {
          startCursor: data.startCursor,
          endCursor: data.endCursor,
        })
        return newMap
      })

      return {
        orders: rows,
        paginationInfo: {
          startCursor: data.startCursor,
          endCursor: data.endCursor,
          hasNextPage: data.hasNextPage,
          hasPrevPage: data.hasPrevPage,
        },
      }
    },
    enabled: !!account && !!chainName && LIMIT_ORDERS_HOOKS_SUPPORTED_CHAINS.includes(chainId),
    refetchInterval: SLOW_INTERVAL,
    staleTime: 100, // 100ms
  })

  // Navigation methods
  const nextPage = useCallback(() => {
    const paginationInfo = queryResult.data?.paginationInfo
    if (paginationInfo?.hasNextPage && paginationInfo.endCursor) {
      // Navigate using the current page's endCursor
      setCurrentCursor(paginationInfo.endCursor)
      setPaginationDirection('forward')
      setCurrentPage((prev) => prev + 1)
    }
  }, [queryResult.data?.paginationInfo, setCurrentCursor, setPaginationDirection, setCurrentPage])

  const previousPage = useCallback(() => {
    if (currentPage > 1) {
      const targetPage = currentPage - 1
      if (targetPage === 1) {
        // Go to first page - no cursor needed
        setCurrentCursor(null)
        setPaginationDirection(null)
        setCurrentPage(1)
      } else {
        // Use the endCursor from the page before the target page
        const previousPageCursor = pageCursors.get(targetPage - 1)
        if (previousPageCursor?.endCursor) {
          setCurrentCursor(previousPageCursor.endCursor)
          setPaginationDirection('backward')
          setCurrentPage(targetPage)
        }
      }
    }
  }, [currentPage, pageCursors, setCurrentCursor, setPaginationDirection, setCurrentPage])

  // Calculate canGoForward based on API response
  const paginationInfo = queryResult.data?.paginationInfo
  const canGoForward = paginationInfo?.hasNextPage ?? false

  const orders = queryResult.data?.orders || []

  return {
    ...queryResult,
    data: orders,
    paginationInfo: queryResult.data?.paginationInfo || null,
    filterOrderStatus,
    nextPage,
    previousPage,
    resetPagination,
    toggleOpenFilter,
    canGoBack,
    canGoForward,
    currentPage,
    ordersPerPage: ORDERS_PER_PAGE,
  }
}
