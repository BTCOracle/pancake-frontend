import { nanoid } from '@reduxjs/toolkit'
import { atom, useAtom, useAtomValue } from 'jotai'
import { atomFamily, atomWithStorage, loadable } from 'jotai/utils'
import { type AsyncStorage } from 'jotai/vanilla/utils/atomWithStorage'
import localForage from 'localforage'
import debounce from 'lodash/debounce'
import {
  fetchTokenList,
  batchFetchTokenListPending,
  batchFetchTokenListFulfilled,
  batchFetchTokenListRejected,
} from './actions'
import { getTokenList } from './getTokenList'
import { ListsState } from './reducer'
// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() {}

const noopStorage: AsyncStorage<any> = {
  getItem: () => Promise.resolve(noop()),
  setItem: () => Promise.resolve(noop()),
  removeItem: () => Promise.resolve(noop()),
}

// eslint-disable-next-line symbol-description
const EMPTY = Symbol()

export function findTokenByAddress(state: ListsState, chainId: number, address: string) {
  const urls = state.activeListUrls ?? Object.keys(state.byUrl)
  for (const url of urls) {
    const list = state.byUrl[url]?.current
    const token = list?.tokens.find((t) => t.chainId === chainId && t.address.toLowerCase() === address.toLowerCase())
    if (token) return token
  }
  return undefined
}

export function findTokenBySymbol(state: ListsState, chainId: number, symbol: string) {
  const urls = state.activeListUrls ?? Object.keys(state.byUrl)
  for (const url of urls) {
    const list = state.byUrl[url]?.current
    const token = list?.tokens.find((t) => t.chainId === chainId && t.symbol.toLowerCase() === symbol.toLowerCase())
    if (token) return token
  }
  return undefined
}

