interface PriceLike {
  toSignificant: (digits: number) => string
}

interface TokenPriceSource<TToken = any> {
  priceOf: (token: TToken) => PriceLike | undefined
}

/**
 *
 * In some cases, calling `pair.priceOf(token)` can throw an exception.
 * This may happen if the pair data is incomplete, invalid, or in an inconsistent state.
 *
 */
export function safeGetTokenPairPrice<TPair extends TokenPriceSource<TToken>, TToken>(
  pair: TPair | null | undefined,
  token: TToken | null | undefined,
  significantDigits = 6,
): string {
  try {
    if (!pair || !token) return '-'
    const price = pair.priceOf(token)
    if (!price) return '-'
    return price.toSignificant(significantDigits)
  } catch (error) {
    console.error('safeGetTokenPairPrice error:', error)
    return '-'
  }
}
