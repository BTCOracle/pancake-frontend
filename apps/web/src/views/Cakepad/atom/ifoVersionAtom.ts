import { atom } from 'jotai'

export const ifoVersionAtom = atom(0)

export const updateIfoVer = atom(null, (_, set) => {
  set(ifoVersionAtom, (x) => x + 1)
})
