import { DYNAMIC_FEE_FLAG, getPoolId, HOOK_CATEGORY, hooksList } from '@pancakeswap/infinity-sdk'
import { Token } from '@pancakeswap/sdk'
import { getTokensByChain } from '@pancakeswap/tokens'
import { FeeAmount } from '@pancakeswap/v3-sdk'
import uniq from 'lodash/uniq'
import { getPoolManagerAddress } from 'utils/addressHelpers'
import { publicClient } from 'utils/viem'
import { zeroAddress, type Address, type Hex } from 'viem'
import { InfinityBinPositionDetail } from '../../type'
import { getAccountInfinityBinPositionByPoolId } from './getAccountInfinityBinPositionByPoolId'

const PRESETS = {
  fee: [FeeAmount.LOWEST, FeeAmount.LOW, FeeAmount.MEDIUM, FeeAmount.HIGH],
  binStep: [1, 10, 25, 50, 100],
}

const getInfinityBinPresetPoolIds = (chainId: number, presetTokenAddresses: Address[]) => {
  const poolIds: Hex[] = []
  const currency0 = zeroAddress

  for (const currency1 of presetTokenAddresses) {
    if (currency0 === currency1) continue
    const [c0, c1] = currency0.toLowerCase() > currency1.toLowerCase() ? [currency1, currency0] : [currency0, currency1]
    for (const fee of PRESETS.fee) {
      for (const binStep of PRESETS.binStep) {
        const poolId = getPoolId({
          currency0: c0,
          currency1: c1,
          fee,
          poolManager: getPoolManagerAddress('Bin', chainId),
          parameters: {
            binStep,
          },
        })
        poolIds.push(poolId)
        if (hooksList[chainId]?.length) {
          for (const hook of hooksList[chainId]) {
            const poolIdWithHook = getPoolId({
              currency0: c0,
              currency1: c1,
              fee: hook.category.includes(HOOK_CATEGORY.DynamicFees) ? DYNAMIC_FEE_FLAG : fee,
              poolManager: getPoolManagerAddress('Bin', chainId),
              hooks: hook.address,
              parameters: {
                binStep,
                hooksRegistration: hook.hooksRegistration,
              },
            })
            poolIds.push(poolIdWithHook)
          }
        }
      }
    }
  }

  return uniq(poolIds)
}

export const getAccountInfinityBinPositionsOnChain = async ({
  chainId,
  account,
  userAddedTokens,
}: {
  chainId: number
  account: Address
  userAddedTokens: Token[]
}): Promise<InfinityBinPositionDetail[]> => {
  const client = publicClient({ chainId })
  const binPoolManager = getPoolManagerAddress('Bin', chainId)
  if (!client || !account || !binPoolManager) {
    return []
  }
  const userAddedTokensAddresses = userAddedTokens.map((token) => token.address)
  const presetTokens = getTokensByChain(chainId)

  const tokensAddresses = uniq([...userAddedTokensAddresses, ...presetTokens.map((token) => token.address)])

  const binPoolIds = getInfinityBinPresetPoolIds(chainId, tokensAddresses)
  console.info('chainId', chainId, 'binPoolIds', binPoolIds.length)
  const positions = await Promise.all(
    binPoolIds.map((poolId) => getAccountInfinityBinPositionByPoolId({ chainId, account, poolId })),
  )

  if (!positions || positions.length === 0) return []

  return positions.filter((position) => position !== undefined) as InfinityBinPositionDetail[]
}
