import { Loadable } from '@pancakeswap/utils/Loadable'
import { useSetAtom } from 'jotai'
import { useCallback, useEffect, useState } from 'react'
import { fetchListBatchAtom, useListStateReady } from 'state/lists/lists'
import { wait } from 'state/multicall/retry'

export const useTokenListPrepared = (urls: string[]) => {
  const isReady = useListStateReady()

  const fetchList = useSetAtom(fetchListBatchAtom)
  const [flag, setFlag] = useState<Loadable<boolean>>(Loadable.Pending())

  const load = useCallback(async () => {
    if (isReady) {
      await fetchList(urls)
      setFlag(Loadable.Just(true))
      await wait(20) // reduce token list updates
    }
  }, [urls, isReady])

  useEffect(() => {
    load()
  }, [urls])

  return flag
}
