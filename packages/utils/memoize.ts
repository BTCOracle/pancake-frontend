export default function memoize<T extends (...args: any[]) => any>(
  fn: T,
  resolver?: (...args: Parameters<T>) => any,
): T & { cache: Map<any, ReturnType<T>> } {
  const cache = new Map<any, ReturnType<T>>()

  const memoized = (...args: Parameters<T>): ReturnType<T> => {
    const key = resolver ? resolver(...args) : args[0]
    if (cache.has(key)) {
      return cache.get(key)!
    }

    const result = fn(...args)
    cache.set(key, result)
    return result
  }

  ;(memoized as T & { cache: Map<any, ReturnType<T>> }).cache = cache

  return memoized as T & { cache: Map<any, ReturnType<T>> }
}

export interface MemoizeAsyncOptions<T> {
  resolver?: (...args: any[]) => any
  isValid?: (result: T) => boolean
}

const defaultIsValid = <T>(result: T): boolean => {
  if (result === undefined) return false
  if (Array.isArray(result) && result.length === 0) return false
  if (typeof result === 'object' && result !== null && Object.keys(result).length === 0) return false
  return true
}

export function memoizeAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options?: MemoizeAsyncOptions<Awaited<ReturnType<T>>>,
): T & { cache: Map<any, Promise<Awaited<ReturnType<T>>>> } {
  const cache = new Map<any, Promise<Awaited<ReturnType<T>>>>()

  const memoized = function (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> {
    const key = options?.resolver ? options.resolver(...args) : args[0]

    if (cache.has(key)) {
      return cache.get(key)!
    }

    const promise = fn(...args)
      .then((result) => {
        const isValid = options?.isValid ? options.isValid(result) : defaultIsValid(result)
        if (!isValid) {
          cache.delete(key)
        }
        return result
      })
      .catch((error) => {
        cache.delete(key)
        throw error
      })

    cache.set(key, promise)

    return promise
  }

  ;(memoized as T & { cache: Map<any, Promise<Awaited<ReturnType<T>>>> }).cache = cache

  return memoized as T & { cache: Map<any, Promise<Awaited<ReturnType<T>>>> }
}
