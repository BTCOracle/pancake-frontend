import { getCurrencyPriceFromId } from '@pancakeswap/infinity-sdk'
import { FeeAmount, nearestUsableTick, TICK_SPACINGS, TickMath, tickToPrice } from '@pancakeswap/v3-sdk'
import { Bound } from '@pancakeswap/widgets-internal'
import { MAX_TICK, MIN_TICK, SqrtPriceMath as SolanaSqrtPriceMath, TickUtils } from '@pancakeswap/solana-core-sdk'
import { formatPercentage } from './formatting'

/**
 * Safely converts tick to price using V3 SDK with maximum precision
 * Used in InfinityCL and V3 position tables
 */
export const getTickPrice = (tick: number, token0: any, token1: any, isFlipped?: boolean): number => {
  try {
    // Use TickMath constants for bounds checking
    if (tick >= TickMath.MAX_TICK) return Infinity
    if (tick <= TickMath.MIN_TICK) return 0

    // Use the V3 SDK's tickToPrice function for accurate calculation
    if (token0 && token1) {
      // Always calculate the base price as token0/token1
      const price = tickToPrice(token0, token1, tick)
      const priceValue = parseFloat(price.toFixed(18))

      // When flipped, invert the price to get token1/token0
      return isFlipped ? 1 / priceValue : priceValue
    }

    // Fallback
    const basePrice = 1.0001 ** tick
    return isFlipped ? 1 / basePrice : basePrice
  } catch (error) {
    console.error('Error calculating tick price:', error)
    const basePrice = 1.0001 ** tick
    return isFlipped ? 1 / basePrice : basePrice
  }
}

/**
 * Calculates tick limits for full range detection
 * Used in InfinityCL and V3 position tables
 */
export const calculateTickLimits = (
  tickSpacing: number | undefined,
): {
  [bound in Bound]: number | undefined
} => {
  return {
    [Bound.LOWER]: tickSpacing ? nearestUsableTick(TickMath.MIN_TICK, tickSpacing) : undefined,
    [Bound.UPPER]: tickSpacing ? nearestUsableTick(TickMath.MAX_TICK, tickSpacing) : undefined,
  }
}

export const calculateSolanaTickLimits = (
  tickSpacing: number | undefined,
): {
  [bound in Bound]: number | undefined
} => {
  return {
    [Bound.LOWER]: tickSpacing ? TickUtils.nearestUsableTick(MIN_TICK, tickSpacing) : undefined,
    [Bound.UPPER]: tickSpacing ? TickUtils.nearestUsableTick(MAX_TICK, tickSpacing) : undefined,
  }
}

/**
 * Solana: safely converts tick to price using Solana Core SDK with maximum precision
 */
export const getSolanaTickPrice = (tick: number, token0: any, token1: any, isFlipped?: boolean): number => {
  try {
    if (tick >= MAX_TICK) return Infinity
    if (tick <= MIN_TICK) return 0

    if (token0 && token1) {
      const sqrt = SolanaSqrtPriceMath.getSqrtPriceX64FromTick(tick)
      const priceDecimal = SolanaSqrtPriceMath.sqrtPriceX64ToPrice(sqrt, token0?.decimals ?? 0, token1?.decimals ?? 0)
      const priceValue = parseFloat(priceDecimal.toString())
      return isFlipped ? 1 / priceValue : priceValue
    }

    const basePrice = 1.0001 ** tick
    return isFlipped ? 1 / basePrice : basePrice
  } catch (error) {
    console.error('Error calculating Solana tick price:', error)
    const basePrice = 1.0001 ** tick
    return isFlipped ? 1 / basePrice : basePrice
  }
}

/**
 * Solana: Calculates price range data for tick-based positions
 * Aligns with calculateTickBasedPriceRange but uses Solana tick/price logic and limits
 */
