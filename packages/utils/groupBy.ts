export default function groupBy<T>(array: T[], key: keyof T | ((item: T) => string | number)): Record<string, T[]> {
  const result: Record<string, T[]> = {}

  for (const item of array) {
    const keyValue = typeof key === 'function' ? key(item) : item[key]
    const groupKey = keyValue as string | number

    if (!result[groupKey]) {
      result[groupKey] = []
    }

    result[groupKey].push(item)
  }

  return result
}
