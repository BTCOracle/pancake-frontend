import { ChainId, getChainName } from '@pancakeswap/chains'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useDynamicRouteParam } from 'hooks/useDynamicRouteParam'
import useNativeCurrency from 'hooks/useNativeCurrency'
import { useParamChainId } from 'hooks/useParamChainId'
import { useRouter } from 'next/router'
import { useEffect, useMemo } from 'react'

export const useIncreaseLiquidityUrlParams = () => {
  const router = useRouter()

  const [chainId, setChainId] = useParamChainId('currency', 0)
  const { chainId: activeChainId } = useActiveChainId()

  const native = useNativeCurrency(chainId)

  const [protocol, setProtocol] = useDynamicRouteParam('currency', 1)
  const [poolId, setPoolId] = useDynamicRouteParam('currency', 2)
  const [positionId, setPositionId] = useDynamicRouteParam('currency', 3)

  // If no params in URL, show default values for user's active chain
  const defaultUrlParams = useMemo(
    () => activeChainId && [getChainName(activeChainId), 'infinity', '0x00', '0x00'],
    [activeChainId],
  )

  // TODO: should redirect or show Not Found if no poolId or positionId
  /**
   * Set default values for required params in the URL if not there
   */
  useEffect(() => {
    if (router.isReady) {
      if (!router.query.currency && defaultUrlParams) {
        router.replace({
          query: {
            ...router.query,
            currency: defaultUrlParams,
          },
        })
        return
      }

      if (!chainId) {
        setChainId(activeChainId ?? ChainId.BSC)
      }
      if (!protocol) {
        setProtocol('infinity')
      }
      //   if (!poolId) {
      //     setPoolId()
      //   }
      //   if (!positionId) {
      //     setPositionId()
      //   }
    }
  }, [router, chainId, native.symbol, defaultUrlParams, protocol, setProtocol, activeChainId, setChainId])

  return {
    chainId,
    protocol,
    poolId,
    positionId,
    setChainId,
    setProtocol,
    setPoolId,
    setPositionId,
  }
}
