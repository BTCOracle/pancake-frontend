import { MayFunction, TokenInfo } from '@pancakeswap/solana-core-sdk'

import { ParsedUrlQuery } from 'querystring'
import { PoolPageQuery } from '@/features/Pools/Pools'
import { PortfolioPageQuery } from '@/features/Portfolio'
import { StakingPageQuery } from '@/features/Staking/type'
import { DecreaseLiquidityPageQuery, IncreaseLiquidityPageQuery } from '@/features/Liquidity/Decrease/components/type'

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
  'legacy-swap': {
    queryProps?: MayFunction<SwapPageQuery, [{ currentPageQuery: ParsedUrlQuery }]>
  }
  'edit-farm': {
    queryProps?: MayFunction<EditFarmPageQuery, [{ currentPageQuery: ParsedUrlQuery }]>
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
export const pageRoutePathnames: Record<keyof PageRouteConfigs, string> = {
  '(home)': '/',
  swap: '/swap',
  'legacy-swap': '/__swap_',
  'edit-farm': '/farms/edit',
  portfolio: '/positions',
  staking: '/staking',
  pools: '/liquidity-pools',
  'increase-liquidity': '/liquidity/increase',
  'decrease-liquidity': '/liquidity/decrease',
  'create-farm': '/liquidity/create-farm',
  'clmm-lock': '/clmm/lock'
}
