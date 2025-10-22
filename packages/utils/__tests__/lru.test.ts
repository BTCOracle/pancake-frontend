import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cacheByLRU } from '../cacheByLRU'

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

describe('cacheByLRU', () => {
  const ttl = 100
  const testFn = vi.fn(async (x: number) => {
    await sleep(10)
    return x * 2
  })

  beforeEach(() => {
    vi.useFakeTimers()
    testFn.mockClear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should cache the result of the function', async () => {
    const testFn = vi.fn(async (x: number) => x * 2)

    const ttl = 1000 // 1 second TTL
    const cached = cacheByLRU(testFn, { ttl })

    vi.useFakeTimers()
    const now = Date.now()
    vi.setSystemTime(now) // Freeze time at a specific timestamp

    const res1 = cached(2)
    vi.runAllTimers()
    expect(await res1).toBe(4)

    // Second call within same TTL window
    const res2 = cached(2)
    vi.runAllTimers()
    expect(await res2).toBe(4)

    expect(testFn).toBeCalledTimes(1) // Now this passes, cached correctly

    vi.useRealTimers() // Reset timers
  })

  it('should revalidate cache after TTL', async () => {
    const cachedFn = cacheByLRU(testFn, { ttl })

    const res1 = cachedFn(3)
    vi.runAllTimers()
    expect(await res1).toBe(6)
    expect(testFn).toBeCalledTimes(1)

    vi.advanceTimersByTime(ttl + 1)

    const res2 = cachedFn(3)
    vi.runAllTimers()
    expect(await res2).toBe(6)
    expect(testFn).toBeCalledTimes(2) // Revalidated
  })

  it('should use isValid to invalidate cache', async () => {
    const isValid = (result: number) => result !== 0
    const cachedFn = cacheByLRU(async (x) => 0, { ttl, isValid })

    const res1 = cachedFn(4)
    vi.runAllTimers()
    expect(await res1).toBe(0)

    const res2 = cachedFn(4)
    vi.runAllTimers()
    expect(await res2).toBe(0)
    expect(testFn).toBeCalledTimes(0) // Not cached due to invalid result
  })

  it('should handle promise rejection gracefully', async () => {
    const errorFn = vi.fn(async () => {
      throw new Error('Failed')
    })
    const cachedFn = cacheByLRU(errorFn, { ttl })

    await expect(cachedFn()).rejects.toThrow('Failed')
    expect(errorFn).toBeCalledTimes(1)

    // Retry after rejection
    await expect(cachedFn()).rejects.toThrow('Failed')
    expect(errorFn).toBeCalledTimes(2)
  })

  it('should use old epoch cache if has same contentCacheKey', async () => {
    const cachedFn = cacheByLRU(testFn, { ttl, maxAge: ttl * 10 })

    const res1 = cachedFn(10)
    vi.runAllTimers()
    expect(await res1).toBe(20)
    expect(testFn).toBeCalledTimes(1)

    vi.advanceTimersByTime(ttl * 2)

    const res2 = cachedFn(10)
    vi.runAllTimers()
    expect(await res2).toBe(20)
    expect(testFn).toBeCalledTimes(2)

    // advance time to test old epoch reuse
    vi.advanceTimersByTime(ttl)

    const res3 = cachedFn(10)
    vi.runAllTimers()
    expect(await res3).toBe(20)
    expect(testFn).toBeCalledTimes(3) // Should trigger re-fetch but return old epoch cache immediately
  })

  it('should delete cache and retry after timeout', async () => {
    const slowFn = vi.fn(async (x: number) => {
      await sleep(200)
      return x * 3
    })

    const cachedFn = cacheByLRU(slowFn, { ttl, requestTimeout: 100 })

    const promise1 = cachedFn(5)
    vi.advanceTimersByTime(101) // advance past timeout

    await expect(promise1).rejects.toThrow('Operation timed out after 100ms')
    expect(slowFn).toBeCalledTimes(1)

    // Cache should be cleared, next call should retry and timeout again
    const promise2 = cachedFn(5)
    vi.advanceTimersByTime(101)

    await expect(promise2).rejects.toThrow('Operation timed out after 100ms')
    expect(slowFn).toBeCalledTimes(2) // retried due to previous timeout
  })
})
