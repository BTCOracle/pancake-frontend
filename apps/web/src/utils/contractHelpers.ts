import { ChainId } from '@pancakeswap/chains'
import { BinPositionManagerAbi, CLPositionManagerAbi } from '@pancakeswap/infinity-sdk'
import { CAKE } from '@pancakeswap/tokens'

// Addresses
import {
  getAffiliateProgramAddress,
  getAnniversaryAchievementAddress,
  getBCakeFarmBoosterAddress,
  getBCakeFarmBoosterVeCakeAddress,
  getBunnyFactoryAddress,
  getCakeFlexibleSideVaultAddress,
  getCakePoolAddress,
  getCakeVaultAddress,
  getCakeVaultV1Address,
  getClLimitOrderHookAddress,
  getCrossFarmingReceiverAddress,
  getCrossFarmingSenderAddress,
  getCrossFarmingVaultAddress,
  getFixedStakingAddress,
  getInfinityPositionManagerAddress,
  getLotteryV2Address,
  getMasterChefV2Address,
  getMasterChefV3Address,
  getNftMarketAddress,
  getNftSaleAddress,
  getPancakeProfileAddress,
  getPancakeSquadAddress,
  getPancakeVeSenderV2Address,
  getPointCenterIfoAddress,
  getPredictionsV1Address,
  getRevenueSharingCakePoolAddress,
  getRevenueSharingPoolAddress,
  getRevenueSharingPoolGatewayAddress,
  getRevenueSharingVeCakeAddress,
  getStableSwapNativeHelperAddress,
  getTradingCompetitionAddressEaster,
  getTradingCompetitionAddressFanToken,
  getTradingCompetitionAddressMoD,
  getTradingCompetitionAddressMobox,
  getV3AirdropAddress,
  getV3MigratorAddress,
  getVCakeAddress,
  getVeCakeAddress,
  getZkSyncAirDropAddress,
} from 'utils/addressHelpers'

// ABI
import {
  PredictionContractVersion,
  predictionsV1ABI,
  predictionsV21ABI,
  predictionsV2ABI,
  predictionsV3ABI,
} from '@pancakeswap/prediction'
import { crossFarmingProxyABI } from 'config/abi/crossFarmingProxy'
import { crossFarmingSenderABI } from 'config/abi/crossFarmingSender'
import { crossFarmingVaultABI } from 'config/abi/crossFarmingVault'
import { nftSaleABI } from 'config/abi/nftSale'
import { pointCenterIfoABI } from 'config/abi/pointCenterIfo'
import { stableSwapNativeHelperABI } from 'config/abi/stableSwapNativeHelper'

