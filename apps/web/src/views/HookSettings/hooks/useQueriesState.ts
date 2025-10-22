import { parseAsBoolean, parseAsStringLiteral, useQueryState } from 'nuqs'

export const useHookSelectTypeQueryState = () => {
  return useQueryState(
    'hookSelectType',
    parseAsStringLiteral(['list', 'manual'] as const)
      .withOptions({
        shallow: true,
      })
      .withDefault('list'),
  )
}

export const useHookEnabledQueryState = () => {
  return useQueryState('hookEnabled', parseAsBoolean.withOptions({ shallow: true }).withDefault(false))
}
