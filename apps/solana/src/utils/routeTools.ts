/**
 * for v2's experience, we need to use a function to generate the route path, so we can do some tricks when routing
 */
import { MayFunction, TokenInfo } from '@pancakeswap/solana-core-sdk'
import router, { useRouter } from 'next/router'

import { ParsedUrlQuery } from 'querystring'
import { PoolPageQuery } from '@/features/Pools/Pools'
import { PortfolioPageQuery } from '@/features/Portfolio'
import { isClient } from '@/utils/common'
import { StakingPageQuery } from '@/features/Staking/type'
import { DecreaseLiquidityPageQuery, IncreaseLiquidityPageQuery } from '@/features/Liquidity/Decrease/components/type'
import { shrinkToValue } from './shrinkToValue'
import { shakeObjectUndefinedItems } from './objectTools'

type EditFarmPageQuery = {
  farmId?: string
  clmmId?: string
}

type SwapPageQuery = {
  coin1?: TokenInfo
  coin2?: TokenInfo
  ammId?: string
}

export type PageRouteConfigs = {
  '(home)': {
    // eslint-disable-next-line @typescript-eslint/ban-types
    queryProps?: MayFunction<{}, []>
  }
  swap: {
    queryProps?: MayFunction<SwapPageQuery, [{ currentPageQuery: ParsedUrlQuery }]>
  }
  'edit-farm': {
    queryProps?: MayFunction<EditFarmPageQuery, [{ currentPageQuery: ParsedUrlQuery }]>
  }
  positions: {
    // eslint-disable-next-line @typescript-eslint/ban-types
    queryProps?: MayFunction<{}, []>
  }
  portfolio: {
    queryProps?: MayFunction<PortfolioPageQuery, [{ currentPageQuery: ParsedUrlQuery }]>
  }
  staking: {
    queryProps?: MayFunction<StakingPageQuery, [{ currentPageQuery: ParsedUrlQuery }]>
  }
  pools: {
    queryProps?: MayFunction<PoolPageQuery, [{ currentPageQuery: ParsedUrlQuery }]>
  }
  'increase-liquidity': {
    queryProps?: MayFunction<IncreaseLiquidityPageQuery, [{ currentPageQuery: ParsedUrlQuery }]>
  }
  'decrease-liquidity': {
    queryProps?: MayFunction<DecreaseLiquidityPageQuery, [{ currentPageQuery: ParsedUrlQuery }]>
  }
  'create-farm': {
    queryProps?: MayFunction<Record<string, never>, [{ currentPageQuery: ParsedUrlQuery }]>
  }
  'clmm-lock': {
    queryProps?: MayFunction<PoolPageQuery, [{ currentPageQuery: ParsedUrlQuery }]>
  }
}

const pageRoutePathnames: Record<keyof PageRouteConfigs, string> = {
  '(home)': '/',
  swap: '/swap',
  'edit-farm': '/farms/edit',
  portfolio: '/portfolio',
  staking: '/staking',
  pools: '/liquidity-pools',
  'increase-liquidity': '/liquidity/increase',
  'decrease-liquidity': '/liquidity/decrease',
  'create-farm': '/liquidity/create-farm',
  'clmm-lock': '/clmm/lock',
  positions: '/positions'
}

export type PageRouteName = keyof PageRouteConfigs

/**
 * main method of navigating
 * @param page the target page label in {@link PageRouteConfigs}
 * @param opts route configs
 * @returns
 */
export function routeToPage<ToPage extends keyof PageRouteConfigs>(page: ToPage, opts?: PageRouteConfigs[ToPage]) {
  if (!pageRoutePathnames[page]) {
    throw new Error(`page ${page} is not defined in routeToPage`)
  }
  return router.push({
    pathname: pageRoutePathnames[page],
    query: shrinkToValue(opts?.queryProps, [{ currentPageQuery: router.query }]) as any
  })
}

export function setUrlQuery<T extends ParsedUrlQuery>(additionalQuery: Partial<T>) {
  router.replace({ query: shakeObjectUndefinedItems({ ...router.query, ...additionalQuery }) }, undefined, { shallow: true })
}

export const routeBack = () => {
  if (window.history?.length && window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

export function useRouteQuery<Query extends Record<string, any>>(): Query {
  const router = useRouter()
  const query = router.query as Query
  if (!Object.keys(query).length && isClient()) {
    const searchParams = new URLSearchParams(window.location.search)
    return Array.from(searchParams.entries()).reduce(
      (acc, cur) => ({
        ...acc,
        [cur[0]]: cur[1]
      }),
      {}
    ) as Query
  }
  return query
}

export function useRoutePageName(): keyof PageRouteConfigs | undefined {
  const router = useRouter()
  const { pathname } = router
  const [pageName] = Object.entries(pageRoutePathnames).find(([, path]) => path === pathname) ?? []
  return pageName as keyof PageRouteConfigs | undefined
}
