import { atom } from 'jotai'
import { QuoteResultForUI } from 'quoter/quoter.types'

export const baseAllTypeBestTradeAtom = atom<QuoteResultForUI>({
  bestOrder: undefined,
  tradeLoaded: false,
  tradeError: undefined,
  refreshDisabled: false,
  refreshOrder: () => {},
  refreshTrade: () => {},
  pauseQuoting: () => {},
  resumeQuoting: () => {},
})

export const pauseAtom = atom(false)

export const userTypingAtom = atom(false)

export const bestTradeUISyncAtom = atom((get) => {
  const state = get(baseAllTypeBestTradeAtom)
  const loading = get(userTypingAtom)
  return {
    ...state,
    tradeLoaded: !loading && state.tradeLoaded,
  }
})
