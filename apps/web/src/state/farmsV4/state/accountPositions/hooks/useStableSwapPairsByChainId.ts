import { ChainId } from '@pancakeswap/chains'
import { LegacyRouter } from '@pancakeswap/smart-router/legacy-router'
import { useAtomValue } from 'jotai'
import { atomFamily, loadable } from 'jotai/utils'
import { useMemo } from 'react'

import { atomWithAsyncRetry } from 'utils/atomWithAsyncRetry'

export const stableSwapPairsByChainIdAtom = atomFamily(
  ({ chainId, enabled = true }: { chainId?: ChainId; enabled?: boolean }) =>
    atomWithAsyncRetry({
      asyncFn: async () => {
        if (!chainId || !enabled) {
          return []
        }
        return LegacyRouter.getStableSwapPairs(chainId)
      },
      errorReportKey: 'stable-swap-config',
    }),
)

export const useStableSwapPairsByChainId = (chainId: ChainId, enabled = true) => {
  const loadableAtom = useMemo(() => loadable(stableSwapPairsByChainIdAtom({ chainId, enabled })), [chainId, enabled])
  const result = useAtomValue(loadableAtom)

  return useMemo(() => (result.state === 'hasData' ? result.data ?? [] : []), [result])
}
