import { useAtomValue } from 'jotai'
import { bestTradeUISyncAtom } from 'quoter/atom/bestTradeUISyncAtom'

export const useAllTypeBestTrade = () => {
  return useAtomValue(bestTradeUISyncAtom)
}
