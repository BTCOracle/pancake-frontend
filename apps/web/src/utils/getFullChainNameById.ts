import { getChainName } from '@pancakeswap/chains'
import memoize from 'lodash/memoize'
import { chainNameConverter } from './chainNameConverter'
import { chains } from './wagmi'

export const getFullChainNameById = memoize((chainId?: number) => {
  return chainId
    ? chainNameConverter(chains.find((item) => item.id === chainId)?.name || getChainName(chainId))
    : 'Unknown Chain'
})
