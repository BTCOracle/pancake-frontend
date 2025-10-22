import {
  createBinPool,
  getBinPoolTokenPrice,
  getSwapIn,
  getSwapOut,
  parseProtocolFeesToNumbers,
} from '@pancakeswap/infinity-sdk'
import { CurrencyAmount } from '@pancakeswap/swap-sdk-core'

import { INFI_BIN_POOL_TYPE } from './constants'
import type { InfinityBinPool, InfinityBinPoolData } from './types'
import { getInfinityPoolFee } from './utils'

export function createInfinityBinPool(params: InfinityBinPoolData): InfinityBinPool {
  let p = { ...params, type: INFI_BIN_POOL_TYPE }

  const pool: InfinityBinPool = {
    type: INFI_BIN_POOL_TYPE,
    getReserve: (c) =>
      p.currency0.wrapped.equals(c.wrapped)
        ? p.reserve0 ?? CurrencyAmount.fromRawAmount(p.currency0, 0n)
        : p.reserve1 ?? CurrencyAmount.fromRawAmount(p.currency1, 0n),
    getCurrentPrice: (base) => {
      return getBinPoolTokenPrice(
        {
          currencyX: p.currency0,
          currencyY: p.currency1,
          activeId: BigInt(p.activeId),
          binStep: BigInt(p.binStep),
        },
        base,
      )
    },
    getTradingPairs: () => [[p.currency0, p.currency1]],
    getId: () => p.id,
    update: (poolData) => {
      p = { ...p, ...poolData }
    },
    log: () =>
      `Infinity Bin ${p.currency0.symbol} - ${p.currency1.symbol} (${getInfinityPoolFee(p.fee, p.protocolFee)}) - ${
        p.id
      } - price ${getBinPoolTokenPrice(
        {
          currencyX: p.currency0,
          currencyY: p.currency1,
          activeId: BigInt(p.activeId),
          binStep: BigInt(p.binStep),
        },
        p.currency0,
      ).toSignificant(6)} ${p.currency0.symbol}/${p.currency1.symbol}`,

    getPoolData: () => p,

    getQuote: ({ amount, isExactIn }) => {
      const { reserveOfBin } = p
      if (!reserveOfBin) {
        return undefined
      }
      try {
        const { currency0, currency1, binStep, activeId, fee, protocolFee } = p
        const binPool = createBinPool({
          currencyA: currency0,
          currencyB: currency1,
          binStep,
          activeId,
          reserveOfBin,
          lpFee: fee,
          protocolFees: parseProtocolFeesToNumbers(protocolFee),
        })

        const result = isExactIn
          ? getSwapOut(binPool, amount.quotient, amount.currency.wrapped.equals(currency0.wrapped))
          : getSwapIn(binPool, amount.quotient, amount.currency.wrapped.equals(currency1.wrapped))
        const quoteRaw = isExactIn
          ? (result as ReturnType<typeof getSwapOut>).amountOut
          : (result as ReturnType<typeof getSwapIn>).amountIn

        // Not enough liquidity to perform the swap
        if (quoteRaw <= 0n) {
          return undefined
        }
        const quoteCurrency = amount.currency.wrapped.equals(currency0.wrapped) ? currency1 : currency0
        const quote = CurrencyAmount.fromRawAmount(quoteCurrency, quoteRaw)

        // TODO: need to update the pool info after swap
        const newPool: InfinityBinPoolData = {
          ...p,
        }
        return {
          poolAfter: createInfinityBinPool(newPool),
          quote,
          pool,
        }
      } catch (e) {
        // console.warn('No enough liquidity to perform swap', e)
        return undefined
      }
    },

    estimateGasCostForQuote: () => {
      return 0n
    },
  }

  return pool
}
