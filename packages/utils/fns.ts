export function get<T = any, Default = undefined>(
  obj: Record<string, any> | undefined | null,
  path: string | Array<string | number>,
  defaultValue?: Default,
): T | Default {
  if (!obj) return defaultValue as Default

  const keys = Array.isArray(path)
    ? path
    : path
        .replace(/\[(\w+)\]/g, '.$1')
        .replace(/^\./, '')
        .split('.')

  let result: any = obj

  for (const key of keys) {
    result = result?.[key]
    if (result === undefined) {
      return defaultValue as Default
    }
  }

  return result as T
}

export function set(obj: Record<string, any>, path: string | Array<string | number>, value: any): Record<string, any> {
  if (!obj) return obj

  const keys = Array.isArray(path)
    ? path
    : path
        .replace(/\[(\w+)\]/g, '.$1')
        .replace(/^\./, '')
        .split('.')

  let current = obj

  keys.forEach((key, idx) => {
    if (idx === keys.length - 1) {
      current[key] = value
    } else {
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {}
      }
      current = current[key]
    }
  })

  return obj
}

/**
 * mapValues – applies `fn` to each own enumerable property value of `obj`
 * and returns a new object with the same keys, but mapped values.
 */
export function mapValues<T extends Record<string, any>, R>(
  obj: T,
  fn: (value: T[keyof T], key: keyof T, object: T) => R,
): { [K in keyof T]: R } {
  const result = {} as { [K in keyof T]: R }
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // key is string, but we know it's in keyof T
      const k = key as keyof T
      result[k] = fn(obj[k], k, obj)
    }
  }
  return result
}
