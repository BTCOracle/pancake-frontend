import { PoolKey } from '@pancakeswap/infinity-sdk'
import { Address, Hex, Prettify } from 'viem'

export const CREATE_LIQUIDITY_FEE_TIERS = ['static', 'dynamic'] as const
export type CreateLiquidityFeeTier = (typeof CREATE_LIQUIDITY_FEE_TIERS)[number]

export const LIQUIDITY_SHAPES = ['Spot', 'Curve', 'BidAsk'] as const
export type LiquidityShape = (typeof LIQUIDITY_SHAPES)[number]

export type LiquidityParam = {
  tokenId: bigint
  amount0Min: bigint
  amount1Min: bigint
  deadline: bigint
}

export type RemoveLiquidityParam = Prettify<
  LiquidityParam & {
    liquidity: bigint
  }
>

export type CreateCLPoolParam = Prettify<
  PoolKey & {
    sqrtPriceX96: bigint
    hookData?: Hex
  }
>

export type CreateCLPoolOptions = {
  isCreatePool?: boolean
  positionManagerContractAddress?: Address
}
