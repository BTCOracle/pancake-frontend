import { InfinityBinPool, InfinityClPool, Route, SmartRouter } from '@pancakeswap/smart-router'
import { useQueries } from '@tanstack/react-query'
import { usePrimusHooks } from 'hooks/infinity/useHooksList'
import { useActiveChainId } from 'hooks/useActiveChainId'
import set from 'lodash/set'
import { useMemo } from 'react'
import { isAddressEqual } from 'utils'
import { publicClient } from 'utils/viem'
import { Address, ContractFunctionParameters } from 'viem'
import { parseAbi } from 'viem/utils'
import { useAccount } from 'wagmi'

export const usePrimusHookDiscount = (pools: Route['pools']) => {
  const { chainId } = useActiveChainId()
  const { address: account } = useAccount()
  const primusHooks = usePrimusHooks(chainId)

  const primusHookPools = useMemo(() => {
    // TODO: bridge pools won't have pools. Need to handle this case
    if (!pools?.length) {
      return []
    }

    return pools.filter((pool) => {
      if (SmartRouter.isInfinityBinPool(pool) || SmartRouter.isInfinityClPool(pool)) {
        if (!pool.hooks) return false
        return primusHooks.find((h) => isAddressEqual(h.address, pool.hooks!.toLowerCase()))
      }
      return false
    }) as Array<InfinityBinPool | InfinityClPool>
  }, [primusHooks, pools])

  const queries = useMemo(() => {
    return primusHookPools.map((pool) => ({
      queryKey: ['primusHookDiscount', pool.id],
      queryFn: () => getPrimusHookDiscountData({ chainId, pool, account }),

      enabled: !!pool && !!chainId,
    }))
  }, [account, chainId, primusHookPools])

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

const getPrimusHookDiscountData = async ({
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
  const abi = parseAbi([
    'function defaultDiscount() public view returns (uint24)',
    'function defaultFee() public view returns (uint24)',
  ])

  // const discountFeeCall = {
  //   address: pool.hooks,
  //   abi,
  //   functionName: 'defaultDiscount',
  // } as const satisfies ContractFunctionParameters

  const defaultFeeCall = {
    address: pool.hooks,
    abi,
    functionName: 'defaultFee',
  } as const satisfies ContractFunctionParameters

  const [
    // discountFee,
    originalFee,
  ] = await client.multicall({
    contracts: [
      // discountFeeCall, // cannot get discount fee from primus hook by user address now
      defaultFeeCall,
    ],
    allowFailure: false,
  })

  return {
    hooks: pool.hooks,
    discountFee: originalFee,
    originalFee,
  }
}
