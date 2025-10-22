import { atom, useAtom } from 'jotai'

export const flipCurrentPriceAtom = atom(false)

export const useFlipCurrentPrice = () => {
  return useAtom(flipCurrentPriceAtom)
}
