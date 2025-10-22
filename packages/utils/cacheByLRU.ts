import { keccak256, stringify } from 'viem'
import { LRU } from './lru'
import { takeFirstFulfilled } from './promise'
import { withTimeout } from './withTimeout'

type AsyncFunction<T extends any[]> = (...args: T) => Promise<any>

interface CacheItem {
  promise: Promise<any>
  resolved: any
  createTime: number
  epochId: number
}

interface Epoch {
  createTime: number
  cacheKey: string
  contentCacheKey: string
}

// Type definitions for the cache.
export type PersistOption = {
  name: string
  version: string
  type: 'r2'
}

export type CacheOptions<T extends AsyncFunction<any>> = {
  maxCacheSize?: number
  ttl: number
  persist?: PersistOption
  key?: (params: Parameters<T>) => any
  isValid?: (result: any) => boolean
  maxAge?: number
  rejectWhenNoCache?: boolean
  usingStaleValue?: boolean
  cacheNextEpochOnHalfTTS?: boolean
  requestTimeout?: number
  parallelism?: number
}

function defaultIsValid(val: any) {
  if (typeof val === 'undefined' || val === '') {
    return false
  }
  if (Array.isArray(val)) {
    return val.length > 0
  }
  if (typeof val === 'object') {
    return Object.keys(val).length > 0
  }
  return true
}

export function calcCacheKey(args: any[], epoch: number) {
  const json = stringify(args)
  const r = keccak256(`0x${json}@${epoch}`)
  return r
}

const DAY = 24 * 60 * 60 * 1000
export function persistKey(cacheKey: string, persist: PersistOption) {
  const bucket = Math.floor(Date.now() / DAY)
  return `${bucket}/${persist.name}/${persist.version}/${cacheKey}`
}

const identity = (args: any) => args

