import { Loadable } from '@pancakeswap/utils/Loadable'
import { InterfaceOrder } from 'views/Swap/utils'
import { type PlaceholderValue } from '../atom/placeholderAtom'

interface HandlePlaceholderParams<T> {
  result: Loadable<T>
  placeholder: PlaceholderValue
  placeholderHash: string | undefined
}

export function handlePlaceholderForPendingResult<T>({
  result,
  placeholder,
  placeholderHash,
}: HandlePlaceholderParams<T>): Loadable<T> {
  if (!result.isPending() || !placeholder) {
    throw new Error('to call handlePlaceholderForPendingResult, result must be pending and placeholder must exist')
  }

  // Function assumes result.isPending() is true and placeholder exists
  // Only handles the placeholder transformation logic
  const loadable = placeholder instanceof Error ? Loadable.Fail<T>(placeholder) : Loadable.Just<T>(placeholder as T)

  return loadable.setFlag('placeholder').setExtra('placeholderHash', placeholderHash)
}
