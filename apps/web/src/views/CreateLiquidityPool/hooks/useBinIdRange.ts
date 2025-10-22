import { MAX_BIN_NUM_PER_SIDE } from 'hooks/infinity/useBinNum'
import { useMemo } from 'react'
import { useActiveIdQueryState, useBinStepQueryState } from 'state/infinity/create'
import { useInfinityCreateFormQueryState } from './useInfinityFormState/useInfinityFormQueryState'

export const useBinIdRange = () => {
  const { isBin } = useInfinityCreateFormQueryState()
  const [activeId] = useActiveIdQueryState()
  const [binStep] = useBinStepQueryState()

  const minBinId = useMemo(() => {
    if (!isBin || !activeId || !binStep) return null

    return activeId - MAX_BIN_NUM_PER_SIDE
  }, [isBin, activeId, binStep])

  const maxBinId = useMemo(() => {
    if (!isBin || !activeId || !binStep) return null

    return activeId + MAX_BIN_NUM_PER_SIDE
  }, [isBin, activeId, binStep])

  return {
    minBinId,
    maxBinId,
  }
}
