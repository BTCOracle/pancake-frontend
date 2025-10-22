import { SupportedPoolListItem } from '../types'

/**
 * Get bi-directional tokens map from supported pools list
 * Used to get supported input and output tokens for Limit Order
 */
export const getTokensMap = (pools: SupportedPoolListItem[]) => {
  return pools.reduce<Record<string, string[]>>((acc, { currency0, currency1 }) => {
    // eslint-disable-next-line no-param-reassign
    if (!acc[currency0]) acc[currency0] = []
    // eslint-disable-next-line no-param-reassign
    if (!acc[currency1]) acc[currency1] = []
    acc[currency0].push(currency1)
    acc[currency1].push(currency0)
    return acc
  }, Object.create(null))
}
