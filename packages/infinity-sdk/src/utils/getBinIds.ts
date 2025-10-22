import { convertBinIdsToRelative } from './convertBinIdsToRelative'

/**
 * Generate list of BinIds.
 *
 * @example
 * given activeId = 100, numBins = 3, returns [99, 100, 101]
 * given activeId = 100, numBins = 4, returns [98, 99, 100, 101]
 */
export const getBinIds = (activeId: number, numBins: number, relative = false): number[] => {
  let startId = Math.ceil(activeId - numBins / 2)
  const binIds: number[] = []

  for (let index = 0; index < numBins; index++) {
    binIds.push(Number(startId))
    startId++
  }

  return relative ? convertBinIdsToRelative(binIds, Number(activeId)) : binIds
}
