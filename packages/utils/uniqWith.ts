export default function uniqWith<T>(array: T[], comparator: (a: T, b: T) => boolean): T[] {
  const result: T[] = []

  array.forEach((item) => {
    if (!result.some((existing) => comparator(item, existing))) {
      result.push(item)
    }
  })

  return result
}
