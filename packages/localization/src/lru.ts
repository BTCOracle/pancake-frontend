export interface LRUOptions {
  /** Maximum number of items in cache */
  maxSize?: number
  /** Maximum age of an item in milliseconds */
  maxAge?: number
}

interface Entry<V> {
  value: V
  createTime: number
}

export class LRU<K, V> {
  private maxSize: number

  private maxAge: number

  private map = new Map<K, Entry<V>>()

  constructor({ maxSize = 1000, maxAge = 0 }: LRUOptions) {
    this.maxSize = maxSize
    this.maxAge = maxAge
  }

  has(key: K): boolean {
    return this.get(key) !== undefined
  }

  get(key: K): V | undefined {
    const entry = this.map.get(key)
    if (!entry) return undefined

    // expire old entries
    if (this.maxAge > 0 && Date.now() - entry.createTime > this.maxAge) {
      this.map.delete(key)
      return undefined
    }

    // refresh recency
    this.map.delete(key)
    this.map.set(key, entry)

    return entry.value
  }

  set(key: K, value: V) {
    const entry: Entry<V> = {
      value,
      createTime: Date.now(),
    }

    // refresh if already existed
    if (this.map.has(key)) {
      this.map.delete(key)
    }
    this.map.set(key, entry)

    // evict oldest if over capacity
    if (this.map.size > this.maxSize) {
      const oldestKey = this.map.keys().next().value
      if (!oldestKey) {
        return
      }
      this.map.delete(oldestKey)
    }
  }

  delete(key: K): void {
    this.map.delete(key)
  }

  clear(): void {
    this.map.clear()
  }

  get size(): number {
    return this.map.size
  }
}
