import { Currency, getCurrencyAddress } from '@pancakeswap/swap-sdk-core'

function isCurrency(a: any): a is Currency {
  if (a == null || typeof a !== 'object') return false
  if (Object.prototype.hasOwnProperty.call(a, 'isNative') || Object.prototype.hasOwnProperty.call(a, 'address')) {
    return true
  }
  return false
}

export function isEqual(a: any, b: any): boolean {
  if (a === b) return true

  if (a == null || typeof a !== 'object' || b == null || typeof b !== 'object') {
    return false
  }

  if (Array.isArray(a) !== Array.isArray(b)) return false

  if (isCurrency(a) && isCurrency(b)) {
    return getCurrencyAddress(a) === getCurrencyAddress(b)
  }

  const keysA = Object.keys(a)
  const keysB = Object.keys(b)

  if (keysA.length !== keysB.length) return false

  for (const key of keysA) {
    if (!keysB.includes(key) || !isEqual(a[key], b[key])) {
      return false
    }
  }

  return true
}

export const getHashKey = (obj: any): string => {
  if (obj === null || typeof obj !== 'object') {
    return String(obj)
  }
  const keys = Object.keys(obj).sort()
  return keys
    .map((key) => {
      const value = obj[key]
      if (isCurrency(value)) {
        return `${key}:${getCurrencyAddress(value)}`
      }
      return `${key}:${getHashKey(obj[key])}`
    })
    .join('|')
}

export class DeepKeyMap<K, V> {
  private innerMap: Map<string, V>

  constructor() {
    this.innerMap = new Map<string, V>()
  }

  set(key: K, value: V): void {
    const hashedKey = getHashKey(key)
    this.innerMap.set(hashedKey, value)
  }

  get(key: K): V | undefined {
    const hashedKey = getHashKey(key)
    return this.innerMap.get(hashedKey)
  }

  delete(key: K): boolean {
    const hashedKey = getHashKey(key)
    return this.innerMap.delete(hashedKey)
  }

  has(key: K): boolean {
    const hashedKey = getHashKey(key)
    return this.innerMap.has(hashedKey)
  }

  clear(): void {
    this.innerMap.clear()
  }
}
