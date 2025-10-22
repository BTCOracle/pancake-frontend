import { GelatoLimitOrders, Order } from '@gelatonetwork/limit-orders-lib'
import { SLOW_INTERVAL } from 'config/constants'

import useGelatoLimitOrdersLib from 'hooks/limitOrders/useGelatoLimitOrdersLib'
import { getLSOrders, hashOrder, hashOrderSet, saveOrder, saveOrders } from 'utils/localStorageOrders'

import { useQuery } from '@tanstack/react-query'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { usePublicClient } from 'wagmi'
import { gelatoLimitABI } from 'config/abi/gelatoLimit'
import { useMemo } from 'react'
import orderBy from 'lodash/orderBy'
import { ExistingOrder, LimitOrderStatus, ORDER_CATEGORY } from '../types'

export const EXISTING_ORDERS_QUERY_KEY = ['limitOrders', 'gelato', 'existingOrders']
export const OPEN_ORDERS_QUERY_KEY = ['limitOrders', 'gelato', 'openOrders']
export const EXECUTED_CANCELLED_ORDERS_QUERY_KEY = ['limitOrders', 'gelato', 'cancelledExecutedOrders']
export const EXECUTED_EXPIRED_ORDERS_QUERY_KEY = ['limitOrders', 'gelato', 'expiredExecutedOrders']

type DepositLog = {
  key: string
  transactionHash: string
  caller: string
  amount: string
  blockNumber: number
  data: {
    module: string
    inputToken: string
    owner: string
    witness: string
    data: string
    secret: string
  }
}

function newOrdersFirst(a: Order, b: Order) {
  return Number(b.updatedAt) - Number(a.updatedAt)
}

const isOrderUpdated = (oldOrder: Order, newOrder: Order): boolean => {
  return newOrder ? Number(oldOrder.updatedAt) < Number(newOrder.updatedAt) : false
}

async function syncOrderToLocalStorage({
  gelatoLimitOrders,
  chainId,
  account,
  orders,
  syncStatuses,
}: {
  chainId: number
  account: string
  orders: Order[]
  syncStatuses?: LimitOrderStatus[]
  gelatoLimitOrders?: GelatoLimitOrders
}) {
  const allOrdersLS = getLSOrders(chainId, account)

  const lsOrdersHashSet = hashOrderSet(allOrdersLS)
  const newOrders = orders.filter((order: Order) => !lsOrdersHashSet.has(hashOrder(order)))
  saveOrders(chainId, account, newOrders)

  const typeOrdersLS = syncStatuses
    ? allOrdersLS.filter((order) => syncStatuses.some((type) => type === order.status))
    : []

  const results = await Promise.all(
    typeOrdersLS.map((confOrder) => {
      const orderFetched = orders.find((order) => confOrder.id.toLowerCase() === order.id.toLowerCase())
      return !orderFetched
        ? gelatoLimitOrders
          ? Promise.allSettled([Promise.resolve(confOrder), gelatoLimitOrders.getOrder(confOrder.id)])
          : Promise.resolve([confOrder, null])
        : Promise.resolve([confOrder, orderFetched])
    }),
  )

  results.forEach((result) => {
    const [confOrderPromiseResult, graphOrderPromiseResult] = result as PromiseSettledResult<Order>[]
    if (confOrderPromiseResult.status === 'fulfilled' && graphOrderPromiseResult.status === 'fulfilled') {
      if (isOrderUpdated(confOrderPromiseResult.value, graphOrderPromiseResult.value)) {
        saveOrder(chainId, account, graphOrderPromiseResult.value)
      }
    }
    if (graphOrderPromiseResult.status === 'rejected') {
      console.error('Error fetching order from subgraph', graphOrderPromiseResult.reason)
    }
  })
}

