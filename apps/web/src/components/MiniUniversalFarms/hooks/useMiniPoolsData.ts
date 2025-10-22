import { ISortOrder } from '@pancakeswap/uikit'
import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'
import { PoolInfo } from 'state/farmsV4/state/type'
import { PoolSearcherState } from 'views/universalFarms/atom/PoolSearcher'
import { searchQueryAtom, updateSortAtom } from 'views/universalFarms/atom/searchQueryAtom'
import { useFarmSearch } from 'views/universalFarms/hooks/useFarmSearch'

interface UseMiniPoolsDataReturn {
  pools: PoolInfo[]
  isLoading: boolean
  loadMore: () => void
  handleSort: (sort: { order: ISortOrder; dataIndex: string | null }) => void
}

export const useMiniPoolsData = (): UseMiniPoolsDataReturn => {
  // Use existing Universal Farms atoms
  const { pools, state, setPage } = useFarmSearch()
  const isLoading = state === PoolSearcherState.SEARCHING

  const updateSort = useSetAtom(updateSortAtom)

  const loadMore = useCallback(() => {
    setPage((prev) => (prev ?? 0) + 1)
  }, [setPage])

  const handleSort = useCallback(
    ({ order, dataIndex }) => {
      updateSort({
        order,
        dataIndex,
      })
    },
    [updateSort],
  )

  return {
    pools,
    isLoading,
    loadMore,
    handleSort,
  }
}
