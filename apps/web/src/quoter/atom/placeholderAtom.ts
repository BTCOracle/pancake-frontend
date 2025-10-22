import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import { InterfaceOrder } from 'views/Swap/utils'

export type PlaceholderValue = InterfaceOrder | undefined | Error

export const placeholderAtom = atomFamily((_: string) => {
  return atom<PlaceholderValue>(undefined)
})

export const updatePlaceholderAtom = atom(null, (_get, set, hash: string, order: PlaceholderValue) => {
  set(placeholderAtom(hash), order)
})