export const calculateSolanaTickBasedPriceRange = (
  tickLower: number,
  tickUpper: number,
  token0: any,
  token1: any,
  isTickAtLimit: { [bound in Bound]: boolean },
  isFlipped?: boolean,
  currentPrice?: number,
): PriceRangeData => {
  let minPriceFormatted = '-'
  let maxPriceFormatted = '-'
  let minPercentage = ''
  let maxPercentage = ''
  let rangePosition = 50
  let showPercentages = false
  let currentPriceString: string | undefined

  // Swap ticks in flipped mode to maintain range order
  const actualTickLower = isFlipped ? tickUpper : tickLower
  const actualTickUpper = isFlipped ? tickLower : tickUpper
  const actualIsTickAtLimit = isFlipped
    ? { [Bound.LOWER]: isTickAtLimit[Bound.UPPER], [Bound.UPPER]: isTickAtLimit[Bound.LOWER] }
    : isTickAtLimit

  // Calculate min/max prices at ticks
  const minPrice = getSolanaTickPrice(actualTickLower, token0, token1, isFlipped)
  const maxPrice = getSolanaTickPrice(actualTickUpper, token0, token1, isFlipped)

  // Format with special handling at limits
  minPriceFormatted = actualIsTickAtLimit[Bound.LOWER] ? '0' : minPrice.toString() || '-'
  maxPriceFormatted = actualIsTickAtLimit[Bound.UPPER] ? '∞' : maxPrice.toString() || '-'

  // Handle full range
  if (actualIsTickAtLimit[Bound.LOWER] && actualIsTickAtLimit[Bound.UPPER]) {
    rangePosition = 50
    showPercentages = true
    minPercentage = '0%'
    maxPercentage = '100%'
    minPriceFormatted = '0'
    maxPriceFormatted = '∞'
  } else if (currentPrice !== undefined && actualTickLower > MIN_TICK && actualTickUpper < MAX_TICK) {
    try {
      const cp = Number(currentPrice)
      if (
        cp > 0 &&
        maxPrice > minPrice &&
        Number.isFinite(minPrice) &&
        Number.isFinite(maxPrice) &&
        Number.isFinite(cp)
      ) {
        const minPercent = ((minPrice - cp) / cp) * 100
        const maxPercent = ((maxPrice - cp) / cp) * 100

        if (
          Number.isFinite(minPercent) &&
          Number.isFinite(maxPercent) &&
          Math.abs(minPercent) < 10000 &&
          Math.abs(maxPercent) < 10000
        ) {
          minPercentage = formatPercentage(minPercent)
          maxPercentage = formatPercentage(maxPercent)
          rangePosition = Math.max(0, Math.min(100, ((cp - minPrice) / (maxPrice - minPrice)) * 100))
          showPercentages = true
          currentPriceString = cp.toFixed(18)
        }
      }
    } catch (error) {
      console.warn('Solana price calculation error:', error)
    }
  }

  return {
    minPriceFormatted,
    maxPriceFormatted,
    minPercentage,
    maxPercentage,
    rangePosition,
    showPercentages,
    currentPrice: currentPriceString,
  }
}

/**
 * Determines if ticks are at their limits (for full range detection)
 * Used in InfinityCL and V3 position tables
 */
export const getTickAtLimitStatus = (
  tickLower: number,
  tickUpper: number,
  ticksLimit: { [bound in Bound]: number | undefined },
): { [bound in Bound]: boolean } => {
  return {
    [Bound.LOWER]: tickLower && ticksLimit.LOWER ? tickLower <= ticksLimit.LOWER : false,
    [Bound.UPPER]: tickUpper && ticksLimit.UPPER ? tickUpper >= ticksLimit.UPPER : false,
  }
}

/**
 * Gets tick spacing from pool or fee tier
 * Used in V3 position table
 */
export const getTickSpacing = (pool: any, feeTier?: FeeAmount): number | undefined => {
  return pool?.tickSpacing ?? (feeTier ? TICK_SPACINGS[feeTier] : undefined)
}

/**
 * Common interface for price range calculation result
 */
export interface PriceRangeData {
  minPriceFormatted: string
  maxPriceFormatted: string
  minPercentage: string
  maxPercentage: string
  rangePosition: number
  showPercentages: boolean
  currentPrice?: string // Add current price to the interface
}

