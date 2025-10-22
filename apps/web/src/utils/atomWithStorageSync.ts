import { atom, SetStateAction } from 'jotai'

export function atomWithStorageSync<T>(key: string, initialValue: T) {
  const getInitialValue = (): T => {
    try {
      const storedValue = localStorage.getItem(key)
      return storedValue !== null ? JSON.parse(storedValue) : initialValue
    } catch {
      return initialValue
    }
  }

  const baseAtom = atom<T>(getInitialValue())

  const derivedAtom = atom(
    (get) => get(baseAtom),
    (_get, set, update: SetStateAction<T>) => {
      const nextValue = typeof update === 'function' ? (update as (prev: T) => T)(_get(baseAtom)) : update

      set(baseAtom, nextValue)
      localStorage.setItem(key, JSON.stringify(nextValue))
    },
  )

  return derivedAtom
}
