import { parseAsBoolean, parseAsInteger, parseAsStringLiteral, useQueryState, useQueryStates } from 'nuqs'

export const useInverted = () => {
  return useQueryState(
    'inverted',
    parseAsBoolean.withOptions({
      shallow: true,
    }),
  )
}

export const useBinRangeQueryState = () => {
  return useQueryStates({
    lowerBinId: parseAsInteger.withOptions({ shallow: true }),
    upperBinId: parseAsInteger.withOptions({ shallow: true }),
  })
}

export const useClRangeQueryState = () => {
  return useQueryStates({
    lowerTick: parseAsInteger.withOptions({ shallow: true }),
    upperTick: parseAsInteger.withOptions({ shallow: true }),
  })
}
export const useBinNumQueryState = () =>
  useQueryState(
    'numBin',
    parseAsInteger.withOptions({
      shallow: true,
    }),
  )

export const useLiquidityShapeQueryState = () => {
  return useQueryState(
    'liquidityShape',
    parseAsStringLiteral(['Spot', 'Curve', 'BidAsk'] as const)
      .withDefault('Spot')
      .withOptions({ shallow: true }),
  )
}
