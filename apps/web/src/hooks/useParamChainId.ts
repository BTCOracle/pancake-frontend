import { ChainId, getChainName } from '@pancakeswap/chains'
import { getChainId } from 'config/chains'
import { useRouter } from 'next/router'
import { useCallback, useMemo } from 'react'
import { isChainSupported } from 'utils/wagmi'

/**
 * Use chain from multiple route params
 * @param paramName Dynamic route's parameter name (eg. slug, currency, etc.). Default is 'currency'
 * @param chainIndex Index of chain in dynamic params. Default is 0
 */
export const useParamChainId = (paramName: string = 'currency', chainIndex: number = 0) => {
  const router = useRouter()

  const chainId = useMemo(() => {
    const chain = router.query[paramName]?.[chainIndex].trim() ?? getChainName[ChainId.BSC]
    const derivedChainId = !Number.isNaN(+chain) ? +chain : getChainId(chain)
    return derivedChainId ? (isChainSupported(derivedChainId) ? derivedChainId : ChainId.BSC) : undefined
  }, [router.query, paramName, chainIndex])

  const updateChainId = useCallback(
    (newChainId: ChainId) => {
      const newChain = getChainName(newChainId) || getChainName(ChainId.BSC)

      const newQueryParams = (router.query?.[paramName] as string[]).slice()
      while (newQueryParams.length < chainIndex) {
        newQueryParams.push('')
      }
      newQueryParams[chainIndex] = newChain

      router.replace(
        {
          query: {
            ...router.query,
            [paramName]: newQueryParams,
          },
        },
        undefined,
        { shallow: true },
      )
    },
    [router, paramName, chainIndex],
  )

  return [chainId, updateChainId] as const
}
