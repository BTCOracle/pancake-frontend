import { BinLiquidityShape, PoolType } from '@pancakeswap/infinity-sdk'
import { useCallback, useMemo } from 'react'
import {
  useActiveIdQueryState,
  useBinStepQueryState,
  useClTickSpacingQueryState,
  useFeeLevelQueryState,
  useFeeTierSettingQueryState,
  usePoolTypeQueryState,
  usePriceRangeQueryState,
  useStartingPriceQueryState,
} from 'state/infinity/create'
import {
  useBinNumQueryState,
  useBinRangeQueryState,
  useClRangeQueryState,
  useInverted,
  useLiquidityShapeQueryState,
} from 'state/infinity/shared'
import { Address } from 'viem'
import { CreateLiquidityFeeTier } from 'views/CreateLiquidityPool/types'
import { useHookEnabledQueryState } from 'views/HookSettings/hooks/useQueriesState'
import { useSelectedHook } from 'views/HookSettings/hooks/useSelectedHook'

export type InfinitySharedQueryState = {
  poolType: PoolType | null
  hookEnabled: boolean | null
  hookAddress?: Address | null
  feeTierSetting?: CreateLiquidityFeeTier | null
  feeLevel?: number | null
  inverted?: boolean | null
  startPrice?: string | null
  lowerPrice?: number | null
  upperPrice?: number | null
}

export type BinQueryState = {
  poolType: 'Bin'
  activeId: number | null
  binStep: number | null
  upperBinId: number | null
  lowerBinId: number | null
  liquidityShape: BinLiquidityShape
  numBin: number | null
}

export type CLQueryState = {
  poolType: 'CL'
  lowerTick: number | null
  upperTick: number | null
  tickSpacing: number | null
  feeTier: number | null
}

export type InfinityComputedState = {
  isBin: boolean
  isCl: boolean
  isStatic: boolean
  isDynamic: boolean
}

export type InfinityQueryState = (BinQueryState | CLQueryState) & InfinityComputedState

export const useInfinitySharedQueryState = () => {
  const [poolType] = usePoolTypeQueryState()
  const [hookEnabled] = useHookEnabledQueryState()
  const selectedHook = useSelectedHook()
  const [feeTierSetting] = useFeeTierSettingQueryState()
  const [feeLevel] = useFeeLevelQueryState()
  const [inverted] = useInverted()
  const [startPrice] = useStartingPriceQueryState()
  const [{ lowerPrice, upperPrice }] = usePriceRangeQueryState()

  return {
    poolType,
    hookEnabled,
    hookAddress: selectedHook?.address,
    feeTierSetting,
    feeLevel,
    inverted,
    lowerPrice,
    upperPrice,
    startPrice,
  } satisfies InfinitySharedQueryState
}

export const useInfinityBinQueryState = () => {
  const [activeId] = useActiveIdQueryState()
  const [binStep] = useBinStepQueryState()
  const [liquidityShape] = useLiquidityShapeQueryState()
  const [numBin] = useBinNumQueryState()
  const [{ upperBinId, lowerBinId }] = useBinRangeQueryState()

  return {
    poolType: 'Bin',
    activeId,
    binStep,
    liquidityShape: liquidityShape as BinLiquidityShape,
    numBin,
    upperBinId,
    lowerBinId,
  } satisfies BinQueryState
}

export const useInfinityResetBinQueryState = () => {
  const [, setActiveId] = useActiveIdQueryState()
  const [, setBinStep] = useBinStepQueryState()
  const [, setLiquidityShape] = useLiquidityShapeQueryState()
  const [, setNumBin] = useBinNumQueryState()
  const [, setBinRange] = useBinRangeQueryState()

  return useCallback(() => {
    setActiveId(null)
    setBinStep(null)
    setLiquidityShape(null)
    setNumBin(null)
    setBinRange({ lowerBinId: null, upperBinId: null })
  }, [setActiveId, setBinStep, setLiquidityShape, setNumBin, setBinRange])
}

export const useInfinityCLQueryState = () => {
  const [{ lowerTick, upperTick }] = useClRangeQueryState()
  const [tickSpacing] = useClTickSpacingQueryState()
  const [feeTier] = useFeeLevelQueryState()

  return {
    poolType: 'CL',
    lowerTick,
    upperTick,
    tickSpacing,
    feeTier,
  } satisfies CLQueryState
}

export const useInfinityResetCLQueryState = () => {
  const [, setClRange] = useClRangeQueryState()
  const [, setClTickSpacing] = useClTickSpacingQueryState()
  const [, setFeeLevel] = useFeeLevelQueryState()

  return useCallback(() => {
    setClRange({ lowerTick: null, upperTick: null })
    setClTickSpacing(null)
    setFeeLevel(null)
  }, [setClRange, setClTickSpacing, setFeeLevel])
}

export const useInfinityCreateFormQueryState = () => {
  const sharedQueryState = useInfinitySharedQueryState()
  const binQueryState = useInfinityBinQueryState()
  const clQueryState = useInfinityCLQueryState()

  const isBin = useMemo(() => sharedQueryState.poolType === 'Bin', [sharedQueryState.poolType])
  const isCl = useMemo(() => sharedQueryState.poolType === 'CL', [sharedQueryState.poolType])

  const isStatic = useMemo(() => sharedQueryState.feeTierSetting === 'static', [sharedQueryState.feeTierSetting])
  const isDynamic = useMemo(() => sharedQueryState.feeTierSetting === 'dynamic', [sharedQueryState.feeTierSetting])

  return {
    ...sharedQueryState,
    ...(isBin ? binQueryState : clQueryState),
    isBin,
    isCl,
    isStatic,
    isDynamic,
  } satisfies InfinityQueryState
}
