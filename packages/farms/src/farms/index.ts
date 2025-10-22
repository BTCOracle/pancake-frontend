import { ChainId } from '@pancakeswap/chains'
import { fetchUniversalFarms } from '../fetchUniversalFarms'
import { UniversalFarmConfig } from '../types'
import { getFarmConfigKey } from '../utils'
import { bscTestnetFarmConfig } from './bscTestnet'
import { zkSyncTestnetFarmConfig } from './zkSyncTestnet'

const chainIds: ChainId[] = [
  ChainId.BSC,
  ChainId.ETHEREUM,
  ChainId.ZKSYNC,
  ChainId.ARBITRUM_ONE,
  ChainId.LINEA,
  ChainId.BASE,
  ChainId.OPBNB,
]

export const fetchAllUniversalFarms = async (): Promise<UniversalFarmConfig[]> => {
  try {
    const farmPromises = chainIds.map((chainId) => fetchUniversalFarms(chainId))
    const results = await Promise.allSettled(farmPromises)
    const allFarms = results.flatMap((result) => {
      if (result.status === 'fulfilled') return result.value
      return []
    })
    const combinedFarms = allFarms.flat()

    return combinedFarms
  } catch (error) {
    return []
  }
}

export const fetchAllUniversalFarmsMap = async (): Promise<Record<string, UniversalFarmConfig>> => {
  try {
    const farmConfig = await fetchAllUniversalFarms()

    return farmConfig.reduce((acc, farm) => {
      const key = getFarmConfigKey(farm)
      // eslint-disable-next-line no-param-reassign
      acc[key] = farm
      return acc
    }, {} as Record<string, UniversalFarmConfig>)
  } catch (error) {
    console.error('Failed to fetch universal farms map:', error)
    return {}
  }
}

export const UNIVERSAL_FARMS_WITH_TESTNET: UniversalFarmConfig[] = [...bscTestnetFarmConfig, ...zkSyncTestnetFarmConfig]
