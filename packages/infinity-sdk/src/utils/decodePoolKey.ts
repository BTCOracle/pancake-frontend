import { EncodedPoolKey, PoolKey } from '../types'
import { decodeBinPoolParameters, decodeCLPoolParameters } from './decodePoolParameters'

export const decodePoolKey = (encodedPoolKey: EncodedPoolKey, poolType: 'CL' | 'Bin'): PoolKey<typeof poolType> => {
  const { currency0, currency1, hooks, fee, parameters, poolManager } = encodedPoolKey
  if (poolType === 'CL') {
    const { tickSpacing, hooksRegistration } = decodeCLPoolParameters(parameters)
    return {
      currency0,
      currency1,
      hooks,
      fee,
      poolManager,
      parameters: {
        tickSpacing,
        hooksRegistration,
      },
    } as PoolKey<'CL'>
  }
  const { binStep, hooksRegistration } = decodeBinPoolParameters(parameters)
  return {
    currency0,
    currency1,
    hooks,
    fee,
    poolManager,
    parameters: {
      binStep,
      hooksRegistration,
    },
  } as PoolKey<'Bin'>
}
