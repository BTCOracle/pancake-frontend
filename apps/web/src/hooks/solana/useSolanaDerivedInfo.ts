import { useTranslation } from '@pancakeswap/localization'
import {
  Currency,
  Price,
  sortUnifiedCurrencies,
  Token,
  UnifiedCurrency,
  UnifiedCurrencyAmount,
} from '@pancakeswap/swap-sdk-core'
import { FeeAmount, Pool, Position, TickMath, encodeSqrtRatioX96, priceToClosestTick } from '@pancakeswap/v3-sdk'
import { MAX_TICK, MIN_TICK, TickUtils } from '@pancakeswap/solana-core-sdk'
import { Bound } from 'config/constants/types'
import { ReactNode, useMemo } from 'react'
import tryParseAmount from '@pancakeswap/utils/tryParseAmount'
import { UnifiedBalance, useUnifiedCurrencyBalances } from 'hooks/useUnifiedCurrencyBalance'
import { CurrencyField as Field } from 'utils/types'
import { MintState } from 'views/AddLiquidityV3/formViews/V3FormView/form/reducer'
import { useAccountActiveChain } from 'hooks/useAccountActiveChain'
import { useClmmAmmConfigs } from 'hooks/solana/useClmmAmmConfigs'
import { tryParsePriceSolana } from 'hooks/v3/utils/tryParsePriceSolana'
import { tryParseTickSolana } from 'hooks/v3/utils/tryParseTickSolana'

import { tryParsePrice } from 'hooks/v3/utils'
import tryParseCurrencyAmount from 'utils/tryParseCurrencyAmount'
import { useDependentAmountFromClmm } from './useDependentAmountFromClmm'
import { useSolanaPoolByMint } from './useSolanaPoolsByMint'
import { useSolanaOnchainClmmPool } from './useSolanaOnchainPool'

export enum PoolState {
  LOADING,
  EXISTS,
  NOT_EXISTS,
  INVALID,
}

const checkAndParseMaxTick = (tick: number) => (tick === MAX_TICK ? MAX_TICK - 1 : tick)

