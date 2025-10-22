import { useCallback } from 'react'
import { useBinNumQueryState, useBinRangeQueryState } from 'state/infinity/shared'

export const MAX_BIN_NUM_PER_SIDE = 29
export const MAX_BIN_NUM = MAX_BIN_NUM_PER_SIDE * 2 + 1

export const useBinNum = () => {
  const [binNum, _setBinNum] = useBinNumQueryState()
  const [{ lowerBinId }, setBinRange] = useBinRangeQueryState()

  const setBinNum = useCallback(
    (n: number | null) => {
      _setBinNum(n)

      if (lowerBinId && n !== null) {
        setBinRange({ upperBinId: lowerBinId + n - 1 })
      }

      if (n === null) {
        setBinRange({ upperBinId: null })
      }
    },
    [_setBinNum, setBinRange, lowerBinId],
  )

  return { binNum, setBinNum }
}
