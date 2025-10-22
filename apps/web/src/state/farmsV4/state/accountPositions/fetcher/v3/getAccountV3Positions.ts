import { Protocol } from '@pancakeswap/farms'
import { NFT_POSITION_MANAGER_ADDRESSES, nonfungiblePositionManagerABI } from '@pancakeswap/v3-sdk'
import BigNumber from 'bignumber.js'
import { getMasterChefV3Contract } from 'utils/contractHelpers'
import { publicClient } from 'utils/viem'
import { Address, isAddress } from 'viem'
import { zksync } from 'viem/chains'
import { PositionDetail } from '../../type'
import { getAccountV3TokenIds } from './getAccountV3TokenIds'

export const readPositions = async (chainId: number, tokenIds: bigint[]): Promise<PositionDetail[]> => {
  const nftPositionManagerAddress = NFT_POSITION_MANAGER_ADDRESSES[chainId]
  const client = publicClient({ chainId })
  const masterChefV3 = getMasterChefV3Contract(undefined, chainId)

  if (!client || !nftPositionManagerAddress || !tokenIds.length) {
    return []
  }

  const positionCalls = tokenIds.map((tokenId) => {
    return {
      abi: nonfungiblePositionManagerABI,
      address: nftPositionManagerAddress,
      functionName: 'positions',
      args: [tokenId] as const,
    } as const
  })
  const farmingCalls =
    masterChefV3 && isAddress(masterChefV3.address)
      ? tokenIds.map((tokenId) => {
          return {
            abi: masterChefV3.abi,
            address: masterChefV3.address,
            functionName: 'userPositionInfos',
            args: [tokenId] as const,
          } as const
        })
      : []
  const batchSize = chainId === zksync.id ? 1024 * 10 : undefined
  const [positions, farmingPosition] = await Promise.all([
    client.multicall({
      contracts: positionCalls,
      allowFailure: false,
      batchSize,
    }),
    masterChefV3 && isAddress(masterChefV3.address)
      ? client.multicall({
          contracts: farmingCalls,
          allowFailure: false,
          batchSize,
        })
      : [],
  ])

  return positions.map((position, index) => {
    const [
      nonce,
      operator,
      token0,
      token1,
      fee,
      tickLower,
      tickUpper,
      liquidity,
      feeGrowthInside0LastX128,
      feeGrowthInside1LastX128,
      tokensOwed0,
      tokensOwed1,
    ] = position
    const farmingLiquidity = farmingPosition?.[index]?.[0] ?? 0n
    const boostMultiplier = farmingPosition?.[index]?.[8] ?? 0n
    return {
      tokenId: tokenIds[index],
      nonce,
      operator,
      token0,
      token1,
      fee,
      tickLower,
      tickUpper,
      liquidity,
      feeGrowthInside0LastX128,
      feeGrowthInside1LastX128,
      tokensOwed0,
      tokensOwed1,
      chainId,
      protocol: Protocol.V3,
      farmingMultiplier: new BigNumber(Number(boostMultiplier)).div(1e12).toNumber() ?? 0,
      farmingLiquidity,
      isStaked: farmingLiquidity > 0n,
    } satisfies PositionDetail
  })
}

export const getAccountV3Positions = async (chainId: number, account: Address): Promise<PositionDetail[]> => {
  const { farmingTokenIds, nonFarmTokenIds } = await getAccountV3TokenIds(chainId, account)

  const positions = await readPositions(chainId, farmingTokenIds.concat(nonFarmTokenIds))

  const farmingTokenIdsLength = farmingTokenIds.length
  positions.forEach((_, index) => {
    positions[index].isStaked = index < farmingTokenIdsLength
  })

  return positions
}
