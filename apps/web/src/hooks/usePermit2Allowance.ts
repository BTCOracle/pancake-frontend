import { getPermit2Address } from '@pancakeswap/permit2-sdk'
import { Currency, Token } from '@pancakeswap/swap-sdk-core'
import { Address } from 'viem'
import { useActiveChainId } from './useActiveChainId'
import { useTokenAllowanceByChainId } from './useTokenAllowance'

export const usePermit2Allowance = (owner?: Address, token?: Currency, overrideChainId?: number) => {
  const { chainId: activeChainId } = useActiveChainId()
  const chainId = overrideChainId ?? activeChainId

  const { allowance, refetch } = useTokenAllowanceByChainId({
    token: token?.isNative ? undefined : (token as Token),
    owner,
    spender: getPermit2Address(chainId),
    chainId,
  })
  return { allowance, refetch }
}
