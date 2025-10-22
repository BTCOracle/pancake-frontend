import { PoolIdRoute, zInfinityPoolIdObject, zInfinityPoolIdTuple } from 'dynamicRoute'
import { usePoolById } from 'hooks/infinity/usePool'
import { $path } from 'next-typesafe-url'
import { useRouteParams } from 'next-typesafe-url/pages'
import { useRouter } from 'next/router'
import { useCallback, useMemo } from 'react'
import { z } from 'zod'

type RouteWithPoolId = '/liquidity/add/[[...poolId]]'

export const usePoolIdRoute = () => {
  const { data: routeParams, error: routeError } = useRouteParams(PoolIdRoute.routeParams)

  return {
    routeParams,
    routeError,
  }
}

export const useInfinityPoolIdRouteParams = () => {
  const { routeParams } = usePoolIdRoute()
  const router = useRouter()
  const params = useMemo(() => {
    if (!routeParams || !routeParams.poolId) return null
    if (routeParams.poolId[1] !== 'infinity') return null
    const [chainId, protocol, poolId] = routeParams.poolId as z.infer<typeof zInfinityPoolIdTuple>

    return { chainId, poolId, protocol }
  }, [routeParams])

  const [, pool] = usePoolById(params?.poolId, params?.chainId)

  const updateParams = useCallback(
    (p: Partial<z.infer<typeof zInfinityPoolIdObject>>) => {
      if (!params || !Object.values(params).every((v) => v !== undefined)) return

      const path = $path({
        route: router.route as RouteWithPoolId,
        routeParams: {
          poolId: [p.chainId ?? params.chainId, p.protocol ?? params.protocol, p.poolId ?? params.poolId],
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

  return {
    ...params,
    pool,
    currency0: pool?.token0,
    currency1: pool?.token1,
    updateParams,
  }
}
