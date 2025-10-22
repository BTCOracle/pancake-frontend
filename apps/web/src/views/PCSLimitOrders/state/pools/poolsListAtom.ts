import { atomWithAsyncRetry } from 'utils/atomWithAsyncRetry'
import { PCS_LIMIT_ORDER_POOLS_URL } from '../../constants'
import { SupportedPoolListItem } from '../../types'

/**
 * Supported pools for Limit Order from ALL chains
 */
export const supportedPoolsListAtom = atomWithAsyncRetry<SupportedPoolListItem[]>({
  asyncFn: async () => {
    const response = await fetch(PCS_LIMIT_ORDER_POOLS_URL)
    if (!response.ok) throw new Error('Unable to fetch supported pools for PCS Limit Order')
    return (await response.json()) as SupportedPoolListItem[]
  },
  delayMs: 2000,
  maxRetries: 5,
  errorReportKey: 'pcs-limit-order-fetch-supported-pools-error',
  fallbackValue: [],
  // TODO: Add fallback to few pools like BNB-CAKE from FE side
})
