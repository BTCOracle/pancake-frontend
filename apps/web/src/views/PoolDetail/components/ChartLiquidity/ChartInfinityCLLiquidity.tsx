import { POOL_TYPE, Pool, PoolKey } from '@pancakeswap/infinity-sdk'
import { CurrencyAmount, Token } from '@pancakeswap/swap-sdk-core'
import { TickMath } from '@pancakeswap/v3-sdk'
import { usePoolKeyByPoolId } from 'hooks/infinity/usePoolKeyByPoolId'
import { useEffect, useState } from 'react'
import { InfinityCLPoolInfo } from 'state/farmsV4/state/type'
import { maxUint128 } from 'viem'
import { PoolTickData, TickProcessed } from 'views/V3Info/data/pool/tickData'
import { useInfinityCLPoolTickData } from 'views/V3Info/hooks'
import { BasicChartLiquidity } from './BasicChartLiquidity'
import { InfinityCLChartLiquidityProps, LiquidityChartData } from './type'

const formatDataFn = async ({
  poolTickData,
  poolInfo,
  tickSpacing,
}: {
  poolTickData?: PoolTickData
  poolInfo?: InfinityCLPoolInfo | null
  tickSpacing?: number
}) => {
  if (poolTickData && poolInfo && tickSpacing) {
    const formattedTicksData = await Promise.all(
      poolTickData.ticksProcessed.map(async (t: TickProcessed, i) => {
        const active = t.tickIdx === poolTickData.activeTickIdx
        const sqrtPriceX96 = TickMath.getSqrtRatioAtTick(t.tickIdx)

        // Native tokens allowed, but typecast to Token
        const token0 = poolInfo.token0 as Token
        const token1 = poolInfo.token1 as Token

        const mockTicks = [
          {
            index: t.tickIdx - tickSpacing,
            liquidityGross: t.liquidityGross,
            liquidityNet: t.liquidityNet * BigInt('-1'),
          },
          {
            index: t.tickIdx,
            liquidityGross: t.liquidityGross,
            liquidityNet: t.liquidityNet,
          },
        ]
        const pool =
          token0 && token1 && poolInfo.feeTier
            ? new Pool({
                tokenA: token0,
                tokenB: token1,
                sqrtRatioX96: sqrtPriceX96,
                tickSpacing,
                tickCurrent: t.tickIdx,
                ticks: mockTicks,
                fee: poolInfo.feeTier,
                poolType: POOL_TYPE.CLAMM,
                protocolFee: 0,
                liquidity: t.liquidityActive,
              })
            : undefined

        const nextSqrtX96 = poolTickData.ticksProcessed[i - 1]
          ? TickMath.getSqrtRatioAtTick(poolTickData.ticksProcessed[i - 1].tickIdx)
          : undefined

        const maxAmountToken0 = token0 ? CurrencyAmount.fromRawAmount(token0, maxUint128) : undefined

        // Add validation for the price limit to prevent RATIO_CURRENT invariant failure
        // For token0 -> token1 swap (zeroForOne = true), sqrtPriceLimitX96 must be < pool current price
        let outputRes0: Awaited<ReturnType<Pool['getOutputAmount']>> | undefined
        try {
          if (pool && maxAmountToken0 && nextSqrtX96) {
            // Validate that nextSqrtX96 is less than current price for token0 -> token1 swap
            if (nextSqrtX96 < sqrtPriceX96) {
              outputRes0 = await pool.getOutputAmount(maxAmountToken0, nextSqrtX96)
            } else {
              // If nextSqrtX96 is not valid, try without price limit
              outputRes0 = await pool.getOutputAmount(maxAmountToken0)
            }
          } else if (pool && maxAmountToken0) {
            // If no nextSqrtX96, try without price limit
            outputRes0 = await pool.getOutputAmount(maxAmountToken0)
          }
        } catch (error) {
          console.warn('Error calculating output amount for liquidity chart:', error)
          outputRes0 = undefined
        }

        const token1Amount = outputRes0?.[0] as CurrencyAmount<Token> | undefined

        const amount0 = token1Amount ? parseFloat(token1Amount.toExact()) * parseFloat(t.price1) : 0
        const amount1 = token1Amount ? parseFloat(token1Amount.toExact()) : 0

        return {
          index: i,
          isCurrent: active,
          activeLiquidity: parseFloat(t.liquidityActive.toString()),
          price0: parseFloat(t.price0),
          price1: parseFloat(t.price1),
          tvlToken0: amount0,
          tvlToken1: amount1,
        }
      }),
    )
    formattedTicksData?.forEach((entry, i) => {
      if (i > 0) {
        formattedTicksData[i - 1].tvlToken0 = entry.tvlToken0
        formattedTicksData[i - 1].tvlToken1 = entry.tvlToken1
      }
    })
    return formattedTicksData
  }
  return []
}

export const ChartInfinityCLLiquidity: React.FC<InfinityCLChartLiquidityProps> = ({ poolInfo }) => {
  const [formattedData, setFormattedData] = useState<LiquidityChartData[] | undefined>()
  const { data: poolKey } = usePoolKeyByPoolId(poolInfo?.poolId, poolInfo?.chainId, POOL_TYPE.CLAMM)
  const tickSpacing = (poolKey as PoolKey<'CL'>)?.parameters.tickSpacing
  const poolTickData = useInfinityCLPoolTickData(poolInfo?.poolId, tickSpacing)

  useEffect(() => {
    if (formattedData) {
      return
    }
    formatDataFn({
      poolTickData,
      poolInfo,
      tickSpacing,
    }).then((newData) => {
      if (!newData.length) {
        return
      }
      setFormattedData(newData)
    })
  }, [tickSpacing, formattedData, poolInfo, poolTickData])

  return <BasicChartLiquidity poolInfo={poolInfo} liquidityChartData={formattedData} />
}
