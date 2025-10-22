import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import { IfoInfo, PoolInfo, IFOUserStatus } from '../ifov2.types'

export const ifoInfoAtom = atomFamily((id: string) => {
  return atom<IfoInfo | undefined>(undefined)
})

export const ifoPoolsAtom = atomFamily((id: string) => {
  return atom<PoolInfo[] | undefined>(undefined)
})

export const ifoUsersAtom = atomFamily((id: string) => {
  return atom<(IFOUserStatus | undefined)[] | undefined>(undefined)
})
