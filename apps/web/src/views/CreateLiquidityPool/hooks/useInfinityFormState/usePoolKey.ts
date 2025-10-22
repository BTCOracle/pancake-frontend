import { DYNAMIC_FEE_FLAG, PoolKey } from '@pancakeswap/infinity-sdk'
import { useSelectIdRouteParams } from 'hooks/dynamicRoute/useSelectIdRoute'
import { useLPFeeFromTotalFee } from 'hooks/infinity/useLPFeeFromTotalFee'
import { useMemo } from 'react'
import { getPoolManagerAddress } from 'utils/addressHelpers'
import { zeroAddress } from 'viem'
import { useSelectedHook } from 'views/HookSettings/hooks/useSelectedHook'

import { useCurrencies } from '../useCurrencies'
import {
  useInfinityBinQueryState,
  useInfinityCLQueryState,
  useInfinityCreateFormQueryState,
} from './useInfinityFormQueryState'

export const usePoolKey = (): PoolKey | undefined => {
  const { currency0, currency1 } = useCurrencies()
  const { chainId } = useSelectIdRouteParams()
  const { poolType, feeTierSetting, feeLevel } = useInfinityCreateFormQueryState()
  const { tickSpacing } = useInfinityCLQueryState()
  const { binStep } = useInfinityBinQueryState()
  const selectedHook = useSelectedHook()

  const { data: lpFee } = useLPFeeFromTotalFee(chainId, poolType, feeLevel)

  return useMemo(() => {
    if (!currency0 || !currency1) return undefined
    // Only build PoolKey for EVM currencies with hex addresses
    const addr0 = currency0.isNative ? zeroAddress : currency0.wrapped.address
    const addr1 = currency1.wrapped.address
    if (!addr0.startsWith('0x') || !addr1.startsWith('0x')) return undefined

    const commonPoolKey = {
      currency0: addr0 as `0x${string}`,
      currency1: addr1 as `0x${string}`,
      hooks: selectedHook?.address ?? zeroAddress,
      poolManager: getPoolManagerAddress(poolType, chainId) ?? '0x',
      fee: feeTierSetting === 'static' ? parseFloat(Number(lpFee ?? 0).toFixed(0)) : DYNAMIC_FEE_FLAG,
    } satisfies Omit<PoolKey, 'parameters'>

    if (poolType === 'CL') {
      return {
        ...commonPoolKey,
        parameters: {
          tickSpacing: Number(tickSpacing),
          hooksRegistration: selectedHook?.hooksRegistration,
        },
      } satisfies PoolKey<'CL'>
    }

    return {
      ...commonPoolKey,
      parameters: {
        binStep: Number(binStep),
        hooksRegistration: selectedHook?.hooksRegistration,
      },
    } satisfies PoolKey<'Bin'>
  }, [
    binStep,
    chainId,
    currency0,
    currency1,
    lpFee,
    feeTierSetting,
    poolType,
    selectedHook?.address,
    selectedHook?.hooksRegistration,
    tickSpacing,
  ])
}
