import isUndefinedOrNull from '@pancakeswap/utils/isUndefinedOrNull'
import { atom } from 'jotai'
import { getLogger } from './datadog'

const logger = getLogger('error-report')

export function atomWithAsyncRetry<T>({
  asyncFn,
  maxRetries = 3,
  delayMs = 1000,
  fallbackValue = undefined,
  errorReportKey,
}: {
  asyncFn: () => Promise<T>
  maxRetries?: number
  delayMs?: number
  fallbackValue?: T | (() => Promise<T>)
  errorReportKey?: string
}) {
  const triggerAtom = atom(0) // triggers re-fetching when incremented

  const retryableAsyncAtom = atom(async (get) => {
    get(triggerAtom) // re-run this async when triggerAtom changes
    let attempt = 0
    while (attempt < maxRetries) {
      try {
        // eslint-disable-next-line no-await-in-loop
        return await asyncFn()
      } catch (error) {
        if (errorReportKey) {
          logger.error(errorReportKey, {
            reason: 'Async function failed',
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
          })
        }
        attempt++

        if (attempt >= maxRetries) {
          if (!isUndefinedOrNull(fallbackValue)) {
            try {
              if (typeof fallbackValue === 'function') {
                // eslint-disable-next-line no-await-in-loop
                return await (fallbackValue as () => Promise<T>)()
              }
              return fallbackValue as T
            } catch {
              return undefined as T
            }
          }
          throw error
        }
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => setTimeout(resolve, delayMs))
      }
    }
    throw new Error('Retries exhausted')
  })

  const retryAtom = atom(
    (get) => get(retryableAsyncAtom),
    (_get, set) => set(triggerAtom, (c) => c + 1),
  )

  return retryAtom
}
