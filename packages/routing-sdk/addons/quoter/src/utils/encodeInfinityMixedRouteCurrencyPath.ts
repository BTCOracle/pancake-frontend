import { BaseRoute } from '@pancakeswap/routing-sdk'
import { Currency, getCurrencyAddress, getMatchedCurrency } from '@pancakeswap/swap-sdk-core'
import { Address } from 'viem'

import { SupportedPool } from '../types'
import { getOutputCurrency } from './getOutputCurrency'

/**
 * Converts a route to an array of path key
 * @param route the mixed path to convert to an encoded path
 * @returns the encoded path keys
 */
export function encodeInfinityMixedRouteCurrencyPath(
  route: Omit<BaseRoute<SupportedPool>, 'percent' | 'inputAmount' | 'outputAmount' | 'gasUseEstimate'>,
): Address[] {
  const { pools } = route
  const currencyStart = route.path[0]
  const pathStart = getMatchedCurrency(currencyStart, pools[0].getTradingPairs()[0])
  if (!pathStart) {
    throw new Error('Failed to encode path keys. Invalid start currency.')
  }

  const { path } = pools.reduce(
    (
      // eslint-disable-next-line @typescript-eslint/no-shadow
      { baseCurrency, path }: { baseCurrency: Currency; path: Address[] },
      p: SupportedPool,
    ): { baseCurrency: Currency; path: Address[] } => {
      const quoteCurrency = getOutputCurrency(p, baseCurrency)
      return {
        baseCurrency: quoteCurrency,
        path: [...path, getCurrencyAddress(quoteCurrency)],
      }
    },
    { baseCurrency: pathStart, path: [getCurrencyAddress(pathStart)] },
  )

  return path
}
