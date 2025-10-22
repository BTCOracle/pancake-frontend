import { useQuery } from '@tanstack/react-query'
import { Token } from '@pancakeswap/swap-sdk-core'
import { CurrencyConfig, IFOConfig } from '../ifov2.types'
import { CAKEPAD_CONFIGS_URL } from '../config'

/**
 * Helper to create a Token from a currency config object
 */
function createTokenFromConfig(config: CurrencyConfig): Token {
  return new Token(config.chainId ?? 56, config.address as `0x${string}`, config.decimals, config.symbol, config.name)
}

/**
 * Transform JSON config to IFOConfig with proper Token objects
 */
function transformJsonToConfig(jsonConfig: any): IFOConfig {
  const config = { ...jsonConfig }

  // Transform presetData currencies to Token objects
  if (config.presetData) {
    if (config.presetData.offeringCurrency) {
      config.presetData.offeringCurrency = createTokenFromConfig(config.presetData.offeringCurrency)
    }
    if (config.presetData.stakeCurrency0) {
      config.presetData.stakeCurrency0 = createTokenFromConfig(config.presetData.stakeCurrency0)
    }
    if (config.presetData.stakeCurrency1) {
      config.presetData.stakeCurrency1 = createTokenFromConfig(config.presetData.stakeCurrency1)
    }
    if (config.presetData.pools) {
      config.presetData.pools = config.presetData.pools.map((pool: any) => ({
        ...pool,
        stakeCurrency: createTokenFromConfig(pool.stakeCurrency),
      }))
    }
  }

  return config as IFOConfig
}

export const useIfoConfigs = () => {
  return useQuery<IFOConfig[]>({
    queryKey: ['cakepad-ifo-configs'],
    queryFn: async () => {
      const response = await fetch(CAKEPAD_CONFIGS_URL)
      if (!response.ok) {
        throw new Error(`Failed to fetch IFO config: ${response.status}`)
      }
      const jsonData = await response.json()
      return jsonData.map(transformJsonToConfig)
    },
    refetchOnMount: true,
    staleTime: 5_000,
  })
}