/**
 * Calculates price range data for tick-based positions (InfinityCL, V3)
 * Common logic extracted from InfinityCL and V3 position tables
 */
export const calculateTickBasedPriceRange = (
  tickLower: number,
  tickUpper: number,
  token0: any,
  token1: any,
  pool: any,
  isTickAtLimit: { [bound in Bound]: boolean },
  isFlipped?: boolean,
): PriceRangeData => {
  let minPriceFormatted = '-'
  let maxPriceFormatted = '-'
  let minPercentage = ''
  let maxPercentage = ''
  let rangePosition = 50
  let showPercentages = false
  let currentPriceString: string | undefined

  // When flipped, we need to swap the tick order because inverting prices reverses the range
  const actualTickLower = isFlipped ? tickUpper : tickLower
  const actualTickUpper = isFlipped ? tickLower : tickUpper
  const actualIsTickAtLimit = isFlipped
    ? {
        [Bound.LOWER]: isTickAtLimit[Bound.UPPER],
        [Bound.UPPER]: isTickAtLimit[Bound.LOWER],
      }
    : isTickAtLimit

  // Calculate prices using tick-to-price conversion with flip support
  const minPrice = getTickPrice(actualTickLower, token0, token1, isFlipped)
  const maxPrice = getTickPrice(actualTickUpper, token0, token1, isFlipped)

  // Format prices with special handling for tick limits
  // Use toString() to avoid precision loss, as PriceRangeDisplay will format inside the component
  minPriceFormatted = actualIsTickAtLimit.LOWER ? '0' : minPrice.toString() || '-'
  maxPriceFormatted = actualIsTickAtLimit.UPPER ? '∞' : maxPrice.toString() || '-'

  // Handle full range positions
  if (actualIsTickAtLimit.LOWER && actualIsTickAtLimit.UPPER) {
    rangePosition = 50
    showPercentages = true
    minPercentage = '0%'
    maxPercentage = '100%'
    minPriceFormatted = '0'
    maxPriceFormatted = '∞'
  } else if (pool?.token0Price && actualTickLower > TickMath.MIN_TICK && actualTickUpper < TickMath.MAX_TICK) {
    // Calculate percentages only if prices are not at limits and pool exists
    try {
      // Use the correct current price based on flip state
      // token0Price: token1/token0, token1Price: token0/token1
      let basePrice
      if (isFlipped) {
        // Use token1Price if available, otherwise invert token0Price
        basePrice = pool.token1Price || pool.token0Price?.invert?.()
      } else {
        basePrice = pool.token0Price
      }

      if (!basePrice) {
        console.warn('No base price available for range calculation')
        return {
          minPriceFormatted,
          maxPriceFormatted,
          minPercentage,
          maxPercentage,
          rangePosition,
          showPercentages,
          currentPrice: currentPriceString,
        }
      }

      // Use higher precision (18 significant digits) to avoid precision loss for small numbers
      const currentPrice = parseFloat(basePrice.toFixed(18))
      currentPriceString = basePrice.toFixed(18)

      if (
        currentPrice > 0 &&
        maxPrice > minPrice &&
        Number.isFinite(minPrice) &&
        Number.isFinite(maxPrice) &&
        Number.isFinite(currentPrice)
      ) {
        const minPercent = ((minPrice - currentPrice) / currentPrice) * 100
        const maxPercent = ((maxPrice - currentPrice) / currentPrice) * 100

        if (
          // Only show percentages if they're reasonable finite values
          Number.isFinite(minPercent) &&
          Number.isFinite(maxPercent) &&
          Math.abs(minPercent) < 10000 &&
          Math.abs(maxPercent) < 10000
        ) {
          minPercentage = formatPercentage(minPercent)
          maxPercentage = formatPercentage(maxPercent)
          rangePosition = Math.max(0, Math.min(100, ((currentPrice - minPrice) / (maxPrice - minPrice)) * 100))
          showPercentages = true
        }
      }
    } catch (error) {
      // If any calculation fails, just show the price range without percentages
      console.warn('Price calculation error:', error)
    }
  }

  return {
    minPriceFormatted,
    maxPriceFormatted,
    minPercentage,
    maxPercentage,
    rangePosition,
    showPercentages,
    currentPrice: currentPriceString,
  }
}

