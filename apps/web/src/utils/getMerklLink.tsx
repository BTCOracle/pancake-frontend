import { Protocol } from '@pancakeswap/farms'
import memoize from 'lodash/memoize'
import { useMemo } from 'react'
import { useAccount } from 'wagmi'
import { safeGetAddress } from './safeGetAddress'

const chainIdToChainName = {
  1: 'ethereum',
  56: 'bsc',
  324: 'zksync',
  8453: 'base',
  42161: 'arbitrum',
  59144: 'linea',
} as const

export const getMerklLink = memoize(
  ({
    hasMerkl,
    chainId,
    lpAddress,
    poolProtocol,
  }: {
    hasMerkl: boolean
    chainId?: number
    lpAddress?: string
    poolProtocol?: Protocol
  }): string | undefined => {
    if (!chainId || !lpAddress || !poolProtocol || !hasMerkl) return undefined

    const chain = chainIdToChainName[chainId]
    if (!chain) return undefined

    const protoPath = poolProtocol === Protocol.V2 || poolProtocol === Protocol.STABLE ? 'ERC20' : 'CLAMM'

    return `https://app.merkl.xyz/opportunities/${chain}/${protoPath}/${safeGetAddress(lpAddress)}`
  },
  ({ hasMerkl, chainId, lpAddress, poolProtocol }) =>
    `${hasMerkl}:${chainId}:${poolProtocol}:${lpAddress?.toLowerCase()}`,
)
export const useMerklUserLink = (): string => {
  const { address: account } = useAccount()
  const link = useMemo(() => {
    return `https://app.merkl.xyz/users/${account ?? ''}`
  }, [account])
  return link
}
