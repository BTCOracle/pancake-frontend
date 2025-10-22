import { useMemo } from 'react'
import { useManualHook } from './useManualHook'
import { useHookEnabledQueryState, useHookSelectTypeQueryState } from './useQueriesState'
import { useSelectHookFromList } from './useSelectHookFromList'

export const useSelectedHook = () => {
  const [hookEnabled] = useHookEnabledQueryState()
  const [selectionType] = useHookSelectTypeQueryState()
  const { manualHook } = useManualHook()
  const [selectHook] = useSelectHookFromList()
  return useMemo(
    () => (hookEnabled ? (selectionType === 'list' ? selectHook : manualHook) : undefined),
    [selectHook, manualHook, selectionType, hookEnabled],
  )
}
