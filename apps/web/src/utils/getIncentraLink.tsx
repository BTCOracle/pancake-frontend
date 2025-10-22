import { ChainId } from '@pancakeswap/chains'
import memoize from 'lodash/memoize'
import { Address } from 'viem'

export const getIncentraLink = memoize(
  ({
    hasIncentra,
    chainId,
    lpAddress,
  }: {
    hasIncentra: boolean
    chainId?: ChainId | number
    lpAddress?: Address
  }): string | undefined => {
    if (!chainId || !lpAddress || !hasIncentra) return undefined

    return `https://incentra.brevis.network/campaign/?pool_id=${lpAddress.toLowerCase()}&type=3&chainId=${chainId}`
  },
  ({ hasIncentra, chainId, lpAddress }) => `${hasIncentra}:${chainId}:${lpAddress?.toLowerCase()}`,
)

export const INCENTRA_USER_LINK = 'https://incentra.brevis.network/dashboard/'
