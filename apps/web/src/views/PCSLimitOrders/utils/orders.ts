import { BigintIsh } from '@pancakeswap/swap-sdk-core'
import { useCLLimitOrderHookContract } from 'hooks/useContract'
import { Address } from 'viem/accounts'
import { publicClient } from 'utils/viem'
import { ContractFunctionArgs, ContractFunctionName } from 'viem'

export const simulateLimitOrderContract = (
  contract: ReturnType<typeof useCLLimitOrderHookContract>,
  functionName: ContractFunctionName<typeof contract.abi, 'nonpayable' | 'payable'>,
  args: ContractFunctionArgs<
    typeof contract.abi,
    'nonpayable' | 'payable',
    ContractFunctionName<typeof contract.abi, 'nonpayable' | 'payable'>
  >,
  account: Address,
) => {
  return publicClient({ chainId: contract.chain?.id }).simulateContract({
    address: contract.address,
    abi: contract.abi,
    functionName,
    args,
    account,
    chain: contract.chain,
  })
}