/**
 * Calculates price range data for bin-based positions (InfinityBin)
 * Extracted from InfinityBin position table
 */
export const calculateBinBasedPriceRange = (
  minBinId: number | null,
  maxBinId: number | null,
  binStep: number,
  activeId: number | undefined,
  token0: any,
  token1: any,
  isFlipped?: boolean,
): PriceRangeData => {
  let minPriceFormatted = '-'
  let maxPriceFormatted = '-'
  let minPercentage = ''
  let maxPercentage = ''
  let rangePosition = 50
  let showPercentages = false
  let currentPrice: any

  if (minBinId && maxBinId && binStep && token0 && token1) {
    // Calculate base prices normally (token0/token1)
    const minPriceBase = getCurrencyPriceFromId(minBinId, binStep, token0, token1)
    const maxPriceBase = getCurrencyPriceFromId(maxBinId, binStep, token0, token1)
    const currentPriceBase = activeId ? getCurrencyPriceFromId(activeId, binStep, token0, token1) : undefined

    // When flipped, invert prices and swap min/max
    let minPrice
    let maxPrice
    if (isFlipped) {
      minPrice = maxPriceBase ? maxPriceBase.invert() : undefined
      maxPrice = minPriceBase ? minPriceBase.invert() : undefined
      currentPrice = currentPriceBase ? currentPriceBase.invert() : undefined
    } else {
      minPrice = minPriceBase
      maxPrice = maxPriceBase
      currentPrice = currentPriceBase
    }

    if (minPrice && maxPrice) {
      // Check for extreme values and format accordingly - use higher precision for small numbers
      const minPriceFloat = parseFloat(minPrice.toFixed(18))
      const maxPriceFloat = parseFloat(maxPrice.toFixed(18))

      // Show '0' for extremely low prices and '∞' for extremely high prices
      if (minPriceFloat === 0 || !Number.isFinite(minPriceFloat)) {
        minPriceFormatted = '0'
      } else {
        minPriceFormatted = minPrice.toFixed(18)
      }

      if (maxPriceFloat === Infinity || !Number.isFinite(maxPriceFloat)) {
        maxPriceFormatted = '∞'
      } else {
        maxPriceFormatted = maxPrice.toFixed(18)
      }

      // Calculate percentages if we have current price and position is not removed
      if (currentPrice) {
        try {
          // Use higher precision (18 significant digits) to avoid precision loss for small numbers
          const currentPriceFloat = parseFloat(currentPrice.toFixed(18))
          const minPriceFloat = parseFloat(minPrice.toFixed(18))
          const maxPriceFloat = parseFloat(maxPrice.toFixed(18))

          if (
            currentPriceFloat > 0 &&
            maxPriceFloat > minPriceFloat &&
            Number.isFinite(minPriceFloat) &&
            Number.isFinite(maxPriceFloat) &&
            Number.isFinite(currentPriceFloat)
          ) {
            const minPercent = ((minPriceFloat - currentPriceFloat) / currentPriceFloat) * 100
            const maxPercent = ((maxPriceFloat - currentPriceFloat) / currentPriceFloat) * 100

            if (
              Number.isFinite(minPercent) &&
              Number.isFinite(maxPercent) &&
              Math.abs(minPercent) < 10000 &&
              Math.abs(maxPercent) < 10000
            ) {
              minPercentage = formatPercentage(minPercent)
              maxPercentage = formatPercentage(maxPercent)
              rangePosition = Math.max(
                0,
                Math.min(100, ((currentPriceFloat - minPriceFloat) / (maxPriceFloat - minPriceFloat)) * 100),
              )
              showPercentages = true
            }
          }
        } catch (error) {
          console.warn('Price calculation error:', error)
        }
      }
    }
  }

  return {
    minPriceFormatted,
    maxPriceFormatted,
    minPercentage,
    maxPercentage,
    rangePosition,
    showPercentages,
    currentPrice: currentPrice?.toFixed(18),
  }
}
