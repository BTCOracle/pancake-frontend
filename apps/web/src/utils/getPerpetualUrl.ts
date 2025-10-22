import { ChainId } from '@pancakeswap/chains'
import { perpLangMap } from 'utils/getPerpetualLanguageCode'
import { perpTheme } from 'utils/getPerpetualTheme'

export interface GetPerpetualUrlProps {
  chainId: ChainId | undefined
  languageCode: string | undefined
  isDark: boolean
}

const mapPerpChain = (chainId: ChainId): string => {
  switch (chainId) {
    case ChainId.ETHEREUM:
      return 'ethereum'
    case ChainId.ARBITRUM_ONE:
      return 'arbitrum'
    case ChainId.OPBNB:
      return 'opbnb'
    case ChainId.BASE:
      return 'base'
    default:
      return 'bsc'
  }
}

const supportV1Chains: ChainId[] = [ChainId.ETHEREUM]

export const getPerpetualUrl = ({ chainId, isDark }: GetPerpetualUrlProps) => {
  if (!chainId) {
    return '/perp/v2/BTCUSD'
  }

  const perpChain = mapPerpChain(chainId)
  const version = supportV1Chains.includes(chainId) ? '' : 'v2/'
  return `/perp/${version}BTCUSD?theme=${perpTheme(isDark)}&chain=${perpChain}`
}
