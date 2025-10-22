export default function uniqBy<T, K extends keyof T>(array: T[], iteratee: ((item: T) => unknown) | K): T[] {
  const seen = new Set<unknown>()
  const result: T[] = []

  const getKey = typeof iteratee === 'function' ? iteratee : (item: T) => item[iteratee]

  for (const item of array) {
    const key = getKey(item)
    if (!seen.has(key)) {
      seen.add(key)
      result.push(item)
    }
  }

  return result
}
