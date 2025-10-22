/**
 * Calculates liquidity USD for V2/Stable positions
 */
export const calculateV2LiquidityUSD = (
  nativeDeposited0: any,
  nativeDeposited1: any,
  farmingDeposited0: any,
  farmingDeposited1: any,
  token0Price: number | undefined,
  token1Price: number | undefined,
): number => {
  const amount0 = nativeDeposited0.add(farmingDeposited0)
  const amount1 = nativeDeposited1.add(farmingDeposited1)

  const amount0Usd = Number(amount0.toExact()) * (token0Price ?? 0)
  const amount1Usd = Number(amount1.toExact()) * (token1Price ?? 0)

  return amount0Usd + amount1Usd
}