import { bCakeFarmBoosterVeCakeABI } from '@pancakeswap/farms/constants/v3/abi/bCakeFarmBoosterVeCake'
import { getIfoCreditAddressContract as getIfoCreditAddressContract_ } from '@pancakeswap/ifos'
import { cakeFlexibleSideVaultV2ABI, cakeVaultV1ABI, cakeVaultV2ABI } from '@pancakeswap/pools'
import { masterChefV3ABI } from '@pancakeswap/v3-sdk'
import { sidABI } from 'config/abi/SID'
import { SIDResolverABI } from 'config/abi/SIDResolver'
import { affiliateProgramABI } from 'config/abi/affiliateProgram'
import { anniversaryAchievementABI } from 'config/abi/anniversaryAchievement'
import { bCakeFarmBoosterABI } from 'config/abi/bCakeFarmBooster'
import { bCakeProxyABI } from 'config/abi/bCakeProxy'
import { bunnyFactoryABI } from 'config/abi/bunnyFactory'
import { cakePoolAbi } from 'config/abi/cakePool'
import { chainlinkOracleABI } from 'config/abi/chainlinkOracle'
import { crossFarmingReceiverABI } from 'config/abi/crossFarmingReceiver'
import { fixedStakingABI } from 'config/abi/fixedStaking'
import { lotteryV2ABI } from 'config/abi/lotteryV2'
import { masterChefV2ABI } from 'config/abi/masterchefV2'
import { nftMarketABI } from 'config/abi/nftMarket'
import { pancakeProfileABI } from 'config/abi/pancakeProfile'
import { pancakeSquadABI } from 'config/abi/pancakeSquad'
import { pancakeVeSenderV2ABI } from 'config/abi/pancakeVeSenderV2ABI'
import { revenueSharingPoolABI } from 'config/abi/revenueSharingPool'
import { revenueSharingPoolGatewayABI } from 'config/abi/revenueSharingPoolGateway'
import { revenueSharingPoolProxyABI } from 'config/abi/revenueSharingPoolProxy'
import { tradingCompetitionEasterABI } from 'config/abi/tradingCompetitionEaster'
import { tradingCompetitionFanTokenABI } from 'config/abi/tradingCompetitionFanToken'
import { tradingCompetitionMoDABI } from 'config/abi/tradingCompetitionMoD'
import { tradingCompetitionMoboxABI } from 'config/abi/tradingCompetitionMobox'
import { v2BCakeWrapperABI } from 'config/abi/v2BCakeWrapper'
import { v3AirdropABI } from 'config/abi/v3Airdrop'
import { v3MigratorABI } from 'config/abi/v3Migrator'
import { vCakeABI } from 'config/abi/vCake'
import { veCakeABI } from 'config/abi/veCake'
import { zkSyncAirDropABI } from 'config/abi/zksyncAirdrop'
import { getViemClients, viemClients } from 'utils/viem'
import {
  Abi,
  Address,
  GetContractReturnType,
  PublicClient,
  WalletClient,
  erc20Abi,
  erc721Abi,
  getContract as viemGetContract,
} from 'viem'
import { clLimitOrderHookABI } from 'config/abi/CLLimitOrderHook'

export type GetContractFn<TAbi extends Abi | readonly unknown[], TWalletClient extends WalletClient> = (
  ...args: any[]
) => ReturnType<typeof getContract<TAbi, TWalletClient>>

export const getContract = <TAbi extends Abi | readonly unknown[], TWalletClient extends WalletClient>({
  abi,
  address,
  chainId = ChainId.BSC,
  publicClient,
  signer,
}: {
  abi: TAbi | readonly unknown[]
  address: Address
  chainId?: ChainId
  signer?: TWalletClient
  publicClient?: PublicClient
}) => {
  const c = viemGetContract({
    abi,
    address,
    client: {
      public: publicClient ?? viemClients[chainId],
      wallet: signer,
    },
  }) as unknown as GetContractReturnType<TAbi, PublicClient, Address>

  return {
    ...c,
    account: signer?.account,
    chain: signer?.chain,
  }
}

export const getBep20Contract = (address: Address, signer?: WalletClient) => {
  return getContract({ abi: erc20Abi, address, signer })
}

export const getErc721Contract = (address: Address, walletClient?: WalletClient) => {
  return getContract({
    abi: erc721Abi,
    address,
    signer: walletClient,
  })
}

export const getPointCenterIfoContract = (signer?: WalletClient) => {
  return getContract({ abi: pointCenterIfoABI, address: getPointCenterIfoAddress(), signer })
}

export const getCakeContract = (chainId?: number) => {
  return getContract({
    abi: erc20Abi,
    address: chainId ? CAKE[chainId]?.address : CAKE[ChainId.BSC].address,
    chainId,
  })
}

export const getProfileContract = (signer?: WalletClient) => {
  return getContract({ abi: pancakeProfileABI, address: getPancakeProfileAddress(), signer })
}

export const getBunnyFactoryContract = (signer?: WalletClient) => {
  return getContract({ abi: bunnyFactoryABI, address: getBunnyFactoryAddress(), signer })
}

export const getLotteryV2Contract = (signer?: WalletClient) => {
  return getContract({ abi: lotteryV2ABI, address: getLotteryV2Address(), signer })
}

export const getTradingCompetitionContractEaster = (signer?: WalletClient) => {
  return getContract({
    abi: tradingCompetitionEasterABI,
    address: getTradingCompetitionAddressEaster(),
    signer,
  })
}

