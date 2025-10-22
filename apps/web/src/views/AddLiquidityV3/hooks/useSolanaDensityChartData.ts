import { UnifiedCurrency } from '@pancakeswap/sdk'
import { FeeAmount } from '@pancakeswap/v3-sdk'
import { ChartEntry } from '@pancakeswap/widgets-internal'
import { useCallback, useMemo } from 'react'
import { NonEVMChainId } from '@pancakeswap/chains'
import { useSolanaPoolByMint } from 'hooks/solana/useSolanaPoolsByMint'
import { useSolanaOnchainClmmPool } from 'hooks/solana/useSolanaOnchainPool'
import useAllTicksQuery from 'hooks/useAllTicksQuery'
import { Protocol } from '@pancakeswap/farms'
import { useActiveLiquidityByPool } from 'hooks/v3/usePoolTickData'

export function useSolanaDensityChartData({
  currencyA,
  currencyB,
  feeAmount,
}: {
  currencyA: UnifiedCurrency | undefined
  currencyB: UnifiedCurrency | undefined
  feeAmount: FeeAmount | undefined
}) {
  const isSolana = currencyA?.chainId === NonEVMChainId.SOLANA || currencyB?.chainId === NonEVMChainId.SOLANA

  const token0 = currencyA?.wrapped?.address
  const token1 = currencyB?.wrapped?.address
  const { data: solPool } = useSolanaPoolByMint(token0, token1, feeAmount)

  const { data: pool, isLoading, error } = useSolanaOnchainClmmPool(solPool?.poolId)

  const { data: ticks } = useAllTicksQuery({
    chainId: solPool?.chainId,
    poolAddress: solPool?.poolId,
    interval: 30000,
    enabled: isSolana,
    protocol: Protocol.V3,
    activeTick: pool?.computePoolInfo.tickCurrent,
  })

  const { data } = useActiveLiquidityByPool({
    currencyA: currencyA as any,
    currencyB: currencyB as any,
    ticks,
    pool: {
      tickSpacing: pool?.computePoolInfo.tickSpacing,
      tickCurrent: pool?.computePoolInfo.tickCurrent,
      liquidity: pool?.computePoolInfo.liquidity ? BigInt(pool?.computePoolInfo.liquidity.toString()) : undefined,
    },
  })

  const formatData = useCallback(() => {
    if (!data?.length) return undefined

    const newData: ChartEntry[] = []
    for (let i = 0; i < data.length; i++) {
      const t = data[i]
      const liquidityActive = (t as any).liquidityActive ?? (t as any).liquidity_active ?? 0
      const price0 = (t as any).price0 ?? (t as any).price ?? (t as any).price_0
      const chartEntry = {
        activeLiquidity: parseFloat(liquidityActive.toString()),
        price0: parseFloat(price0?.toString?.() ?? '0'),
      }
      if (chartEntry.activeLiquidity > 0) newData.push(chartEntry)
    }
    return newData
  }, [data])

  return useMemo(() => {
    return {
      isLoading,
      error: error ?? undefined,
      formattedData: !isLoading ? formatData() : undefined,
    }
  }, [isLoading, error, formatData])
}
