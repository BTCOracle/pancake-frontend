import { Protocol } from '@pancakeswap/farms'
import {
  PositionIdRoute,
  zInfinityBinPositionIdObject,
  zInfinityBinPositionIdTuple,
  zInfinityClammPositionIdObject,
  zInfinityClammPositionIdTuple,
  zSolanaV3PositionIdObject,
  zSolanaV3PositionIdTuple,
} from 'dynamicRoute'
import { $path } from 'next-typesafe-url'
import { useRouteParams } from 'next-typesafe-url/pages'
import { useRouter } from 'next/router'
import { useCallback, useMemo } from 'react'
import { z } from 'zod'

type RouteWithPositionId = '/liquidity/position/[[...positionId]]'

export const usePositionIdRoute = () => {
  const { data: routeParams, error: routeError } = useRouteParams(PositionIdRoute.routeParams)

  const protocol = useMemo(() => {
    if (!routeParams || !routeParams.positionId) return null

    return routeParams.positionId[0]
  }, [routeParams])

  const action = useMemo(() => {
    if (!routeParams || !routeParams.positionId) return null

    return routeParams.positionId[2]
  }, [routeParams])

  return {
    routeParams,
    routeError,
    protocol,
    action,
  }
}

export const useInfinityBinPositionIdRouteParams = () => {
  const { routeParams } = usePositionIdRoute()
  const router = useRouter()
  const params = useMemo(() => {
    if (!routeParams || !routeParams.positionId) return null
    if (routeParams.positionId[0] !== Protocol.InfinityBIN) return null
    const [protocol, poolId, action] = routeParams.positionId as z.infer<typeof zInfinityBinPositionIdTuple>

    return { protocol, poolId, action }
  }, [routeParams])

  const updateParams = useCallback(
    (p: Partial<z.infer<typeof zInfinityBinPositionIdObject>>) => {
      if (!params || !Object.values(params).every((v) => v !== undefined)) return

      const path = $path({
        route: router.route as RouteWithPositionId,
        routeParams: {
          positionId: params.action
            ? [p.protocol ?? params.protocol, p.poolId ?? params.poolId, params.action]
            : [p.protocol ?? params.protocol, p.poolId ?? params.poolId],
        },
      })

      router.replace(
        {
          pathname: path,
          query: router.query,
        },
        undefined,
        { shallow: true },
      )
    },
    [params, router],
  )

  return { ...params, updateParams }
}

export const useInfinityClammPositionIdRouteParams = () => {
  const { routeParams } = usePositionIdRoute()
  const router = useRouter()
  const params = useMemo(() => {
    if (!routeParams || !routeParams.positionId) return null
    if (routeParams.positionId[0] !== Protocol.InfinityCLAMM) return null
    const [protocol, tokenId, action] = routeParams.positionId as z.infer<typeof zInfinityClammPositionIdTuple>

    return { protocol, tokenId, action }
  }, [routeParams])

  const updateParams = useCallback(
    (p: Partial<z.infer<typeof zInfinityClammPositionIdObject>>) => {
      if (!params || !Object.values(params).every((v) => v !== undefined)) return

      const path = $path({
        route: router.route as RouteWithPositionId,
        routeParams: {
          positionId: params.action
            ? [p.protocol ?? params.protocol, p.tokenId ?? params.tokenId, params.action]
            : [p.protocol ?? params.protocol, p.tokenId ?? params.tokenId],
        },
      })

      router.replace(
        {
          pathname: path,
          query: router.query,
        },
        undefined,
        { shallow: true },
      )
    },
    [params, router],
  )

  return { ...params, updateParams }
}

export const useSolanaV3PositionIdRouteParams = () => {
  const { routeParams } = usePositionIdRoute()
  const router = useRouter()
  const params = useMemo(() => {
    if (!routeParams || !routeParams.positionId) return null
    if (routeParams.positionId[0] !== Protocol.V3 || routeParams.positionId[1] !== 'solana') return null
    const [protocol, , poolId, mintId] = routeParams.positionId as z.infer<typeof zSolanaV3PositionIdTuple>

    return { protocol, poolId, mintId }
  }, [routeParams])

  const updateParams = useCallback(
    (p: Partial<z.infer<typeof zSolanaV3PositionIdObject>>) => {
      if (!params || !Object.values(params).every((v) => v !== undefined)) return

      const path = $path({
        route: router.route as RouteWithPositionId,
        routeParams: {
          positionId: [p.protocol ?? params.protocol, 'solana', p.poolId ?? params.poolId, p.mintId ?? params.mintId],
        },
      })

      router.replace(
        {
          pathname: path,
          query: router.query,
        },
        undefined,
        { shallow: true },
      )
    },
    [params, router],
  )

  return { ...params, updateParams }
}
