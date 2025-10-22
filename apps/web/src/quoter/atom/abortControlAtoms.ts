import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import isEqual from 'lodash/isEqual'
import { createViemPublicClientGetter } from 'utils/viem'

export const activeQuoteHashAtom = atom('')

export const abortControllerAtom = atomFamily((hash: string) => {
  return atom(new AbortController())
})

export const abortSignalAtom = atom(null, (get, _, hash: string) => {
  const controller = get(abortControllerAtom(hash))
  controller.abort()
})

export const abortableViemProviderAtom = atomFamily((hash: string) => {
  return atom((get) => {
    const controller = get(abortControllerAtom(hash))
    const provider = createViemPublicClientGetter({
      transportSignal: controller.signal,
    })
    return provider
  })
}, isEqual)