export const getTradingCompetitionContractFanToken = (signer?: WalletClient) => {
  return getContract({
    abi: tradingCompetitionFanTokenABI,
    address: getTradingCompetitionAddressFanToken(),
    signer,
  })
}
export const getTradingCompetitionContractMobox = (signer?: WalletClient) => {
  return getContract({
    abi: tradingCompetitionMoboxABI,
    address: getTradingCompetitionAddressMobox(),
    signer,
  })
}

export const getTradingCompetitionContractMoD = (signer?: WalletClient) => {
  return getContract({
    abi: tradingCompetitionMoDABI,
    address: getTradingCompetitionAddressMoD(),
    signer,
  })
}

export const getCakeVaultV2Contract = (signer?: WalletClient, chainId?: number) => {
  return getContract({ abi: cakeVaultV2ABI, address: getCakeVaultAddress(chainId), signer, chainId })
}

export const getCakeVaultV1Contract = (signer?: WalletClient, chainId?: number) => {
  return getContract({ abi: cakeVaultV1ABI, address: getCakeVaultV1Address(chainId), signer, chainId })
}

export const getCakeFlexibleSideVaultV2Contract = (signer?: WalletClient, chainId?: number) => {
  return getContract({
    abi: cakeFlexibleSideVaultV2ABI,
    address: getCakeFlexibleSideVaultAddress(chainId),
    signer,
    chainId,
  })
}

export const getPredictionsV3Contract = (address: Address, chainId?: number, signer?: WalletClient) => {
  return getContract({ abi: predictionsV3ABI, address, signer, chainId })
}

export const getPredictionsV2Contract = (address: Address, chainId?: number, signer?: WalletClient) => {
  return getContract({ abi: predictionsV2ABI, address, signer, chainId })
}

export const getPredictionsV21Contract = (address: Address, chainId?: number, signer?: WalletClient) => {
  return getContract({ abi: predictionsV21ABI, address, signer, chainId })
}

export const getPredictionsV1Contract = (signer?: WalletClient) => {
  return getContract({ abi: predictionsV1ABI, address: getPredictionsV1Address(), signer })
}

export const getPredictionsContract = (
  version: PredictionContractVersion,
  address: Address,
  chainId: number,
  signer?: WalletClient,
) => {
  if (version === PredictionContractVersion.V2) {
    return getPredictionsV2Contract(address, chainId, signer)
  }
  if (version === PredictionContractVersion.V2_1) {
    return getPredictionsV21Contract(address, chainId, signer)
  }
  if (version === PredictionContractVersion.V3) {
    return getPredictionsV3Contract(address, chainId, signer)
  }
  if (version === PredictionContractVersion.V1) {
    return getPredictionsV1Contract(signer)
  }

  return null
}

export const getChainlinkOracleContract = (address: Address, signer?: WalletClient, chainId?: number) => {
  return getContract({ abi: chainlinkOracleABI, address, signer, chainId })
}

export const getNftMarketContract = (signer?: WalletClient) => {
  return getContract({ abi: nftMarketABI, address: getNftMarketAddress(), signer })
}
export const getNftSaleContract = (signer?: WalletClient) => {
  return getContract({ abi: nftSaleABI, address: getNftSaleAddress(), signer })
}
export const getPancakeSquadContract = (signer?: WalletClient) => {
  return getContract({ abi: pancakeSquadABI, address: getPancakeSquadAddress(), signer })
}

export const getIfoCreditAddressContract = (signer?: WalletClient) => {
  return getIfoCreditAddressContract_(ChainId.BSC, getViemClients, signer)
}

export const getBCakeFarmBoosterContract = (signer?: WalletClient) => {
  return getContract({ abi: bCakeFarmBoosterABI, address: getBCakeFarmBoosterAddress(), signer })
}

export const getBCakeFarmBoosterVeCakeContract = (signer?: WalletClient, chainId?: number) => {
  return getContract({
    abi: bCakeFarmBoosterVeCakeABI,
    address: getBCakeFarmBoosterVeCakeAddress(chainId),
    signer,
    chainId,
  })
}

