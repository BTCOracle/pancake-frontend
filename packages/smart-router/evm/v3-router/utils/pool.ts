import { getBinPoolTokenPrice } from '@pancakeswap/infinity-sdk'
import { Currency, Pair, Price } from '@pancakeswap/sdk'
import { getSwapOutput } from '@pancakeswap/stable-swap-sdk'
import memoize from '@pancakeswap/utils/memoize'
import tryParseAmount from '@pancakeswap/utils/tryParseAmount'
import { Pool as SDKV3Pool, computePoolAddress } from '@pancakeswap/v3-sdk'
import { Address } from 'viem'

import { InfinityBinPool, InfinityClPool, Pool, PoolType, StablePool, V2Pool, V3Pool } from '../types'

export function isV2Pool(pool: Pool): pool is V2Pool {
  return pool.type === PoolType.V2
}

export function isV3Pool(pool: Pool): pool is V3Pool {
  return pool.type === PoolType.V3
}

export function isStablePool(pool: Pool): pool is StablePool {
  return pool.type === PoolType.STABLE && pool.balances.length >= 2
}

export function isInfinityBinPool(pool: Pool): pool is InfinityBinPool {
  return pool.type === PoolType.InfinityBIN
}

export function isInfinityClPool(pool: Pool): pool is InfinityClPool {
  return pool.type === PoolType.InfinityCL
}

export function involvesCurrency(pool: Pool, currency: Currency) {
  const token = currency.wrapped
  if (isV2Pool(pool)) {
    const { reserve0, reserve1 } = pool
    return reserve0.currency.equals(token) || reserve1.currency.equals(token)
  }
  if (isV3Pool(pool)) {
    const { token0, token1 } = pool
    return token0.equals(token) || token1.equals(token)
  }
  if (isInfinityClPool(pool) || isInfinityBinPool(pool)) {
    const { currency0, currency1 } = pool
    return (
      currency0.equals(currency) ||
      currency1.equals(currency) ||
      currency0.wrapped.equals(token) ||
      currency1.wrapped.equals(token)
    )
  }
  if (isStablePool(pool)) {
    const { balances } = pool
    return balances.some((b) => b.currency.equals(token))
  }
  return false
}

// FIXME: current version is not working with stable pools that have more than 2 tokens
export function getOutputCurrency(pool: Pool, currencyIn: Currency): Currency {
  const tokenIn = currencyIn.wrapped
  if (isV2Pool(pool)) {
    const { reserve0, reserve1 } = pool
    return reserve0.currency.equals(tokenIn) ? reserve1.currency : reserve0.currency
  }
  if (isV3Pool(pool)) {
    const { token0, token1 } = pool
    return token0.equals(tokenIn) ? token1 : token0
  }
  if (isStablePool(pool)) {
    const { balances } = pool
    return balances[0].currency.equals(tokenIn) ? balances[1].currency : balances[0].currency
  }
  if (isInfinityClPool(pool) || isInfinityBinPool(pool)) {
    const { currency0, currency1 } = pool
    return currency0.wrapped.equals(tokenIn) ? currency1 : currency0
  }
  throw new Error('Cannot get output currency by invalid pool')
}

export const computeV3PoolAddress = memoize(
  computePoolAddress,
  ({ deployerAddress, tokenA, tokenB, fee }) =>
    `${tokenA.chainId}_${deployerAddress}_${tokenA.address}_${tokenB.address}_${fee}`,
)

export const computeV2PoolAddress = memoize(
  Pair.getAddress,
  (tokenA, tokenB) => `${tokenA.chainId}_${tokenA.address}_${tokenB.address}`,
)

export const getPoolAddress = (pool: Pool): Address | '' => {
  if (isStablePool(pool) || isV3Pool(pool)) {
    return pool.address
  }
  if (isV2Pool(pool)) {
    const { reserve0, reserve1 } = pool
    return computeV2PoolAddress(reserve0.currency.wrapped, reserve1.currency.wrapped)
  }
  if (isInfinityBinPool(pool) || isInfinityClPool(pool)) {
    return pool.id
  }
  return ''
}

export const getPoolCurrency0 = (pool: Pool): Currency => {
  if (isV2Pool(pool)) {
    return pool.reserve0.currency
  }
  if (isV3Pool(pool)) {
    return pool.token0
  }
  if (isInfinityClPool(pool) || isInfinityBinPool(pool)) {
    return pool.currency0
  }
  if (isStablePool(pool)) {
    return pool.balances[0].currency
  }
  throw new Error('Cannot get currency0 by invalid pool')
}

export const getPoolCurrency1 = (pool: Pool): Currency => {
  if (isV2Pool(pool)) {
    return pool.reserve1.currency
  }
  if (isV3Pool(pool)) {
    return pool.token1
  }
  if (isInfinityClPool(pool) || isInfinityBinPool(pool)) {
    return pool.currency1
  }
  if (isStablePool(pool)) {
    return pool.balances[1].currency
  }
  throw new Error('Cannot get currency0 by invalid pool')
}

export function getTokenPrice(pool: Pool, base: Currency, quote: Currency): Price<Currency, Currency> {
  if (isV3Pool(pool)) {
    const { token0, token1, fee, liquidity, sqrtRatioX96, tick } = pool
    const v3Pool = new SDKV3Pool(token0.wrapped, token1.wrapped, fee, sqrtRatioX96, liquidity, tick)
    return v3Pool.priceOf(base.wrapped)
  }

  if (isInfinityClPool(pool)) {
    const { currency0, currency1, fee, liquidity, sqrtRatioX96, tick } = pool
    const v3Pool = new SDKV3Pool(currency0.asToken, currency1.asToken, fee, sqrtRatioX96, liquidity, tick)
    const baseToken = currency0.wrapped.equals(base.wrapped) ? currency0.asToken : base.wrapped
    const tokenPrice = v3Pool.priceOf(baseToken)
    const [baseCurrency, quoteCurrency] = baseToken.equals(currency0.asToken)
      ? [currency0, currency1]
      : [currency1, currency0]
    return new Price(baseCurrency, quoteCurrency, tokenPrice.denominator, tokenPrice.numerator)
  }

  if (isInfinityBinPool(pool)) {
    const { activeId, binStep, currency0, currency1 } = pool
    return getBinPoolTokenPrice(
      {
        currencyX: currency0,
        currencyY: currency1,
        binStep: BigInt(binStep),
        activeId: BigInt(activeId),
      },
      base,
    )
  }

  if (isV2Pool(pool)) {
    const pair = new Pair(pool.reserve0.wrapped, pool.reserve1.wrapped)
    return pair.priceOf(base.wrapped)
  }

  // FIXME now assume price of stable pair is 1
  if (isStablePool(pool)) {
    const { amplifier, balances, fee } = pool
    const baseIn = tryParseAmount('1', base)
    if (!baseIn) {
      throw new Error(`Cannot parse amount for ${base.symbol}`)
    }
    const quoteOut = getSwapOutput({
      amplifier,
      balances,
      fee,
      outputCurrency: quote,
      amount: baseIn,
    })

    return new Price({
      baseAmount: baseIn,
      quoteAmount: quoteOut,
    })
  }
  return new Price(base, quote, 1n, 0n)
}
