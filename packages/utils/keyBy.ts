export default function keyBy<T>(array: T[], key: keyof T | ((item: T) => string | number)): Record<string, T> {
  const result: Record<string, T> = {}

  for (const item of array) {
    const keyValue = typeof key === 'function' ? key(item) : item[key]
    result[keyValue as string | number] = item
  }

  return result
}