export const getZksyncAirDropContract = (signer?: WalletClient, chainId?: number) => {
  return getContract({
    abi: zkSyncAirDropABI,
    address: getZkSyncAirDropAddress(chainId),
    signer,
    chainId,
  })
}

export const getInfinityCLPositionManagerContract = (signer?: WalletClient, chainId?: number) => {
  return getContract({
    abi: CLPositionManagerAbi,
    address: getInfinityPositionManagerAddress('CL', chainId),
    signer,
    chainId,
  })
}

export const getInfinityBinPositionManagerContract = (signer?: WalletClient, chainId?: number) => {
  return getContract({
    abi: BinPositionManagerAbi,
    address: getInfinityPositionManagerAddress('Bin', chainId) ?? '0x',
    signer,
    chainId,
  })
}

export const getV2SSBCakeWrapperContract = (address: Address, signer?: WalletClient, chainId?: number) => {
  return getContract({
    abi: v2BCakeWrapperABI,
    address,
    signer,
    chainId,
  })
}

export const getBCakeProxyContract = (proxyContractAddress: Address, signer?: WalletClient) => {
  return getContract({ abi: bCakeProxyABI, address: proxyContractAddress, signer })
}

export const getCrossFarmingVaultContract = (signer?: WalletClient, chainId?: number) => {
  return getContract({ abi: crossFarmingVaultABI, address: getCrossFarmingVaultAddress(chainId), chainId, signer })
}

export const getSidContract = (address: Address, chainId: number) => {
  return getContract({ abi: sidABI, address, chainId })
}