export const useSolanaDerivedInfo = (
  currencyA?: UnifiedCurrency,
  currencyB?: UnifiedCurrency,
  feeAmount?: number,
  baseCurrency?: UnifiedCurrency,
  existingPosition?: Position,
  formState?: MintState,
): {
  pool?: Pool | null
  poolState: PoolState
  ticks: { [bound in Bound]?: number | undefined }
  price?: Price<Currency, Currency>
  pricesAtTicks: { [bound in Bound]?: Price<Currency, Currency> | undefined }
  currencies: { [field in Field]?: UnifiedCurrency }
  currencyBalances: { [field in Field]?: UnifiedBalance }
  dependentField: Field
  parsedAmounts: { [field in Field]?: UnifiedCurrencyAmount<UnifiedCurrency> }
  noLiquidity: boolean
  errorMessage?: ReactNode
  hasInsufficentBalance: boolean
  invalidPool: boolean
  outOfRange: boolean
  invalidRange: boolean
  depositADisabled: boolean
  depositBDisabled: boolean
  invertPrice: boolean
  ticksAtLimit: { [bound in Bound]?: boolean | undefined }
  tickSpaceLimits: { [bound in Bound]: number | undefined }
} => {
  const { t } = useTranslation()
  const { unifiedAccount: account } = useAccountActiveChain()
  const ammConfigs = useClmmAmmConfigs()

  const { independentField, typedValue, leftRangeTypedValue, rightRangeTypedValue, startPriceTypedValue } =
    formState || {}

  const dependentField = independentField === Field.CURRENCY_A ? Field.CURRENCY_B : Field.CURRENCY_A

  const currencies: { [field in Field]?: UnifiedCurrency } = useMemo(
    () => ({
      [Field.CURRENCY_A]: currencyA,
      [Field.CURRENCY_B]: currencyB,
    }),
    [currencyA, currencyB],
  )

  const [token0, token1, baseToken] = useMemo(() => {
    const [currencyA_, currencyB_] =
      currencyA && currencyB ? sortUnifiedCurrencies([currencyA, currencyB]) : [currencyA, currencyB]
    return [currencyA_?.wrapped, currencyB_?.wrapped, baseCurrency?.wrapped]
  }, [currencyA, currencyB, baseCurrency])

  const balances = useUnifiedCurrencyBalances(
    useMemo(() => [currencies[Field.CURRENCY_A], currencies[Field.CURRENCY_B]], [currencies]),
  )
  const currencyBalances = useMemo(
    () => ({
      [Field.CURRENCY_A]: balances?.[0],
      [Field.CURRENCY_B]: balances?.[1],
    }),
    [balances],
  )

  // Solana tickSpacing by feeAmount (must match a config)
  const tickSpacing: number | undefined = useMemo(() => {
    if (!feeAmount) return undefined
    const cfg = Object.values(ammConfigs).find((c) => c.tradeFeeRate === feeAmount)
    return cfg?.tickSpacing
  }, [ammConfigs, feeAmount])

  const {
    data: poolInfo,
    isLoading: isPoolLoading,
    status,
  } = useSolanaPoolByMint(token0?.address, token1?.address, feeAmount)
  const { data: PoolOnchain } = useSolanaOnchainClmmPool(poolInfo?.poolId)

  const invertPrice = Boolean(baseToken && token0 && !baseToken.equals(token0))

  const price: Price<Currency, Currency> | undefined = useMemo(() => {
    if (startPriceTypedValue) {
      const parsedQuoteAmount = tryParseCurrencyAmount(startPriceTypedValue, (invertPrice ? token0 : token1) as Token)
      if (parsedQuoteAmount && token0 && token1) {
        const baseAmount = tryParseCurrencyAmount('1', (invertPrice ? token1 : token0) as Token)
        const p =
          baseAmount && parsedQuoteAmount
            ? new Price(
                baseAmount.currency as Token,
                parsedQuoteAmount.currency as Token,
                baseAmount.quotient,
                parsedQuoteAmount.quotient,
              )
            : undefined
        return (invertPrice ? p?.invert() : p) ?? undefined
      }
    }

    if (token0 && token1 && PoolOnchain) {
      return tryParsePrice(token0, token1, PoolOnchain?.computePoolInfo.currentPrice.toFixed())
    }
    return undefined
  }, [startPriceTypedValue, invertPrice, token0, token1, PoolOnchain])

  const invalidPrice = useMemo(() => {
    const sqrtRatioX96 = price ? encodeSqrtRatioX96(price.numerator, price.denominator) : undefined
    return price && sqrtRatioX96 && !(sqrtRatioX96 >= TickMath.MIN_SQRT_RATIO && sqrtRatioX96 < TickMath.MAX_SQRT_RATIO)
  }, [price])

  const mockPool = useMemo(() => {
    if (!token0 || !token1 || !feeAmount || !price || invalidPrice) return undefined
    try {
      const currentTick = priceToClosestTick(price)
      const currentSqrt = TickMath.getSqrtRatioAtTick(currentTick)
      return new Pool(token0 as Token, token1 as Token, feeAmount, currentSqrt, 0n, currentTick, [])
    } catch {
      return undefined
    }
  }, [feeAmount, invalidPrice, price, token0, token1])

  const { poolState, noLiquidity } = useMemo(() => {
    const poolState =
      status === 'pending' || isPoolLoading ? PoolState.LOADING : poolInfo ? PoolState.EXISTS : PoolState.NOT_EXISTS
    return {
      poolState,
      noLiquidity: poolState === PoolState.NOT_EXISTS,
    }
  }, [poolInfo, isPoolLoading, status])

  const poolForPosition: Pool | undefined = mockPool

  const tickSpaceLimits: {
    [bound in Bound]: number | undefined
  } = useMemo(
    () => ({
      [Bound.LOWER]: tickSpacing ? TickUtils.nearestUsableTick(MIN_TICK, tickSpacing) : undefined,
      [Bound.UPPER]: tickSpacing ? TickUtils.nearestUsableTick(MAX_TICK, tickSpacing) : undefined,
    }),
    [tickSpacing],
  )

  const ticks: { [key: string]: number | undefined } = useMemo(() => {
    return {
      [Bound.LOWER]:
        typeof existingPosition?.tickLower === 'number'
          ? existingPosition.tickLower
          : (invertPrice && typeof rightRangeTypedValue === 'boolean') ||
            (!invertPrice && typeof leftRangeTypedValue === 'boolean')
          ? tickSpaceLimits[Bound.LOWER]
          : tryParseTickSolana({
              tickSpacing,
              price: invertPrice ? rightRangeTypedValue : leftRangeTypedValue,
              token0Decimal: token0?.decimals,
              token1Decimal: token1?.decimals,
              baseIn: !invertPrice,
            }),
      [Bound.UPPER]:
        typeof existingPosition?.tickUpper === 'number'
          ? checkAndParseMaxTick(existingPosition.tickUpper)
          : (!invertPrice && typeof rightRangeTypedValue === 'boolean') ||
            (invertPrice && typeof leftRangeTypedValue === 'boolean')
          ? tickSpaceLimits[Bound.UPPER]
          : tryParseTickSolana({
              tickSpacing,
              price: invertPrice ? leftRangeTypedValue : rightRangeTypedValue,
              token0Decimal: token0?.decimals,
              token1Decimal: token1?.decimals,
              baseIn: !invertPrice,
            }),
    }
  }, [
    existingPosition,
    invertPrice,
    leftRangeTypedValue,
    rightRangeTypedValue,
    tickSpaceLimits,
    tickSpacing,
    token0,
    token1,
  ])

  const { [Bound.LOWER]: tickLower, [Bound.UPPER]: tickUpper } = ticks || {}

  const ticksAtLimit = useMemo(
    () => ({
      [Bound.LOWER]: tickLower === tickSpaceLimits.LOWER,
      [Bound.UPPER]: tickUpper === tickSpaceLimits.UPPER,
    }),
    [tickSpaceLimits, tickLower, tickUpper],
  )

  const invalidRange = Boolean(typeof tickLower === 'number' && typeof tickUpper === 'number' && tickLower >= tickUpper)

  const pricesAtTicks = useMemo(() => {
    const tickLower = ticks[invertPrice ? Bound.UPPER : Bound.LOWER]
    const tickUpper = ticks[invertPrice ? Bound.LOWER : Bound.UPPER]
    return {
      [Bound.LOWER]:
        typeof tickLower === 'number'
          ? tryParsePriceSolana({
              tick: tickLower,
              tickSpacing,
              token0,
              token1,
              baseIn: !invertPrice,
            })
          : undefined,
      [Bound.UPPER]:
        typeof tickUpper === 'number'
          ? tryParsePriceSolana({
              tick: tickUpper,
              tickSpacing,
              token0,
              token1,
              baseIn: !invertPrice,
            })
          : undefined,
    }
  }, [ticks, invertPrice, tickSpacing, token0, token1])

  const { [Bound.LOWER]: lowerPrice, [Bound.UPPER]: upperPrice } = pricesAtTicks

  const onchainTickCurrent = PoolOnchain?.computePoolInfo.tickCurrent
  const outOfRangeByTick =
    typeof tickLower === 'number' && typeof tickUpper === 'number' && typeof onchainTickCurrent === 'number'
      ? onchainTickCurrent < tickLower || onchainTickCurrent > tickUpper
      : undefined

  const outOfRange = useMemo(() => {
    const currentPrice = invertPrice ? price?.invert() : price
    return Boolean(
      !invalidRange &&
        (outOfRangeByTick !== undefined
          ? outOfRangeByTick
          : currentPrice &&
            lowerPrice &&
            upperPrice &&
            (currentPrice.lessThan(lowerPrice) || currentPrice.greaterThan(upperPrice))),
    )
  }, [invalidRange, invertPrice, lowerPrice, outOfRangeByTick, price, upperPrice])

  const independentAmount = useMemo(
    () => tryParseAmount(typedValue, independentField ? currencies[independentField] : undefined),
    [typedValue, currencies, independentField],
  )

  const dependentAmount = useDependentAmountFromClmm({
    independentAmount,
    token0,
    token1,
    tickSpacing,
    price: price?.toSignificant(18),
    tickLower,
    tickUpper,
    outOfRange,
    invalidRange,
    dependentCurrency: dependentField === Field.CURRENCY_B ? currencyB : currencyA,
  })

  const parsedAmounts = useMemo(() => {
    return {
      [Field.CURRENCY_A]: independentField === Field.CURRENCY_A ? independentAmount : dependentAmount,
      [Field.CURRENCY_B]: independentField === Field.CURRENCY_A ? dependentAmount : independentAmount,
    }
  }, [dependentAmount, independentAmount, independentField])

  const tickCurrentForDeposit =
    typeof onchainTickCurrent === 'number' ? onchainTickCurrent : poolForPosition?.tickCurrent
  const deposit0Disabled = Boolean(
    typeof tickUpper === 'number' && tickCurrentForDeposit !== undefined && tickCurrentForDeposit >= tickUpper,
  )
  const deposit1Disabled = Boolean(
    typeof tickLower === 'number' && tickCurrentForDeposit !== undefined && tickCurrentForDeposit <= tickLower,
  )

  const depositADisabled =
    invalidRange ||
    Boolean(
      (deposit0Disabled && poolForPosition && currencyA && poolForPosition.token0.equals(currencyA.wrapped)) ||
        (deposit1Disabled && poolForPosition && currencyA && poolForPosition.token1.equals(currencyA.wrapped)),
    )
  const depositBDisabled =
    invalidRange ||
    Boolean(
      (deposit0Disabled && poolForPosition && currencyB && poolForPosition.token0.equals(currencyB.wrapped)) ||
        (deposit1Disabled && poolForPosition && currencyB && poolForPosition.token1.equals(currencyB.wrapped)),
    )

  let hasInsufficentBalance = false
  let errorMessage: ReactNode | undefined
  if (!account) {
    errorMessage = t('Connect Wallet')
  }

  if (invalidPrice) {
    errorMessage = errorMessage ?? t('Invalid price input')
  }

  if (
    (!parsedAmounts[Field.CURRENCY_A] && !depositADisabled) ||
    (!parsedAmounts[Field.CURRENCY_B] && !depositBDisabled)
  ) {
    errorMessage = errorMessage ?? t('Enter an amount')
  }

  const { [Field.CURRENCY_A]: currencyAAmount, [Field.CURRENCY_B]: currencyBAmount } = parsedAmounts

  if (
    currencyAAmount &&
    (currencyAAmount?.equalTo?.(0) || currencyBalances?.[Field.CURRENCY_A]?.lessThan?.(currencyAAmount))
  ) {
    hasInsufficentBalance = true
    errorMessage = t('Insufficient %symbol% balance', { symbol: currencies[Field.CURRENCY_A]?.symbol ?? '' })
  }

  if (
    currencyBAmount &&
    (currencyBAmount?.equalTo?.(0) || currencyBalances?.[Field.CURRENCY_B]?.lessThan?.(currencyBAmount))
  ) {
    hasInsufficentBalance = true
    errorMessage = t('Insufficient %symbol% balance', { symbol: currencies[Field.CURRENCY_B]?.symbol ?? '' })
  }

  const invalidPool = poolState === PoolState.INVALID

  return {
    dependentField,
    currencies,
    pool: mockPool ?? undefined,
    poolState,
    currencyBalances,
    parsedAmounts,
    ticks,
    price,
    pricesAtTicks,
    // position,
    noLiquidity,
    errorMessage,
    hasInsufficentBalance,
    invalidPool,
    invalidRange,
    outOfRange,
    depositADisabled,
    depositBDisabled,
    invertPrice,
    ticksAtLimit,
    tickSpaceLimits,
  }
}