const useExistingOrders = (turnOn: boolean): ExistingOrder[] => {
  const { account, chainId } = useAccountActiveChain()

  const gelatoLimitOrders = useGelatoLimitOrdersLib()

  const provider = usePublicClient({ chainId })

  const startFetch = turnOn && gelatoLimitOrders && account && chainId && provider

  const { data } = useQuery({
    queryKey: [...EXISTING_ORDERS_QUERY_KEY, account],

    queryFn: async () => {
      if (!gelatoLimitOrders || !account || !chainId || !provider) {
        throw new Error('Missing gelatoLimitOrders, account or chainId')
      }

      try {
        const response = await fetch(`https://proofs.pancakeswap.com/gelato/v1/${account}.log`)

        if (response.status === 404) {
          return undefined
        }

        const logs: DepositLog[] = await response.json()

        const existRoles = await provider.multicall({
          contracts: logs.map((log) => {
            return {
              abi: gelatoLimitABI,
              address: gelatoLimitOrders.contract.address,
              functionName: 'existOrder',
              args: [log.data.module, log.data.inputToken, log.data.owner, log.data.witness, log.data.data],
            }
          }) as any[],
        })

        return logs
          .filter((_, index) => existRoles[index]?.status === 'success' && existRoles[index]?.result)
          .map((log) => ({
            transactionHash: log.transactionHash,
            module: log.data.module,
            inputToken: log.data.inputToken,
            owner: log.data.owner,
            witness: log.data.witness,
            data: log.data.data,
          }))
      } catch (e) {
        console.error('Error fetching logs or querying existOrder', e)
        return undefined
      }
    },
    enabled: Boolean(startFetch),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  return useMemo(() => data ?? [], [data])
}

const useOpenOrders = (turnOn: boolean): Order[] => {
  const { account, chainId } = useAccountActiveChain()

  const gelatoLimitOrders = useGelatoLimitOrdersLib()

  const startFetch = turnOn && gelatoLimitOrders && account && chainId

  const { data = [] } = useQuery({
    queryKey: OPEN_ORDERS_QUERY_KEY,

    queryFn: async () => {
      if (!gelatoLimitOrders || !account || !chainId) {
        throw new Error('Missing gelatoLimitOrders, account or chainId')
      }
      try {
        const orders = await gelatoLimitOrders.getOpenOrders(account.toLowerCase(), true)

        await syncOrderToLocalStorage({
          orders,
          chainId,
          account,
          syncStatuses: [LimitOrderStatus.OPEN],
          gelatoLimitOrders,
        })
      } catch (e) {
        console.error('Error fetching open orders from subgraph', e)
      }

      const openOrdersLS = getLSOrders(chainId, account).filter(
        (order) => order.status === LimitOrderStatus.OPEN && !order.isExpired,
      )

      const pendingOrdersLS = getLSOrders(chainId, account, true)

      return [
        ...openOrdersLS.filter((order: Order) => {
          const orderCancelled = pendingOrdersLS
            .filter((pendingOrder) => pendingOrder.status === LimitOrderStatus.CANCELLED)
            .find((pendingOrder) => pendingOrder.id.toLowerCase() === order.id.toLowerCase())
          return !orderCancelled
        }),
        ...pendingOrdersLS.filter((order) => order.status === LimitOrderStatus.OPEN),
      ].sort(newOrdersFirst)
    },

    enabled: Boolean(startFetch),
    refetchInterval: SLOW_INTERVAL,
  })

  return startFetch ? data : []
}

const useHistoryOrders = (turnOn: boolean): Order[] => {
  const { account, chainId } = useAccountActiveChain()
  const gelatoLimitOrders = useGelatoLimitOrdersLib()

  const startFetch = turnOn && gelatoLimitOrders && account && chainId

  const { data = [] } = useQuery({
    queryKey: EXECUTED_CANCELLED_ORDERS_QUERY_KEY,

    queryFn: async () => {
      if (!gelatoLimitOrders || !account || !chainId) {
        throw new Error('Missing gelatoLimitOrders, account or chainId')
      }
      try {
        const acc = account.toLowerCase()

        const [canOrders, exeOrders] = await Promise.all([
          gelatoLimitOrders.getCancelledOrders(acc, true),
          gelatoLimitOrders.getExecutedOrders(acc, true),
        ])

        await syncOrderToLocalStorage({
          orders: [...canOrders, ...exeOrders],
          chainId,
          account,
        })
      } catch (e) {
        console.error('Error fetching history orders from subgraph', e)
      }

      const executedOrdersLS = getLSOrders(chainId, account).filter(
        (order) => order.status === LimitOrderStatus.EXECUTED,
      )

      const cancelledOrdersLS = getLSOrders(chainId, account).filter(
        (order) => order.status === LimitOrderStatus.CANCELLED,
      )

      const pendingCancelledOrdersLS = getLSOrders(chainId, account, true).filter(
        (order) => order.status === LimitOrderStatus.CANCELLED,
      )

      return [...pendingCancelledOrdersLS, ...cancelledOrdersLS, ...executedOrdersLS].sort(newOrdersFirst)
    },

    enabled: Boolean(startFetch),
    refetchInterval: SLOW_INTERVAL,
  })

  return startFetch ? data : []
}

const useExpiredOrders = (turnOn: boolean): Order[] => {
  const { account, chainId } = useAccountActiveChain()
  const gelatoLimitOrders = useGelatoLimitOrdersLib()

  const startFetch = turnOn && gelatoLimitOrders && account && chainId

  const { data = [] } = useQuery({
    queryKey: EXECUTED_EXPIRED_ORDERS_QUERY_KEY,

    queryFn: async () => {
      if (!gelatoLimitOrders || !account || !chainId) {
        throw new Error('Missing gelatoLimitOrders, account or chainId')
      }
      try {
        const orders = await gelatoLimitOrders.getOpenOrders(account.toLowerCase(), true)
        await syncOrderToLocalStorage({
          orders,
          chainId,
          account,
        })
      } catch (e) {
        console.error('Error fetching expired orders from subgraph', e)
      }

      const expiredOrdersLS = getLSOrders(chainId, account).filter(
        (order) => order.isExpired && order.status === LimitOrderStatus.OPEN,
      )

      return expiredOrdersLS.sort(newOrdersFirst)
    },

    enabled: Boolean(startFetch),
    refetchInterval: SLOW_INTERVAL,
  })

  return startFetch ? data : []
}

export default function useGelatoLimitOrdersHistory(orderCategory: ORDER_CATEGORY) {
  const historyOrders = useHistoryOrders(orderCategory === ORDER_CATEGORY.History)
  const openOrders = useOpenOrders(orderCategory === ORDER_CATEGORY.Open)
  const expiredOrders = useExpiredOrders(orderCategory === ORDER_CATEGORY.Expired)
  const existingOrders = useExistingOrders(orderCategory === ORDER_CATEGORY.Existing)

  const orders = useMemo(() => {
    switch (orderCategory as ORDER_CATEGORY) {
      case ORDER_CATEGORY.Open:
        return openOrders
      case ORDER_CATEGORY.History:
        return historyOrders
      case ORDER_CATEGORY.Expired:
        return expiredOrders
      case ORDER_CATEGORY.Existing:
        return existingOrders
      default:
        return []
    }
  }, [orderCategory, openOrders, historyOrders, expiredOrders, existingOrders])

  return useMemo(() => {
    if (orderCategory === ORDER_CATEGORY.Existing) {
      return orders
    }
    return Array.isArray(orders)
      ? (orderBy(orders, (order: Order) => parseInt(order.createdAt), 'desc') as Order[])
      : orders
  }, [orders, orderCategory])
}
