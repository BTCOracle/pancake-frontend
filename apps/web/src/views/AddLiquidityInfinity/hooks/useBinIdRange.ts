import { MAX_BIN_NUM_PER_SIDE } from 'hooks/infinity/useBinNum'
import { useMemo } from 'react'
import { usePool } from './usePool'

export const useBinIdRange = () => {
  const pool = usePool<'Bin'>()

  const [maxBinId, minBinId] = useMemo(
    () => [
      pool?.activeId ? pool.activeId + MAX_BIN_NUM_PER_SIDE : null,
      pool?.activeId ? pool.activeId - MAX_BIN_NUM_PER_SIDE : null,
    ],
    [pool?.activeId],
  )

  return {
    maxBinId,
    minBinId,
  }
}
