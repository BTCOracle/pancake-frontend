import { useRouter } from 'next/router'
import { useCallback, useMemo } from 'react'

/**
 * Get or Set a variable from a list of dynamic route params
 * @param param Dynamic route's parameter name (eg. slug, currency, etc.)
 * @param index Index of variable in dynamic params list
 * @param defaultValue Default Value (Optional)
 * @returns
 */
export const useDynamicRouteParam = <T extends number | undefined>(param: string, index?: T, defaultValue?: string) => {
  const router = useRouter()

  const value: T extends number ? string : string[] = useMemo(() => {
    const queries = router.query?.[param]
    if (Array.isArray(queries)) {
      return ((typeof index === 'undefined' ? queries : queries[index]) ?? defaultValue) as T extends number
        ? string
        : string[]
    }
    return (queries ?? defaultValue) as T extends number ? string : string[]
  }, [router.query, param, index, defaultValue])

  const setValue = useCallback(
    (newValue: string | string[]) => {
      const queries = router.query?.[param]
      let newQueryParams: string | string[] = newValue
      if (Array.isArray(queries) && !Array.isArray(newValue) && typeof index !== 'undefined') {
        newQueryParams = queries.slice()
        while (newQueryParams.length < index) {
          newQueryParams.push('')
        }
        newQueryParams[index] = newValue
      }

      router.replace(
        {
          query: {
            ...router.query,
            [param]: newQueryParams,
          },
        },
        undefined,
        { shallow: true },
      )
    },
    [router, param, index],
  )

  return [value, setValue] as const
}
