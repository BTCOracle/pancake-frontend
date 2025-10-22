import { atom } from 'jotai'

export interface ChartPriceData {
  price: number
  priceChangePercent: number
  high24h: number
  low24h: number
}

export const chartPriceDataAtom = atom<ChartPriceData>({
  price: -1,
  priceChangePercent: -1,
  high24h: -1,
  low24h: -1,
})

export type LivePriceData = Record<string, number>

export const livePriceDataAtom = atom<LivePriceData>({})
