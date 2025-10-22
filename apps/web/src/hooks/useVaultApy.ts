import { useCallback } from 'react'

export function useVaultApy() {
  return { lockedApy: '0', getLockedApy: useCallback((_: number) => '', []) }
}