export const createListsAtom = (storeName: string, reducer: any, initialState: any) => {
  /**
   * Persist only token lists using IndexedDB - optimized storage format
   * @param {string} dbName - IndexedDB database name
   */
  function IndexedDBStorage<Value>(dbName: string): AsyncStorage<Value> {
    if (typeof window !== 'undefined') {
      const db = localForage.createInstance({
        name: dbName,
        storeName,
      })
      const mem = new Map<string, any>()

      const debouncedSetItem = debounce(async (k: string, v: any) => {
        db.setItem(k, v)
      }, 300)

      return {
        getItem: async (key: string) => {
          if (mem.has(key)) {
            return mem.get(key)
          }
          const value = await db.getItem(key)
          if (value) {
            return value
          }
          return undefined as any
        },
        setItem: async (k: string, v: any) => {
          if (v === EMPTY) return
          mem.set(k, v)
          debouncedSetItem(k, v)
        },
        removeItem: db.removeItem,
      }
    }
    return noopStorage
  }

  // Storage for token lists only - optimized format: { [url]: TokenList }
  const tokenListsStorageAtom = atomWithStorage<Record<string, any> | typeof EMPTY>(
    'tokenLists',
    EMPTY,
    IndexedDBStorage('tokenLists'),
  )

  // Memory state atom that holds the full ListsState
  const memoryStateAtom = atom<ListsState>(initialState as ListsState)

  const listStateAtom = atom<ListsState>((get) => {
    // Separate this(mem/storage) is a prepare for refactor of the list part
    const memoryState = get(memoryStateAtom)
    const value = get(loadable(tokenListsStorageAtom))

    if (value.state === 'hasData' && value.data && value.data !== EMPTY) {
      const storedTokenLists = value.data as Record<string, any>
      const reconstructedState = { ...memoryState }

      const updatedByUrl = { ...reconstructedState.byUrl }
      Object.keys(storedTokenLists).forEach((url) => {
        if (storedTokenLists[url]) {
          updatedByUrl[url] = {
            ...updatedByUrl[url],
            current: storedTokenLists[url],
            // Keep existing memory state for loading, error, pendingUpdate
          }
        }
      })
      reconstructedState.byUrl = updatedByUrl

      return reconstructedState
    }

    return memoryState
  })

  const updateListStateAtom = atom<null, any, void>(null, async (get, set, action) => {
    const currentMemoryState = get(memoryStateAtom)
    const newState = reducer(currentMemoryState, action)

    // Update memory state
    set(memoryStateAtom, { ...newState })

    // Extract only current token lists for storage
    const tokenListsToStore: Record<string, any> = {}
    Object.keys(newState.byUrl).forEach((url) => {
      if (newState.byUrl[url]?.current) {
        tokenListsToStore[url] = newState.byUrl[url].current
      }
    })

    // Store only the token lists, not the full state
    set(tokenListsStorageAtom, tokenListsToStore)
  })

  const isReadyAtom = loadable(tokenListsStorageAtom)

  const tokenAtom = atomFamily((key: { chainId: number; address: string }) =>
    atom((get) => findTokenByAddress(get(listStateAtom), key.chainId, key.address)),
  )

  const tokenBySymbolAtom = atomFamily((key: { chainId: number; symbol: string }) =>
    atom((get) => findTokenBySymbol(get(listStateAtom), key.chainId, key.symbol)),
  )

  const fetchListAtom = atom<null, [string], Promise<void>>(null, async (get, set, url) => {
    const state = get(listStateAtom)
    const listState = state.byUrl[url]
    if (listState?.current || listState?.loadingRequestId) {
      return
    }

    const requestId = nanoid()
    set(updateListStateAtom, fetchTokenList.pending({ url, requestId }))

    try {
      const tokenList = await getTokenList(url)
      set(updateListStateAtom, fetchTokenList.fulfilled({ url, tokenList: tokenList!, requestId }))
    } catch (error: any) {
      set(updateListStateAtom, fetchTokenList.rejected({ url, requestId, errorMessage: error.message }))
    }
  })

  const fetchListBatchAtom = atom<null, [string[]], Promise<void>>(null, async (get, set, urls) => {
    const state = get(listStateAtom)

    // Filter out URLs that are already loaded or loading
    const urlsToFetch = urls.filter((url) => {
      const listState = state.byUrl[url]
      return !listState?.current && !listState?.loadingRequestId
    })

    if (urlsToFetch.length === 0) {
      return
    }

    const requestId = nanoid()
    set(updateListStateAtom, batchFetchTokenListPending({ urls: urlsToFetch, requestId }))

    try {
      // Fetch all token lists in parallel
      const results = await Promise.allSettled(
        urlsToFetch.map(async (url) => {
          const tokenList = await getTokenList(url)
          return { url, tokenList: tokenList!, requestId }
        }),
      )

      // Separate successful and failed results
      const fulfilled: Array<{ url: string; tokenList: any; requestId: string }> = []
      const rejected: Array<{ url: string; errorMessage: string; requestId: string }> = []

      results.forEach((result, index) => {
        const url = urlsToFetch[index]
        if (result.status === 'fulfilled') {
          fulfilled.push(result.value)
        } else {
          rejected.push({
            url,
            errorMessage: result.reason?.message || 'Unknown error',
            requestId,
          })
        }
      })

      // Dispatch batch actions
      if (fulfilled.length > 0) {
        set(updateListStateAtom, batchFetchTokenListFulfilled({ results: fulfilled }))
      }
      if (rejected.length > 0) {
        set(updateListStateAtom, batchFetchTokenListRejected({ errors: rejected }))
      }
    } catch (error: any) {
      // Fallback to individual rejections if batch processing fails
      const errors = urlsToFetch.map((url) => ({
        url,
        errorMessage: error.message,
        requestId,
      }))
      set(updateListStateAtom, batchFetchTokenListRejected({ errors }))
    }
  })

  function useListState() {
    return useAtom(listStateAtom)
  }

  function useListStateReady() {
    const value = useAtomValue(isReadyAtom)
    return value.state === 'hasData'
  }

  return {
    listsAtom: listStateAtom,
    updateListStateAtom,
    tokenAtom,
    tokenBySymbolAtom,
    fetchListAtom,
    fetchListBatchAtom,
    useListStateReady,
    useListState,
  }
}
