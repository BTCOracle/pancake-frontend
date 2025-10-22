import { type Currency } from '@pancakeswap/swap-sdk-core'
import { BridgeTradeError } from 'quoter/quoter.types'
import { type Route } from 'views/Swap/Bridge/api'
import { isSolana } from '@pancakeswap/chains'
import { PatternType } from '../types'

export class BridgeTokenResolver {
  static classifyTokenSupport(
    routes: Route[],
    baseCurrency: Currency,
    quoteCurrency: Currency,
  ): {
    isOriginTokenSupported: Route | undefined
    isDestinationTokenSupported: Route | undefined
  } {
    const isOriginTokenSupported = routes.find(
      (route) => route.originChainId === baseCurrency.chainId && route.originToken === baseCurrency.wrapped.address,
    )

    const isDestinationTokenSupported = routes.find(
      (route) =>
        route.destinationChainId === quoteCurrency.chainId && route.destinationToken === quoteCurrency.wrapped.address,
    )

    return { isOriginTokenSupported, isDestinationTokenSupported }
  }

  static determinePattern(routes: Route[], baseCurrency: Currency, quoteCurrency: Currency): PatternType {
    // if origin chain or destination chain is solana, return BRIDGE_SOLANA_EVM
    if (isSolana(baseCurrency.chainId) || isSolana(quoteCurrency.chainId)) {
      return PatternType.BRIDGE_SOLANA_EVM
    }

    const { isOriginTokenSupported, isDestinationTokenSupported } = this.classifyTokenSupport(
      routes,
      baseCurrency,
      quoteCurrency,
    )

    // Bridge only - both tokens supported and same bridge token
    if (
      isOriginTokenSupported &&
      isDestinationTokenSupported &&
      isOriginTokenSupported.originToken === isDestinationTokenSupported.originToken
    ) {
      return PatternType.BRIDGE_ONLY
    }

    // Bridge to swap - origin supported, hanle both cases
    // 1. both origin and destination are supported
    // 2. only origin is supported
    if (isOriginTokenSupported) {
      return PatternType.BRIDGE_TO_SWAP
    }

    // Swap to bridge - origin not supported, destination supported
    if (isDestinationTokenSupported) {
      return PatternType.SWAP_TO_BRIDGE
    }

    // Swap to bridge to swap - neither supported
    if (!isOriginTokenSupported && !isDestinationTokenSupported) {
      return PatternType.SWAP_TO_BRIDGE_TO_SWAP
    }

    throw new BridgeTradeError('Unable to determine bridge type')
  }
}