export const getUnsContract = (address: Address, chainId?: ChainId, publicClient?: PublicClient) => {
  return getContract({
    abi: [
      {
        inputs: [
          {
            internalType: 'address',
            name: 'addr',
            type: 'address',
          },
        ],
        name: 'reverseNameOf',
        outputs: [
          {
            internalType: 'string',
            name: 'reverseUri',
            type: 'string',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      },
    ] as const,
    chainId,
    address,
    publicClient,
  })
}

export const getSidResolverContract = (address: Address, signer?: WalletClient) => {
  return getContract({ abi: SIDResolverABI, address, signer })
}

export const getCrossFarmingSenderContract = (signer?: WalletClient, chainId?: number) => {
  return getContract({
    abi: crossFarmingSenderABI,
    address: getCrossFarmingSenderAddress(chainId),
    chainId,
    signer,
  })
}

export const getCrossFarmingReceiverContract = (signer?: WalletClient, chainId?: number) => {
  return getContract({
    abi: crossFarmingReceiverABI,
    address: getCrossFarmingReceiverAddress(chainId),
    chainId,
    signer,
  })
}

export const getCrossFarmingProxyContract = (
  proxyContractAddress: Address,
  signer?: WalletClient,
  chainId?: number,
) => {
  return getContract({ abi: crossFarmingProxyABI, address: proxyContractAddress, chainId, signer })
}

export const getStableSwapNativeHelperContract = (signer?: WalletClient, chainId?: number) => {
  return getContract({
    abi: stableSwapNativeHelperABI,
    address: getStableSwapNativeHelperAddress(chainId),
    chainId,
    signer,
  })
}

export const getMasterChefContract = (signer?: WalletClient, chainId?: number) => {
  const mcv2Address = getMasterChefV2Address(chainId)
  return mcv2Address
    ? getContract({
        abi: masterChefV2ABI,
        address: mcv2Address,
        chainId,
        signer,
      })
    : null
}

export const getMasterChefV3Contract = (signer?: WalletClient, chainId?: number) => {
  const mcv3Address = getMasterChefV3Address(chainId)
  return mcv3Address
    ? getContract({
        abi: masterChefV3ABI,
        address: mcv3Address,
        chainId,
        signer,
      })
    : null
}

export const getV3MigratorContract = (signer?: WalletClient, chainId?: number) => {
  return getContract({
    abi: v3MigratorABI,
    address: getV3MigratorAddress(chainId),
    chainId,
    signer,
  })
}

export const getV3AirdropContract = (walletClient?: WalletClient) => {
  return getContract({
    abi: v3AirdropABI,
    address: getV3AirdropAddress(),
    signer: walletClient,
  })
}

export const getAffiliateProgramContract = (signer?: WalletClient, chainId?: number) => {
  return getContract({
    abi: affiliateProgramABI,
    address: getAffiliateProgramAddress(chainId),
    chainId,
    signer,
  })
}

export const getVCakeContract = (signer?: WalletClient, chainId?: number) => {
  return getContract({
    abi: vCakeABI,
    address: getVCakeAddress(chainId),
    signer,
    chainId,
  })
}

export const getRevenueSharingPoolContract = (signer?: WalletClient, chainId?: number) => {
  return getContract({
    abi: revenueSharingPoolABI,
    address: getRevenueSharingPoolAddress(chainId),
    signer,
    chainId,
  })
}

export const getAnniversaryAchievementContract = (signer?: WalletClient, chainId?: number) => {
  return getContract({
    abi: anniversaryAchievementABI,
    address: getAnniversaryAchievementAddress(chainId),
  })
}

export const getFixedStakingContract = (signer?: WalletClient, chainId?: number) => {
  return getContract({
    abi: fixedStakingABI,
    address: getFixedStakingAddress(chainId),
    signer,
    chainId,
  })
}

export const getVeCakeContract: GetContractFn<typeof veCakeABI, WalletClient> = (
  signer?: WalletClient,
  chainId?: number,
) => {
  return getContract({
    abi: veCakeABI,
    address: getVeCakeAddress(chainId) ?? getVeCakeAddress(ChainId.BSC),
    signer,
    chainId,
  })
}

export const getPancakeVeSenderV2Contract = (signer?: WalletClient, chainId?: number) => {
  return getContract({
    abi: pancakeVeSenderV2ABI,
    address: getPancakeVeSenderV2Address(chainId) ?? getPancakeVeSenderV2Address(ChainId.BSC),
    signer,
    chainId,
  })
}

export const getRevenueSharingCakePoolContract = (signer?: WalletClient, chainId?: number) => {
  return getContract({
    abi: revenueSharingPoolProxyABI,
    address: getRevenueSharingCakePoolAddress(chainId) ?? getRevenueSharingCakePoolAddress(ChainId.BSC),
    signer,
    chainId,
  })
}

export const getRevenueSharingVeCakeContract = (signer?: WalletClient, chainId?: number) => {
  return getContract({
    abi: revenueSharingPoolProxyABI,
    address: getRevenueSharingVeCakeAddress(chainId) ?? getRevenueSharingVeCakeAddress(ChainId.BSC),
    signer,
    chainId,
  })
}

export const getRevenueSharingPoolGatewayContract: GetContractFn<typeof revenueSharingPoolGatewayABI, WalletClient> = (
  signer?: WalletClient,
  chainId?: number,
) => {
  return getContract({
    abi: revenueSharingPoolGatewayABI,
    address: getRevenueSharingPoolGatewayAddress(chainId) ?? getRevenueSharingPoolGatewayAddress(ChainId.BSC),
    signer,
    chainId,
  })
}

export const getCakePoolContract: GetContractFn<typeof cakePoolAbi, WalletClient> = (
  signer?: WalletClient,
  chainId?: number,
) => {
  return getContract({
    abi: cakePoolAbi,
    address: getCakePoolAddress(ChainId.BSC),
    signer,
    chainId,
  })
}

export const getCakePoolV1Contract: GetContractFn<typeof cakeVaultV1ABI, WalletClient> = (
  signer?: WalletClient,
  chainId?: number,
) => {
  return getContract({
    abi: cakeVaultV1ABI,
    address: getCakeVaultV1Address(ChainId.BSC),
    signer,
    chainId,
  })
}

export const getCLLimitOrderHookContract: GetContractFn<typeof clLimitOrderHookABI, WalletClient> = (
  signer?: WalletClient,
  chainId?: number,
) => {
  return getContract({
    abi: clLimitOrderHookABI,
    address: getClLimitOrderHookAddress(chainId),
    signer,
    chainId,
  })
}
