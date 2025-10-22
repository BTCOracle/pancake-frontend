import { OrderType } from '@pancakeswap/price-api-sdk'
import { RouteType } from '@pancakeswap/smart-router'
import { CurrencyAmount, Currency, TradeType, UnifiedCurrencyAmount } from '@pancakeswap/swap-sdk-core'
import { atomFamily } from 'jotai/utils'
import { BridgeTradeError } from 'quoter/quoter.types'
import { getTokenAddress, postMetadata } from 'views/Swap/Bridge/api'
import { BridgeMetadataParams } from 'views/Swap/Bridge/types'
import { InterfaceOrder } from 'views/Swap/utils'
import { atomWithLoadable } from './atomWithLoadable'

export const bridgeOnlyQuoteAtom = atomFamily(
  (params: BridgeMetadataParams) =>
    atomWithLoadable(async (get) => {
      const { inputAmount, outputCurrency } = params

      // by default, recipientOnDestChain will be account address
      // metadata endpoint only receive either both recipientOnDestChain and commands or none of them
      const postBridgeSwapParams =
        params.recipientOnDestChain && params.commands
          ? {
              recipientOnDestChain: params.recipientOnDestChain,
              commands: params.commands,
            }
          : {}

      const metadata = await postMetadata({
        inputToken: getTokenAddress(inputAmount.currency),
        originChainId: inputAmount.currency.chainId,
        outputToken: getTokenAddress(outputCurrency),
        destinationChainId: outputCurrency.chainId,
        amount: inputAmount.quotient.toString(),
        commands: postBridgeSwapParams.commands,
        recipientOnDestChain: postBridgeSwapParams.recipientOnDestChain,
      })

      if (!metadata.supported) {
        throw new BridgeTradeError(metadata?.reason || metadata?.error?.message || 'Unknown error')
      }

      const outputAmount = UnifiedCurrencyAmount.fromRawAmount(
        outputCurrency,
        metadata.bridgeTransactionData.outputAmount,
      ) as CurrencyAmount<Currency>

      const bridgeFee = CurrencyAmount.fromRawAmount(inputAmount.currency, metadata.bridgeTransactionData.totalRelayFee)

      const bridgeQuote: InterfaceOrder = {
        bridgeTransactionData: metadata.bridgeTransactionData,
        bridgeFee,
        expectedFillTimeSec: metadata.expectedFillTimeSec ? Number.parseInt(metadata.expectedFillTimeSec) : 0,
        type: OrderType.PCS_BRIDGE,
        trade: {
          inputAmount,
          outputAmount,
          routes: [
            {
              path: [inputAmount.currency, outputAmount.currency],
              inputAmount,
              outputAmount,
              type: RouteType.BRIDGE,
            },
          ],
          tradeType: TradeType.EXACT_INPUT,
        },
      }

      return bridgeQuote
    }),
  // add Equality check for BridgeMetadataParams
  (a, b) =>
    a.inputAmount.quotient.toString() === b.inputAmount.quotient.toString() &&
    a.outputCurrency.wrapped.address === b.outputCurrency.wrapped.address &&
    a.nonce === b.nonce &&
    a.recipientOnDestChain === b.recipientOnDestChain,
)
