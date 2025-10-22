import { type HookData } from '@pancakeswap/infinity-sdk'
import { useSelectIdRouteParams } from 'hooks/dynamicRoute/useSelectIdRoute'
import { useHookByAddress } from 'hooks/infinity/useHooksList'
import { useCallback } from 'react'
import { useHookAddressQueryState } from 'state/infinity/create'

export type HookChangeCb = (hookData?: HookData) => void

// hook from list select hook
export const useSelectHookFromList = (onHookChange?: HookChangeCb) => {
  const { chainId } = useSelectIdRouteParams()
  const [hookAddress, setHookAddress] = useHookAddressQueryState()

  const setHook = useCallback(
    (hookData: HookData | undefined) => {
      setHookAddress(hookData?.address ?? null)
      onHookChange?.(hookData)
    },
    [setHookAddress, onHookChange],
  )

  const hook = useHookByAddress(chainId, hookAddress ?? undefined)

  return [hook, setHook] as const
}
