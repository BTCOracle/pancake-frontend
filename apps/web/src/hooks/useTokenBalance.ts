import { ChainId } from '@pancakeswap/chains'
import { CAKE } from '@pancakeswap/tokens'
import { BIG_ZERO } from '@pancakeswap/utils/bigNumber'
import { useBalance, useReadContract } from '@pancakeswap/wagmi'
import BigNumber from 'bignumber.js'
import { useMemo } from 'react'
import { getVeCakeAddress } from 'utils/addressHelpers'
import { Address, erc20Abi } from 'viem'
import { useAccount } from 'wagmi'
import { useAccountActiveChain } from './useAccountActiveChain'
import { useActiveChainId } from './useActiveChainId'

const useTokenBalance = (tokenAddress: Address, forceBSC?: boolean, targetChainId?: ChainId) => {
  return useTokenBalanceByChain(tokenAddress, forceBSC ? ChainId.BSC : targetChainId)
}

export const useTokenBalanceByChain = (tokenAddress: Address, chainIdOverride?: ChainId) => {
  const { account, chainId } = useAccountActiveChain()
  const { data, status, refetch, ...rest } = useReadContract({
    chainId: chainIdOverride || chainId,
    abi: erc20Abi,
    address: tokenAddress,
    functionName: 'balanceOf',
    args: [account || '0x'],
    query: {
      enabled: !!account,
    },
    watch: true,
  })

  return {
    ...rest,
    refetch,
    fetchStatus: status,
    balance: useMemo(() => (typeof data !== 'undefined' ? new BigNumber(data.toString()) : BIG_ZERO), [data]),
  }
}

export const useGetBnbBalance = () => {
  const { address: account } = useAccount()

  const { status, refetch, data } = useBalance({
    chainId: ChainId.BSC,
    address: account,
    query: {
      enabled: !!account,
    },
    watch: true,
  })

  return { balance: data?.value ? BigInt(data.value) : 0n, fetchStatus: status, refresh: refetch }
}

export const useGetNativeTokenBalance = (chainId?: ChainId) => {
  const { address: account } = useAccount()
  const { chainId: activeChainId } = useActiveChainId()

  const { status, refetch, data } = useBalance({
    chainId: chainId || activeChainId,
    address: account,
    query: {
      enabled: !!account,
    },
    watch: true,
  })

  return { balance: data?.value ? BigInt(data.value) : 0n, fetchStatus: status, refresh: refetch }
}

export const useBSCCakeBalance = () => {
  const { balance, fetchStatus } = useTokenBalance(CAKE[ChainId.BSC]?.address, true)

  return { balance: BigInt(balance.toString()), fetchStatus }
}

// veCake only deploy on bsc/bscTestnet
export const useVeCakeBalance = (targetChainId?: ChainId) => {
  const { chainId } = useActiveChainId()
  const { balance, fetchStatus } = useTokenBalance(getVeCakeAddress(targetChainId ?? chainId), false, targetChainId)

  return { balance, fetchStatus }
}

export default useTokenBalance
