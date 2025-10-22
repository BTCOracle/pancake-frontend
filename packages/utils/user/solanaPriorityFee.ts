import { atom, useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

const solanaPriorityFeeAtom = atomWithStorage<number | undefined>('solanaPriorityFee', undefined)

export const solanaPriorityFeeAtomWithLocalStorage = atom(
  (get) => get(solanaPriorityFeeAtom),
  (_get, set, fee: number) => {
    if (typeof fee === 'number') {
      set(solanaPriorityFeeAtom, fee)
    }
  },
)

export const useSolanaPriorityFee = () => {
  return useAtom(solanaPriorityFeeAtomWithLocalStorage)
}
