import { Address, encodeFunctionData } from 'viem'
import { FARMING_OFFCHAIN_ABI } from '../../../abis/FarmingOffChainAbi'

interface ClaimParams {
  token: Address
  amount: bigint
  proof: Address[]
}
export const encodeClaimCalldata = (claimParams: ClaimParams[]) => {
  return encodeFunctionData({
    abi: FARMING_OFFCHAIN_ABI,
    functionName: 'claim',
    args: [claimParams],
  })
}
