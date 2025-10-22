import { getVersionUpgrade, VersionUpgrade } from '../src/getVersionUpgrade'
import { TokenList } from '../src/types'

// Mutable state type for reducer operations
type MutableListsState = {
  byUrl: {
    [url: string]: {
      current: TokenList | null
      pendingUpdate: TokenList | null
      loadingRequestId: string | null
      error: string | null
    }
  }
  lastInitializedDefaultListOfLists?: string[]
  activeListUrls: string[] | undefined
}

/**
 * Core function to set a single list to pending state
 */
export const setPendingTokenList = (state: MutableListsState, url: string, requestId: string): void => {
  const current = state.byUrl[url]?.current ?? null
  const pendingUpdate = state.byUrl[url]?.pendingUpdate ?? null

  state.byUrl[url] = {
    current,
    pendingUpdate,
    loadingRequestId: requestId,
    error: null,
  }
}

/**
 * Core function to set a single list to fulfilled state
 */
export const setFulfilledTokenList = (
  state: MutableListsState,
  url: string,
  tokenList: TokenList,
  requestId: string,
  DEFAULT_ACTIVE_LIST_URLS: string[],
): boolean => {
  const current = state.byUrl[url]?.current
  const loadingRequestId = state.byUrl[url]?.loadingRequestId

  // no-op if update does nothing
  if (current) {
    const upgradeType = getVersionUpgrade(current.version, tokenList.version)

    if (upgradeType === VersionUpgrade.NONE) return false
    if (loadingRequestId === null || loadingRequestId === requestId) {
      state.byUrl[url] = {
        ...state.byUrl[url],
        loadingRequestId: null,
        error: null,
        current,
        pendingUpdate: tokenList,
      }
    }
    return false // not a new list, so no activation needed
  }
  // activate if on default active
  if (DEFAULT_ACTIVE_LIST_URLS.includes(url) && state.activeListUrls && !state.activeListUrls.includes(url)) {
    state.activeListUrls.push(url)
  }

  state.byUrl[url] = {
    ...state.byUrl[url],
    loadingRequestId: null,
    error: null,
    current: tokenList,
    pendingUpdate: null,
  }
  return true // new list, might need activation
}

/**
 * Core function to set a single list to rejected state
 */
export const setRejectedTokenList = (
  state: MutableListsState,
  url: string,
  requestId: string,
  errorMessage: string,
): void => {
  if (state.byUrl[url]?.loadingRequestId !== requestId) {
    // no-op since it's not the latest request
    return
  }

  state.byUrl[url] = {
    ...state.byUrl[url],
    loadingRequestId: null,
    error: errorMessage,
    current: null,
    pendingUpdate: null,
  }
}

/**
 * Batch activate URLs if needed
 */
export const batchActivateUrls = (state: MutableListsState, urls: string[]): void => {
  if (urls.length > 0 && state.activeListUrls) {
    urls.forEach((url) => {
      if (!state.activeListUrls!.includes(url)) {
        state.activeListUrls!.push(url)
      }
    })
  }
}
