import { useContext } from 'react'
import { IfoV2Context } from './IfoV2Context'

export const useIfoV2Context = () => {
  const ctx = useContext(IfoV2Context)
  if (!ctx) {
    throw new Error('useIfoV2Context must be used within an IfoV2Provider')
  }
  return ctx
}