let cacheInstanceId = 1
export const cacheByLRU = <T extends AsyncFunction<any>>(
  fn: T,
  {
    ttl,
    key,
    maxCacheSize,
    persist,
    isValid,
    maxAge,
    rejectWhenNoCache,
    usingStaleValue = true,
    requestTimeout,
    cacheNextEpochOnHalfTTS,
    parallelism = 1,
  }: CacheOptions<T>,
) => {
  cacheInstanceId++
  const cache = new LRU<string, CacheItem[]>({
    maxAge: Math.max(ttl * 2, maxAge || 0),
    maxSize: maxCacheSize || 1000,
  })
  const fetchR2Cache = persist
    ? cacheByLRU(_fetchR2Cache, {
        ttl,
      })
    : undefined

  const keyFunction = key || identity

  async function ensurePersist(cacheKey: string, promise: Promise<any>) {
    if (fetchR2Cache && persist) {
      const r2Promise = fetchR2Cache(persistKey(cacheKey, persist))
      const { result: value } = await takeFirstFulfilled([r2Promise, promise])
      return value
    }
    return promise
  }

  const allowAddCache = (cacheKey: string) => {
    const items = cache.get(cacheKey)
    if (!items || items.length === 0) {
      return true
    }
    if (items.length >= parallelism) {
      return false
    }
    const anyResolved = items.some((item) => item.resolved)
    if (anyResolved) {
      return false
    }
    const latest = Math.max(...items.map((item) => item.createTime))
    const diff = Date.now() - latest
    return diff > 1_000
  }

  const findBestCache = (cacheKey: string) => {
    const items = cache.get(cacheKey)
    if (!items || items.length === 0) {
      return undefined
    }
    for (const curr of items) {
      if (curr.resolved) {
        return curr
      }
    }
    return items[0]
  }

  const addToCache = (cacheKey: string, item: CacheItem) => {
    const best = findBestCache(cacheKey)
    if (best) {
      return
    }
    const items = cache.get(cacheKey)
    if (!items) {
      cache.set(cacheKey, [item])
      return
    }
    items.push(item)
  }

  const epochs: Epoch[] = []
  const cachedFn = async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    const epoch = Date.now() / ttl
    const epochId = Math.floor(epoch)

    // Uniq cache ke related to content
    const contentCacheKey = calcCacheKey(keyFunction(args), 0)

    const cacheForEpoch = (epochId: number) => {
      const cacheKey = calcCacheKey(keyFunction(args), epochId)
      if (!allowAddCache(cacheKey)) {
        return findBestCache(cacheKey)!
      }
      const item = {
        promise: Promise.resolve(),
        resolved: undefined,
        createTime: Date.now(),
        epochId,
      }
      const createPromise = async () => {
        try {
          const caller = requestTimeout ? withTimeout(fn, { ms: requestTimeout }) : fn
          const promise = ensurePersist(cacheKey, caller(...args))
          const result = await promise
          if (!result) {
            cache.delete(cacheKey)
            return result
          }
          if (!(isValid || defaultIsValid)(result)) {
            cache.delete(cacheKey)
            return result
          }
          if (persist) {
            const jsonResult = stringify(result)
            if (result && jsonResult !== '{}' && jsonResult !== '[]') {
              const pkey = persistKey(cacheKey, persist)
              uploadR2(pkey, result)
                .then((updated) => {
                  if (updated) {
                    console.log(`[persist] cache succ: https://proofs.pancakeswap.com/cache/${pkey}, ${cacheKey}`)
                  }
                })
                .catch((ex) => {
                  console.error(`[persist] Failed to persist cache cache-size=${jsonResult.length}`, ex)
                })
            }
          }
          item.resolved = result
          return result
        } catch (ex) {
          cache.delete(cacheKey)
          throw ex
        }
      }
      item.promise = createPromise()
      addToCache(cacheKey, item)

      const epoch = {
        createTime: item.createTime,
        cacheKey,
        contentCacheKey,
      }
      const lastEpoch = epochs[epochs.length - 1]
      if (lastEpoch?.cacheKey !== cacheKey) {
        epochs.push(epoch)
      }
      return item
    }

    const current = cacheForEpoch(epochId)
    if (cacheNextEpochOnHalfTTS) {
      const next = epochId + 1
      const exceedHalfTTS = epoch - epochId > 0.5
      if (exceedHalfTTS) {
        cacheForEpoch(next)
      }
    }

    if (current.resolved) {
      return current.promise
    }
    if (usingStaleValue) {
      for (let i = epochs.length - 2; i >= 0; i--) {
        const epoch = epochs[i]
        if (maxAge && epoch.createTime + maxAge < Date.now()) {
          continue
        }
        if (epoch.contentCacheKey !== contentCacheKey) {
          continue
        }
        const epochCache = findBestCache(epoch.cacheKey)

        if (epochCache && epochCache.resolved) {
          return epochCache.promise
        }
      }
    }
    if (rejectWhenNoCache) {
      throw new Error(
        `No cache found: total=${epochs.length}, current=${current.epochId},  cacheInstanceId=${cacheInstanceId}`,
      )
    }

    return current.promise
  }
  return cachedFn as T
}

async function existsR2(key: string) {
  try {
    const resp = await fetch(`https://obj-cache.pancakeswap.com/cache/${key}`, {
      method: 'HEAD',
    })
    return resp.ok
  } catch (ex) {
    return false
  }
}
async function uploadR2(key: string, value: any) {
  if (!process.env.OBJECT_CACHE_SECRET) {
    return false
  }

  if (await existsR2(key)) {
    return false
  }
  await fetch(`https://obj-cache.pancakeswap.com`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OBJECT_CACHE_SECRET}`,
    },
    body: JSON.stringify({ key, value }),
  })
  return true
}

async function _fetchR2Cache(key: string) {
  const resp = await fetch(`https://proofs.pancakeswap.com/cache/${key}`)
  console.log(`[fetch] cache https://proofs.pancakeswap.com/cache/${key}`)
  if (resp.ok) {
    return resp.json()
  }
  throw new Error(`Failed to fetch cache`)
}
