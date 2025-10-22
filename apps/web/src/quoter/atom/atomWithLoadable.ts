import { isLoadable, Loadable } from '@pancakeswap/utils/Loadable'
import { Atom, atom, Getter } from 'jotai'
import { unwrap } from 'jotai/utils'

type AsyncFN<T> = (get: Getter) => Promise<T | Loadable<T> | undefined>
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T
interface LoadableOption<T> {
  isValid?: (result: UnwrapPromise<ReturnType<AsyncFN<T>>>) => boolean
  placeHolderBehavior?: 'pending' | 'stale'
  placeHolderValue?: T
}

export const atomWithLoadable = <T>(
  asyncFn: AsyncFN<T>,
  options: LoadableOption<T> = {
    isValid: undefined,
    placeHolderBehavior: 'pending',
  },
) => {
  const baseAtom = atom(async (get) => {
    try {
      const result = await asyncFn(get)
      if (isLoadable(result)) {
        return result
      }
      if (typeof result === 'undefined' || result === null) {
        return Loadable.Nothing<T>()
      }
      if (options?.isValid && !options.isValid(result)) {
        return Loadable.Nothing<T>()
      }
      return Loadable.Just<T>(result)
    } catch (error: any) {
      return Loadable.Fail<T>(error)
    }
  })
  return unwrap(baseAtom, (prev) => {
    const { placeHolderBehavior, placeHolderValue } = options
    if (placeHolderValue) {
      return Loadable.Pending<T>(placeHolderValue)
    }
    if (placeHolderBehavior === 'stale') {
      if (prev?.isJust()) {
        return Loadable.Pending<T>(prev.unwrap())
      }
    }
    return Loadable.Pending<T>()
  }) as Atom<Loadable<T>>
}
