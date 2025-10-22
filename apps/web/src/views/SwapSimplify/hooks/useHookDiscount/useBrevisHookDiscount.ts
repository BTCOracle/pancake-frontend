import { InfinityBinPool, InfinityClPool, Route, SmartRouter } from '@pancakeswap/smart-router'
import { useQueries } from '@tanstack/react-query'
import { useBrevisHooks } from 'hooks/infinity/useHooksList'
import { useActiveChainId } from 'hooks/useActiveChainId'
import set from 'lodash/set'
import { useMemo } from 'react'
import { isAddressEqual } from 'utils'
import { publicClient } from 'utils/viem'
import { Address, ContractFunctionParameters, zeroAddress } from 'viem'
import { parseAbi } from 'viem/utils'
import { useAccount } from 'wagmi'

export const useBrevisHookDiscount = (pools: Route['pools']) => {
  const { chainId } = useActiveChainId()
  const { address: account } = useAccount()
  const brevisHooks = useBrevisHooks(chainId)

  const brevisHookPools = useMemo(() => {
    if (!pools?.length) {
      return []
    }

    return pools?.filter((pool) => {
      if (SmartRouter.isInfinityBinPool(pool) || SmartRouter.isInfinityClPool(pool)) {
        if (!pool.hooks) return false
        return brevisHooks.find((h) => isAddressEqual(h.address, pool.hooks!.toLowerCase()))
      }
      return false
    }) as Array<InfinityBinPool | InfinityClPool>
  }, [brevisHooks, pools])

  const queries = useMemo(() => {
    return brevisHookPools.map((pool) => ({
      queryKey: ['brevisHookDiscount', pool.id],
      queryFn: () => getBrevisHookDiscountData({ chainId, pool, account }),

      enabled: !!pool && !!chainId,
    }))
  }, [account, chainId, brevisHookPools])

  return useQueries({
    queries,
    combine(result) {
      return result.reduce((acc, item) => {
        if (item.data) {
          set(acc, item.data.hooks, {
            discountFee: item.data.discountFee,
            originalFee: item.data.originalFee,
          })
        }
        return acc
      }, {} as Record<Address, { discountFee: number; originalFee: number }>)
    },
  })
}

const getBrevisHookDiscountData = async ({
  chainId,
  pool,
  account,
}: {
  chainId: number | undefined
  pool: InfinityBinPool | InfinityClPool
  account: Address | undefined
}) => {
  if (!chainId || !pool.hooks) return undefined
  const client = publicClient({ chainId })
  const abi = parseAbi(['function getFee(address) public view returns (uint24)'])

  const userFeeCall = {
    address: pool.hooks,
    abi,
    functionName: 'getFee',
    args: [account ?? zeroAddress],
  } as const satisfies ContractFunctionParameters
  const noDiscountUserCall = {
    address: pool.hooks,
    abi,
    functionName: 'getFee',
    args: [zeroAddress],
  } as const satisfies ContractFunctionParameters

  const [discountFee, originalFee] = await client.multicall({
    contracts: [userFeeCall, noDiscountUserCall],
    allowFailure: false,
  })

  return {
    hooks: pool.hooks,
    discountFee,
    originalFee,
  }
}
