import { bCakeFarmBoosterVeCakeABI } from '@pancakeswap/farms/constants/v3/abi/bCakeFarmBoosterVeCake'
import BN from 'bignumber.js'
import _toNumber from 'lodash/toNumber'
import { publicClient } from 'utils/wagmi'

export const PRECISION_FACTOR = new BN('1000000000000') // 1e12

export async function getUserMultiplier({ address, tokenId, chainId }): Promise<number> {
  const [multiplierResult, boostPrecisionResult] = await publicClient({ chainId }).multicall({
    contracts: [
      {
        address,
        functionName: 'getUserMultiplier',
        abi: bCakeFarmBoosterVeCakeABI,
        args: [tokenId],
      },
      {
        address,
        abi: bCakeFarmBoosterVeCakeABI,
        functionName: 'BOOST_PRECISION',
      },
    ],
  })

  if (!multiplierResult.result || !boostPrecisionResult.result) return 0

  const [multiplier, BOOST_PRECISION] = [multiplierResult.result, boostPrecisionResult.result]
  return _toNumber(
    PRECISION_FACTOR.plus(new BN(multiplier.toString()))
      .minus(new BN(BOOST_PRECISION.toString()))
      .div(PRECISION_FACTOR)
      .toString(),
  )
}
