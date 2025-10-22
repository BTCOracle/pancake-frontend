import { useCallback } from 'react'
import { useManualHook } from './useManualHook'
import { useHookEnabledQueryState, useHookSelectTypeQueryState } from './useQueriesState'
import { useSelectHookFromList } from './useSelectHookFromList'

export const useHookReset = () => {
  const [, setHook] = useSelectHookFromList()
  const { setManualHook } = useManualHook()
  const [, setHookEnabled] = useHookEnabledQueryState()
  const [, setHookSelectType] = useHookSelectTypeQueryState()

  return useCallback(() => {
    setManualHook(undefined)
    setHook(undefined)
    setHookSelectType('list')
    setHookEnabled(false)
  }, [setHookEnabled, setManualHook])
}
